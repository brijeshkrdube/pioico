from fastapi import FastAPI, APIRouter, HTTPException, Depends, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
import base64
import hashlib
from web3 import Web3
import httpx
import asyncio

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(title="PIOGOLD ICO Platform API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer(auto_error=False)
JWT_SECRET = os.environ.get('JWT_SECRET', 'piogold-jwt-secret-key-2024')
JWT_ALGORITHM = 'HS256'

# Blockchain Config
BSC_RPC = "https://bsc-dataseed.binance.org"
PIOGOLD_RPC = "https://datasheed.pioscan.com"
USDT_CONTRACT = "0x55d398326f99059fF775485246999027B3197955"
PIOGOLD_CHAIN_ID = 42357
BSC_CHAIN_ID = 56

# Web3 instances
bsc_w3 = Web3(Web3.HTTPProvider(BSC_RPC))
piogold_w3 = Web3(Web3.HTTPProvider(PIOGOLD_RPC))

# AES Encryption key (32 bytes for AES-256)
AES_KEY = hashlib.sha256(os.environ.get('AES_SECRET', 'piogold-aes-256-encryption-key').encode()).digest()

# USDT ABI (minimal for transfer verification)
USDT_ABI = [
    {"constant": True, "inputs": [{"name": "_owner", "type": "address"}], "name": "balanceOf", "outputs": [{"name": "balance", "type": "uint256"}], "type": "function"},
    {"constant": True, "inputs": [], "name": "decimals", "outputs": [{"name": "", "type": "uint8"}], "type": "function"},
]

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

class UserCreate(BaseModel):
    wallet_address: str
    referrer_code: Optional[str] = None

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    wallet_address: str
    referral_code: str
    referrer_id: Optional[str] = None
    created_at: str
    total_purchased_usdt: float = 0
    total_pio_received: float = 0

class AdminLogin(BaseModel):
    username: str
    password: str

class AdminCreate(BaseModel):
    username: str
    password: str
    email: str

class GoldPriceUpdate(BaseModel):
    price_per_gram: float

class OfferCreate(BaseModel):
    min_usdt: float
    max_usdt: float
    discount_percent: float
    validity_days: int
    is_active: bool = True

class OfferResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    min_usdt: float
    max_usdt: float
    discount_percent: float
    validity_days: int
    is_active: bool
    created_at: str

class OrderCreate(BaseModel):
    wallet_address: str
    usdt_amount: float
    tx_hash: str

class OrderResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    wallet_address: str
    usdt_amount: float
    gold_price: float
    base_pio: float
    discount_percent: float
    bonus_pio: float
    total_pio: float
    usdt_tx_hash: str
    pio_tx_hash: Optional[str] = None
    status: str
    created_at: str

class TransactionResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    order_id: str
    type: str
    from_address: str
    to_address: str
    amount: float
    tx_hash: str
    chain: str
    status: str
    created_at: str

class ReferralResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    referrer_id: str
    referee_id: str
    order_id: str
    level: int
    reward_usdt: float
    reward_pio: float
    status: str
    created_at: str

class AdminSettingsUpdate(BaseModel):
    gold_price_per_gram: Optional[float] = None
    ico_start_date: Optional[str] = None
    ico_active: Optional[bool] = None
    ico_wallet_address: Optional[str] = None
    encrypted_private_key: Optional[str] = None

class AdminSettingsResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    gold_price_per_gram: float
    ico_start_date: str
    ico_active: bool
    ico_wallet_address: str
    has_private_key: bool

class PurchaseCalculation(BaseModel):
    usdt_amount: float

class PurchaseCalculationResponse(BaseModel):
    usdt_amount: float
    gold_price: float
    base_pio: float
    discount_percent: float
    bonus_pio: float
    total_pio: float
    discount_tier: Optional[str] = None

class ReferralPayoutUpdate(BaseModel):
    status: str  # "approved" or "paid"

# ==================== HELPER FUNCTIONS ====================

def encrypt_private_key(private_key: str) -> str:
    """Encrypt private key with AES-256"""
    cipher = AES.new(AES_KEY, AES.MODE_CBC)
    ct_bytes = cipher.encrypt(pad(private_key.encode(), AES.block_size))
    iv = base64.b64encode(cipher.iv).decode('utf-8')
    ct = base64.b64encode(ct_bytes).decode('utf-8')
    return f"{iv}:{ct}"

def decrypt_private_key(encrypted: str) -> str:
    """Decrypt private key"""
    try:
        iv, ct = encrypted.split(':')
        iv = base64.b64decode(iv)
        ct = base64.b64decode(ct)
        cipher = AES.new(AES_KEY, AES.MODE_CBC, iv)
        pt = unpad(cipher.decrypt(ct), AES.block_size)
        return pt.decode('utf-8')
    except Exception as e:
        logger.error(f"Decryption error: {e}")
        raise HTTPException(status_code=500, detail="Failed to decrypt private key")

def generate_referral_code() -> str:
    """Generate unique referral code"""
    return str(uuid.uuid4())[:8].upper()

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_token(data: dict, expires_delta: timedelta = timedelta(hours=24)) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        admin_id = payload.get("sub")
        if admin_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        admin = await db.admins.find_one({"id": admin_id}, {"_id": 0})
        if not admin:
            raise HTTPException(status_code=401, detail="Admin not found")
        return admin
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_admin_settings():
    settings = await db.admin_settings.find_one({}, {"_id": 0})
    if not settings:
        # Initialize default settings
        settings = {
            "id": str(uuid.uuid4()),
            "gold_price_per_gram": 85.0,  # Default gold price in USD
            "ico_start_date": datetime.now(timezone.utc).isoformat(),
            "ico_active": True,
            "ico_wallet_address": "",
            "encrypted_private_key": "",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.admin_settings.insert_one(settings)
    return settings

async def get_applicable_discount(usdt_amount: float) -> tuple:
    """Get applicable discount based on amount and ICO validity"""
    settings = await get_admin_settings()
    ico_start = datetime.fromisoformat(settings["ico_start_date"].replace('Z', '+00:00'))
    days_since_start = (datetime.now(timezone.utc) - ico_start).days
    
    # Find applicable offer
    offers = await db.offers.find({"is_active": True}, {"_id": 0}).sort("min_usdt", -1).to_list(100)
    
    for offer in offers:
        if offer["min_usdt"] <= usdt_amount <= offer["max_usdt"]:
            if days_since_start <= offer["validity_days"]:
                return offer["discount_percent"], f"${offer['min_usdt']}-${offer['max_usdt']} ({offer['discount_percent']}% bonus)"
    
    return 0, None

async def calculate_referral_rewards(order_id: str, user_id: str, usdt_amount: float, gold_price: float):
    """Calculate 3-level referral rewards"""
    referral_rates = [0.10, 0.05, 0.03]  # Level 1: 10%, Level 2: 5%, Level 3: 3%
    
    current_user_id = user_id
    for level in range(1, 4):
        user = await db.users.find_one({"id": current_user_id}, {"_id": 0})
        if not user or not user.get("referrer_id"):
            break
        
        referrer_id = user["referrer_id"]
        reward_usdt = usdt_amount * referral_rates[level - 1]
        reward_pio = reward_usdt / gold_price
        
        referral = {
            "id": str(uuid.uuid4()),
            "referrer_id": referrer_id,
            "referee_id": user_id,
            "order_id": order_id,
            "level": level,
            "usdt_amount": usdt_amount,
            "reward_usdt": reward_usdt,
            "reward_pio": reward_pio,
            "status": "pending",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.referrals.insert_one(referral)
        
        current_user_id = referrer_id

async def verify_usdt_transaction(tx_hash: str, expected_amount: float, expected_recipient: str) -> dict:
    """Verify USDT transaction on BSC"""
    try:
        tx = bsc_w3.eth.get_transaction(tx_hash)
        receipt = bsc_w3.eth.get_transaction_receipt(tx_hash)
        
        if receipt['status'] != 1:
            return {"valid": False, "error": "Transaction failed"}
        
        # Check if it's a USDT contract call
        if tx['to'] and tx['to'].lower() != USDT_CONTRACT.lower():
            return {"valid": False, "error": "Not a USDT transaction"}
        
        # Get input data as hex string
        input_data = tx['input']
        if isinstance(input_data, bytes):
            input_data = '0x' + input_data.hex()
        elif not input_data.startswith('0x'):
            input_data = '0x' + input_data
        
        # Decode transfer data
        if len(input_data) >= 138:
            method_id = input_data[:10].lower()
            if method_id == '0xa9059cbb':  # transfer method
                # Extract recipient (padded to 32 bytes, address is last 20 bytes)
                recipient_hex = input_data[10:74]
                recipient = '0x' + recipient_hex[-40:]  # Last 40 hex chars = 20 bytes
                
                # Extract amount
                amount_hex = input_data[74:138]
                amount = int(amount_hex, 16) / 10**18
                
                logger.info(f"TX decoded: recipient={recipient}, amount={amount}, expected_recipient={expected_recipient}")
                
                if recipient.lower() != expected_recipient.lower():
                    return {"valid": False, "error": f"Wrong recipient: expected {expected_recipient}, got {recipient}"}
                
                if amount < expected_amount * 0.99:  # Allow 1% tolerance
                    return {"valid": False, "error": f"Amount mismatch: expected {expected_amount}, got {amount}"}
                
                return {"valid": True, "amount": amount, "from": tx['from'], "to": recipient}
        
        return {"valid": False, "error": f"Could not decode transaction, input length: {len(input_data)}"}
    except Exception as e:
        logger.error(f"TX verification error: {e}")
        return {"valid": False, "error": str(e)}

async def send_pio_native(recipient: str, amount: float) -> dict:
    """Send PIO native coin to user"""
    try:
        settings = await get_admin_settings()
        if not settings.get("encrypted_private_key"):
            return {"success": False, "error": "Admin private key not configured"}
        
        private_key = decrypt_private_key(settings["encrypted_private_key"])
        account = piogold_w3.eth.account.from_key(private_key)
        
        nonce = piogold_w3.eth.get_transaction_count(account.address)
        gas_price = piogold_w3.eth.gas_price
        
        amount_wei = int(amount * 10**18)
        
        tx = {
            'nonce': nonce,
            'to': Web3.to_checksum_address(recipient),
            'value': amount_wei,
            'gas': 21000,
            'gasPrice': gas_price,
            'chainId': PIOGOLD_CHAIN_ID
        }
        
        signed_tx = piogold_w3.eth.account.sign_transaction(tx, private_key)
        tx_hash = piogold_w3.eth.send_raw_transaction(signed_tx.raw_transaction)
        
        return {"success": True, "tx_hash": tx_hash.hex()}
    except Exception as e:
        logger.error(f"PIO transfer error: {e}")
        return {"success": False, "error": str(e)}

# ==================== PUBLIC ENDPOINTS ====================

@api_router.get("/")
async def root():
    return {"message": "PIOGOLD ICO Platform API", "version": "1.0.0"}

@api_router.get("/health")
async def health():
    return {
        "status": "healthy",
        "bsc_connected": bsc_w3.is_connected(),
        "piogold_connected": piogold_w3.is_connected()
    }

@api_router.get("/settings/public")
async def get_public_settings():
    """Get public ICO settings"""
    settings = await get_admin_settings()
    
    # Get active offers
    offers = await db.offers.find({"is_active": True}, {"_id": 0}).sort("min_usdt", 1).to_list(100)
    
    ico_start = datetime.fromisoformat(settings["ico_start_date"].replace('Z', '+00:00'))
    days_since_start = (datetime.now(timezone.utc) - ico_start).days
    
    return {
        "gold_price_per_gram": settings["gold_price_per_gram"],
        "ico_active": settings["ico_active"],
        "ico_wallet_address": settings["ico_wallet_address"],
        "days_since_start": days_since_start,
        "offers": offers
    }

@api_router.post("/calculate-purchase", response_model=PurchaseCalculationResponse)
async def calculate_purchase(data: PurchaseCalculation):
    """Calculate PIO for a given USDT amount"""
    settings = await get_admin_settings()
    gold_price = settings["gold_price_per_gram"]
    
    base_pio = data.usdt_amount / gold_price
    discount_percent, discount_tier = await get_applicable_discount(data.usdt_amount)
    bonus_pio = base_pio * (discount_percent / 100)
    total_pio = base_pio + bonus_pio
    
    return PurchaseCalculationResponse(
        usdt_amount=data.usdt_amount,
        gold_price=gold_price,
        base_pio=round(base_pio, 8),
        discount_percent=discount_percent,
        bonus_pio=round(bonus_pio, 8),
        total_pio=round(total_pio, 8),
        discount_tier=discount_tier
    )

@api_router.post("/users/register", response_model=UserResponse)
async def register_user(data: UserCreate):
    """Register or get existing user by wallet"""
    wallet = data.wallet_address.lower()
    
    # Check if user exists
    existing = await db.users.find_one({"wallet_address": wallet}, {"_id": 0})
    if existing:
        return UserResponse(**existing)
    
    # NEW: Require referral code for new registrations
    if not data.referrer_code:
        raise HTTPException(status_code=400, detail="Referral code is required for registration")
    
    # Find referrer - must exist
    referrer = await db.users.find_one({"referral_code": data.referrer_code.upper()}, {"_id": 0})
    if not referrer:
        raise HTTPException(status_code=400, detail="Invalid referral code")
    
    referrer_id = referrer["id"]
    
    user = {
        "id": str(uuid.uuid4()),
        "wallet_address": wallet,
        "referral_code": generate_referral_code(),
        "referrer_id": referrer_id,
        "total_purchased_usdt": 0,
        "total_pio_received": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user)
    return UserResponse(**user)

@api_router.get("/users/{wallet_address}", response_model=UserResponse)
async def get_user(wallet_address: str):
    """Get user by wallet address"""
    wallet = wallet_address.lower()
    user = await db.users.find_one({"wallet_address": wallet}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse(**user)

@api_router.get("/users/{wallet_address}/orders")
async def get_user_orders(wallet_address: str):
    """Get orders for a user"""
    wallet = wallet_address.lower()
    orders = await db.orders.find({"wallet_address": wallet}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return orders

@api_router.get("/users/{wallet_address}/referrals")
async def get_user_referrals(wallet_address: str):
    """Get referral info for a user"""
    wallet = wallet_address.lower()
    user = await db.users.find_one({"wallet_address": wallet}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get referrals where this user is the referrer
    referrals = await db.referrals.find({"referrer_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    # Get referred users
    referred_users = await db.users.find({"referrer_id": user["id"]}, {"_id": 0}).to_list(100)
    
    # Calculate totals by level
    level_stats = {1: {"count": 0, "earnings": 0}, 2: {"count": 0, "earnings": 0}, 3: {"count": 0, "earnings": 0}}
    for ref in referrals:
        level = ref["level"]
        if level in level_stats:
            level_stats[level]["count"] += 1
            level_stats[level]["earnings"] += ref["reward_pio"]
    
    total_earnings = sum(ref["reward_pio"] for ref in referrals if ref["status"] in ["approved", "paid"])
    pending_earnings = sum(ref["reward_pio"] for ref in referrals if ref["status"] == "pending")
    
    return {
        "referral_code": user["referral_code"],
        "total_referrals": len(referred_users),
        "level_stats": level_stats,
        "total_earnings_pio": round(total_earnings, 8),
        "pending_earnings_pio": round(pending_earnings, 8),
        "recent_referrals": referrals[:10]
    }

@api_router.post("/orders/create")
async def create_order(data: OrderCreate, background_tasks: BackgroundTasks):
    """Create a new purchase order"""
    settings = await get_admin_settings()
    
    if not settings["ico_active"]:
        raise HTTPException(status_code=400, detail="ICO is currently paused")
    
    if not settings["ico_wallet_address"]:
        raise HTTPException(status_code=400, detail="ICO wallet not configured")
    
    # Check for duplicate tx hash
    existing = await db.orders.find_one({"usdt_tx_hash": data.tx_hash})
    if existing:
        raise HTTPException(status_code=400, detail="Transaction already processed")
    
    # Get or create user
    wallet = data.wallet_address.lower()
    user = await db.users.find_one({"wallet_address": wallet}, {"_id": 0})
    if not user:
        user = {
            "id": str(uuid.uuid4()),
            "wallet_address": wallet,
            "referral_code": generate_referral_code(),
            "referrer_id": None,
            "total_purchased_usdt": 0,
            "total_pio_received": 0,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user)
    
    gold_price = settings["gold_price_per_gram"]
    base_pio = data.usdt_amount / gold_price
    discount_percent, _ = await get_applicable_discount(data.usdt_amount)
    bonus_pio = base_pio * (discount_percent / 100)
    total_pio = base_pio + bonus_pio
    
    order = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "wallet_address": wallet,
        "usdt_amount": data.usdt_amount,
        "gold_price": gold_price,
        "base_pio": round(base_pio, 8),
        "discount_percent": discount_percent,
        "bonus_pio": round(bonus_pio, 8),
        "total_pio": round(total_pio, 8),
        "usdt_tx_hash": data.tx_hash,
        "pio_tx_hash": None,
        "status": "pending_verification",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.orders.insert_one(order)
    
    # Create USDT transaction record
    usdt_tx = {
        "id": str(uuid.uuid4()),
        "order_id": order["id"],
        "type": "usdt_payment",
        "from_address": wallet,
        "to_address": settings["ico_wallet_address"],
        "amount": data.usdt_amount,
        "tx_hash": data.tx_hash,
        "chain": "bsc",
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.transactions.insert_one(usdt_tx)
    
    # Background task to verify and process
    background_tasks.add_task(process_order, order["id"])
    
    return {"order_id": order["id"], "status": "pending_verification", "total_pio": round(total_pio, 8)}

async def process_order(order_id: str):
    """Background task to verify USDT and send PIO"""
    await asyncio.sleep(5)  # Wait for blockchain confirmation
    
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        return
    
    settings = await get_admin_settings()
    
    # Verify USDT transaction
    verification = await verify_usdt_transaction(
        order["usdt_tx_hash"],
        order["usdt_amount"],
        settings["ico_wallet_address"]
    )
    
    if not verification["valid"]:
        await db.orders.update_one(
            {"id": order_id},
            {"$set": {"status": "verification_failed", "error": verification.get("error")}}
        )
        await db.transactions.update_one(
            {"order_id": order_id, "type": "usdt_payment"},
            {"$set": {"status": "failed"}}
        )
        return
    
    # Update USDT transaction status
    await db.transactions.update_one(
        {"order_id": order_id, "type": "usdt_payment"},
        {"$set": {"status": "confirmed"}}
    )
    
    # Send PIO
    pio_result = await send_pio_native(order["wallet_address"], order["total_pio"])
    
    if pio_result["success"]:
        await db.orders.update_one(
            {"id": order_id},
            {"$set": {
                "status": "completed",
                "pio_tx_hash": pio_result["tx_hash"]
            }}
        )
        
        # Create PIO transaction record
        pio_tx = {
            "id": str(uuid.uuid4()),
            "order_id": order_id,
            "type": "pio_transfer",
            "from_address": settings["ico_wallet_address"],
            "to_address": order["wallet_address"],
            "amount": order["total_pio"],
            "tx_hash": pio_result["tx_hash"],
            "chain": "piogold",
            "status": "confirmed",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.transactions.insert_one(pio_tx)
        
        # Update user totals
        await db.users.update_one(
            {"id": order["user_id"]},
            {"$inc": {
                "total_purchased_usdt": order["usdt_amount"],
                "total_pio_received": order["total_pio"]
            }}
        )
        
        # Calculate referral rewards
        await calculate_referral_rewards(
            order_id, order["user_id"], order["usdt_amount"], order["gold_price"]
        )
    else:
        await db.orders.update_one(
            {"id": order_id},
            {"$set": {"status": "pio_transfer_failed", "error": pio_result.get("error")}}
        )

@api_router.get("/orders/{order_id}/status")
async def get_order_status(order_id: str):
    """Get order status"""
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

# ==================== ADMIN ENDPOINTS ====================

@api_router.post("/admin/login")
async def admin_login(data: AdminLogin):
    """Admin login"""
    admin = await db.admins.find_one({"username": data.username}, {"_id": 0})
    if not admin:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(data.password, admin["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token({"sub": admin["id"], "username": admin["username"]})
    return {"access_token": token, "token_type": "bearer"}

@api_router.post("/admin/setup")
async def setup_admin(data: AdminCreate):
    """Create first admin (only works if no admins exist)"""
    existing = await db.admins.find_one({})
    if existing:
        raise HTTPException(status_code=400, detail="Admin already exists. Use login.")
    
    admin = {
        "id": str(uuid.uuid4()),
        "username": data.username,
        "email": data.email,
        "password_hash": hash_password(data.password),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.admins.insert_one(admin)
    
    # Initialize default offers
    default_offers = [
        {"min_usdt": 800, "max_usdt": 1000, "discount_percent": 20, "validity_days": 15},
        {"min_usdt": 500, "max_usdt": 799, "discount_percent": 15, "validity_days": 30},
        {"min_usdt": 300, "max_usdt": 499, "discount_percent": 10, "validity_days": 45},
        {"min_usdt": 50, "max_usdt": 299, "discount_percent": 5, "validity_days": 60},
    ]
    
    for offer_data in default_offers:
        offer = {
            "id": str(uuid.uuid4()),
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            **offer_data
        }
        await db.offers.insert_one(offer)
    
    token = create_token({"sub": admin["id"], "username": admin["username"]})
    return {"message": "Admin created", "access_token": token, "token_type": "bearer"}

@api_router.get("/admin/settings", response_model=AdminSettingsResponse)
async def get_admin_settings_endpoint(admin = Depends(get_current_admin)):
    """Get admin settings"""
    settings = await get_admin_settings()
    return AdminSettingsResponse(
        gold_price_per_gram=settings["gold_price_per_gram"],
        ico_start_date=settings["ico_start_date"],
        ico_active=settings["ico_active"],
        ico_wallet_address=settings.get("ico_wallet_address", ""),
        has_private_key=bool(settings.get("encrypted_private_key"))
    )

@api_router.put("/admin/settings")
async def update_admin_settings(data: AdminSettingsUpdate, admin = Depends(get_current_admin)):
    """Update admin settings"""
    update_data = {"updated_at": datetime.now(timezone.utc).isoformat()}
    
    if data.gold_price_per_gram is not None:
        update_data["gold_price_per_gram"] = data.gold_price_per_gram
    if data.ico_start_date is not None:
        update_data["ico_start_date"] = data.ico_start_date
    if data.ico_active is not None:
        update_data["ico_active"] = data.ico_active
    if data.ico_wallet_address is not None:
        update_data["ico_wallet_address"] = data.ico_wallet_address
    if data.encrypted_private_key is not None:
        # Encrypt the private key before storing
        update_data["encrypted_private_key"] = encrypt_private_key(data.encrypted_private_key)
    
    await db.admin_settings.update_one({}, {"$set": update_data})
    return {"message": "Settings updated"}

@api_router.post("/admin/ico/pause")
async def pause_ico(admin = Depends(get_current_admin)):
    """Emergency ICO pause"""
    await db.admin_settings.update_one({}, {"$set": {"ico_active": False}})
    return {"message": "ICO paused"}

@api_router.post("/admin/ico/resume")
async def resume_ico(admin = Depends(get_current_admin)):
    """Resume ICO"""
    await db.admin_settings.update_one({}, {"$set": {"ico_active": True}})
    return {"message": "ICO resumed"}

@api_router.get("/admin/offers")
async def get_offers(admin = Depends(get_current_admin)):
    """Get all offers"""
    offers = await db.offers.find({}, {"_id": 0}).sort("min_usdt", 1).to_list(100)
    return offers

@api_router.post("/admin/offers")
async def create_offer(data: OfferCreate, admin = Depends(get_current_admin)):
    """Create new offer"""
    offer = {
        "id": str(uuid.uuid4()),
        "min_usdt": data.min_usdt,
        "max_usdt": data.max_usdt,
        "discount_percent": data.discount_percent,
        "validity_days": data.validity_days,
        "is_active": data.is_active,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.offers.insert_one(offer)
    return offer

@api_router.put("/admin/offers/{offer_id}")
async def update_offer(offer_id: str, data: OfferCreate, admin = Depends(get_current_admin)):
    """Update offer"""
    result = await db.offers.update_one(
        {"id": offer_id},
        {"$set": {
            "min_usdt": data.min_usdt,
            "max_usdt": data.max_usdt,
            "discount_percent": data.discount_percent,
            "validity_days": data.validity_days,
            "is_active": data.is_active
        }}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Offer not found")
    return {"message": "Offer updated"}

@api_router.delete("/admin/offers/{offer_id}")
async def delete_offer(offer_id: str, admin = Depends(get_current_admin)):
    """Delete offer"""
    result = await db.offers.delete_one({"id": offer_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Offer not found")
    return {"message": "Offer deleted"}

@api_router.get("/admin/orders")
async def get_all_orders(admin = Depends(get_current_admin), status: Optional[str] = None, limit: int = 100):
    """Get all orders"""
    query = {}
    if status:
        query["status"] = status
    orders = await db.orders.find(query, {"_id": 0}).sort("created_at", -1).to_list(limit)
    return orders

@api_router.get("/admin/transactions")
async def get_all_transactions(admin = Depends(get_current_admin), chain: Optional[str] = None, limit: int = 100):
    """Get all transactions"""
    query = {}
    if chain:
        query["chain"] = chain
    transactions = await db.transactions.find(query, {"_id": 0}).sort("created_at", -1).to_list(limit)
    return transactions

@api_router.get("/admin/referrals")
async def get_all_referrals(admin = Depends(get_current_admin), status: Optional[str] = None, limit: int = 100):
    """Get all referrals"""
    query = {}
    if status:
        query["status"] = status
    referrals = await db.referrals.find(query, {"_id": 0}).sort("created_at", -1).to_list(limit)
    return referrals

@api_router.put("/admin/referrals/{referral_id}")
async def update_referral_status(referral_id: str, data: ReferralPayoutUpdate, admin = Depends(get_current_admin)):
    """Update referral payout status"""
    if data.status not in ["approved", "paid", "rejected"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    result = await db.referrals.update_one(
        {"id": referral_id},
        {"$set": {"status": data.status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Referral not found")
    return {"message": f"Referral status updated to {data.status}"}

@api_router.get("/admin/stats")
async def get_stats(admin = Depends(get_current_admin)):
    """Get dashboard statistics"""
    total_users = await db.users.count_documents({})
    total_orders = await db.orders.count_documents({})
    completed_orders = await db.orders.count_documents({"status": "completed"})
    
    # Aggregate totals
    pipeline = [
        {"$match": {"status": "completed"}},
        {"$group": {
            "_id": None,
            "total_usdt": {"$sum": "$usdt_amount"},
            "total_pio": {"$sum": "$total_pio"}
        }}
    ]
    agg_result = await db.orders.aggregate(pipeline).to_list(1)
    totals = agg_result[0] if agg_result else {"total_usdt": 0, "total_pio": 0}
    
    # Pending referrals
    pending_referrals = await db.referrals.count_documents({"status": "pending"})
    pending_referral_amount = 0
    pending_refs = await db.referrals.find({"status": "pending"}, {"_id": 0}).to_list(1000)
    for ref in pending_refs:
        pending_referral_amount += ref["reward_pio"]
    
    return {
        "total_users": total_users,
        "total_orders": total_orders,
        "completed_orders": completed_orders,
        "total_usdt_raised": round(totals.get("total_usdt", 0), 2),
        "total_pio_sold": round(totals.get("total_pio", 0), 8),
        "pending_referrals": pending_referrals,
        "pending_referral_pio": round(pending_referral_amount, 8)
    }

@api_router.get("/admin/users")
async def get_all_users(admin = Depends(get_current_admin), limit: int = 100):
    """Get all users with summary stats"""
    users = await db.users.find({}, {"_id": 0}).sort("created_at", -1).to_list(limit)
    
    # Add direct referral count for each user
    for user in users:
        direct_count = await db.users.count_documents({"referrer_id": user["id"]})
        user["direct_referrals"] = direct_count
    
    return users

@api_router.get("/admin/users/{user_id}/details")
async def get_user_details(user_id: str, admin = Depends(get_current_admin)):
    """Get detailed user info with team and earnings"""
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get user's orders/purchases
    orders = await db.orders.find({"user_id": user_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    # Get direct team (Level 1)
    direct_team = await db.users.find({"referrer_id": user_id}, {"_id": 0}).to_list(100)
    
    # Get Level 2 team
    level2_team = []
    for member in direct_team:
        l2_members = await db.users.find({"referrer_id": member["id"]}, {"_id": 0}).to_list(100)
        level2_team.extend(l2_members)
    
    # Get Level 3 team
    level3_team = []
    for member in level2_team:
        l3_members = await db.users.find({"referrer_id": member["id"]}, {"_id": 0}).to_list(100)
        level3_team.extend(l3_members)
    
    # Get referral earnings
    referral_earnings = await db.referrals.find({"referrer_id": user_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    # Calculate totals by level
    level_earnings = {1: 0, 2: 0, 3: 0}
    for ref in referral_earnings:
        level = ref.get("level", 1)
        if level in level_earnings:
            level_earnings[level] += ref.get("reward_pio", 0)
    
    total_earnings = sum(level_earnings.values())
    pending_earnings = sum(ref.get("reward_pio", 0) for ref in referral_earnings if ref.get("status") == "pending")
    paid_earnings = sum(ref.get("reward_pio", 0) for ref in referral_earnings if ref.get("status") == "paid")
    
    # Get referrer info if exists
    referrer = None
    if user.get("referrer_id"):
        referrer = await db.users.find_one({"id": user["referrer_id"]}, {"_id": 0, "wallet_address": 1, "referral_code": 1})
    
    return {
        "user": user,
        "referrer": referrer,
        "orders": orders,
        "team": {
            "level1": {
                "count": len(direct_team),
                "members": direct_team
            },
            "level2": {
                "count": len(level2_team),
                "members": level2_team
            },
            "level3": {
                "count": len(level3_team),
                "members": level3_team
            },
            "total_team": len(direct_team) + len(level2_team) + len(level3_team)
        },
        "earnings": {
            "level1": round(level_earnings[1], 8),
            "level2": round(level_earnings[2], 8),
            "level3": round(level_earnings[3], 8),
            "total": round(total_earnings, 8),
            "pending": round(pending_earnings, 8),
            "paid": round(paid_earnings, 8),
            "history": referral_earnings[:20]
        }
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
