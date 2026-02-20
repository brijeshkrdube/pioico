# PIOGOLD ICO Platform - Product Requirements Document

## Original Problem Statement
Build a secure, admin-controlled ICO platform for PIOGOLD (PIO), the native coin of the PIOGOLD Mainnet, where users can purchase PIO using USDT (BEP20) via Web3 wallets. Features include gold-backed pricing, discount offers, and a 3-level referral system.

## User Personas
1. **ICO Investor**: Crypto enthusiast looking to buy gold-backed PIO coins
2. **Referral Partner**: User who promotes PIOGOLD and earns referral rewards
3. **Admin**: Platform operator managing gold prices, ICO settings, and transactions

## Core Requirements (Static)
- WalletConnect v2 integration (MetaMask, Trust Wallet, OKX)
- USDT (BEP20) payment on BSC → PIO native coin on PIOGOLD Mainnet
- 1 PIO = 1 gram of gold (admin-controlled price)
- Discount tiers: 20% ($800-1000), 15% ($500-799), 10% ($300-499), 5% ($50-299)
- 3-level referral: 10%, 5%, 3% on USDT spent
- Admin dashboard with JWT auth
- AES-256 encrypted private key storage

## What's Been Implemented (Feb 20, 2026)

### Backend (FastAPI + MongoDB)
- [x] User registration with wallet address
- [x] Unique referral code generation
- [x] Order creation and processing
- [x] USDT transaction verification on BSC
- [x] PIO native coin transfer on PIOGOLD Mainnet
- [x] 3-level referral reward calculation
- [x] Admin authentication (JWT)
- [x] Gold price management
- [x] ICO pause/resume functionality
- [x] Discount offer CRUD
- [x] Transaction audit logs
- [x] AES-256 private key encryption

### Frontend (React + WalletConnect v2)
- [x] Dark theme with gold accents (Playfair Display + Manrope fonts)
- [x] Homepage with ICO status, gold price, features
- [x] Buy page with real-time PIO calculator
- [x] User dashboard with purchase history
- [x] Referral dashboard with 3-level tree
- [x] Admin login/setup flow
- [x] Admin dashboard with tabs (Settings, Offers, Orders, Referrals, Transactions)
- [x] Responsive mobile design
- [x] Legal pages (Terms, Privacy, Disclaimer)

### API Endpoints
- `GET /api/health` - Health check
- `GET /api/settings/public` - Public ICO settings
- `POST /api/calculate-purchase` - Calculate PIO for USDT amount
- `POST /api/users/register` - Register/get user by wallet
- `GET /api/users/{wallet}/orders` - User order history
- `GET /api/users/{wallet}/referrals` - User referral data
- `POST /api/orders/create` - Create purchase order
- `GET /api/orders/{id}/status` - Order status
- `POST /api/admin/setup` - Create first admin
- `POST /api/admin/login` - Admin login
- `GET /api/admin/settings` - Admin settings (protected)
- `PUT /api/admin/settings` - Update settings (protected)
- `GET /api/admin/offers` - List offers (protected)
- `POST /api/admin/offers` - Create offer (protected)
- `GET /api/admin/orders` - All orders (protected)
- `GET /api/admin/transactions` - All transactions (protected)
- `GET /api/admin/referrals` - All referrals (protected)
- `GET /api/admin/stats` - Dashboard stats (protected)

## Prioritized Backlog

### P0 (Required for Launch)
- [x] Core ICO purchase flow
- [x] Admin dashboard
- [x] Wallet connection
- [ ] Configure ICO wallet address (admin action)
- [ ] Configure admin private key (admin action)

### P1 (Important)
- [ ] Email notifications for purchase confirmation
- [ ] Export transaction reports (CSV)
- [ ] Rate limiting for API endpoints

### P2 (Nice to Have)
- [ ] Multi-language support
- [ ] Admin 2FA authentication
- [ ] Gold price API integration (optional)
- [ ] Automated referral payout

## Next Tasks List
1. Admin to configure ICO wallet address in dashboard
2. Admin to set private key (will be AES-256 encrypted)
3. Test full purchase flow with real wallets
4. Consider adding email notifications via SendGrid
5. Add rate limiting to prevent abuse

## Technical Stack
- **Backend**: Python FastAPI, MongoDB, Web3.py
- **Frontend**: React 19, WalletConnect v2, wagmi, ethers.js, Tailwind CSS, Shadcn/UI
- **Blockchain**: BSC (USDT BEP20), PIOGOLD Mainnet (PIO native coin)
- **Security**: JWT auth, bcrypt passwords, AES-256 private key encryption
