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

## What's Been Implemented

### Backend (FastAPI + MongoDB)
- [x] User registration with wallet address (mandatory referral code)
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
- [x] Team members management
- [x] Legal documents management
- [x] Whitepaper URL configuration

### Frontend (React + WalletConnect v2)
- [x] Dark theme with gold accents (Moonhouse + Roboto fonts)
- [x] Homepage with ICO status, gold price, features
- [x] NEW: "PIO – Gold-Backed Native Coin" informational section
- [x] NEW: "What Problem Does PIO Solve?" section
- [x] NEW: "Why Is PIO Different?" section
- [x] NEW: Conditional "View Whitepaper" button in hero
- [x] Buy page with real-time PIO calculator
- [x] User dashboard with purchase history
- [x] Referral dashboard with 3-level tree
- [x] Admin login/setup flow
- [x] Admin dashboard with tabs (Settings, Users, Offers, Orders, Referrals, Transactions, Team, Legal)
- [x] NEW: Website Settings card with Whitepaper URL input
- [x] Responsive mobile design
- [x] Dynamic legal pages (Terms, Privacy, Disclaimer)
- [x] Dynamic Meet the Team section

### API Endpoints
- `GET /api/health` - Health check
- `GET /api/settings/public` - Public ICO settings (includes whitepaper_url)
- `POST /api/calculate-purchase` - Calculate PIO for USDT amount
- `POST /api/users/register` - Register user (requires referral code)
- `GET /api/users/{wallet}/orders` - User order history
- `GET /api/users/{wallet}/referrals` - User referral data
- `POST /api/orders/create` - Create purchase order
- `GET /api/orders/{id}/status` - Order status
- `POST /api/admin/setup` - Create first admin
- `POST /api/admin/login` - Admin login
- `GET /api/admin/settings` - Admin settings (protected)
- `PUT /api/admin/settings` - Update settings including whitepaper_url (protected)
- `GET/POST/DELETE /api/admin/team` - Team member management
- `GET/POST/DELETE /api/admin/legal` - Legal document management
- `GET /api/admin/users/{user_id}/details` - Detailed user info with team/earnings

## Prioritized Backlog

### P0 (Completed)
- [x] Core ICO purchase flow
- [x] Admin dashboard
- [x] Wallet connection
- [x] Homepage informational sections
- [x] Admin whitepaper URL configuration

### P1 (Important)
- [ ] Email notifications for purchase confirmation
- [ ] Export transaction reports (CSV)
- [ ] Rate limiting for API endpoints
- [ ] Enhanced Referral Dashboard with analytics

### P2 (Nice to Have)
- [ ] Multi-language support
- [ ] Admin 2FA authentication
- [ ] Gold price API integration (optional)
- [ ] Automated referral payout
- [ ] Explicit Emergency Pause feature

## Technical Stack
- **Backend**: Python FastAPI, MongoDB, Web3.py
- **Frontend**: React 19, WalletConnect v2, wagmi, ethers.js, Tailwind CSS, Shadcn/UI
- **Blockchain**: BSC (USDT BEP20), PIOGOLD Mainnet (PIO native coin)
- **Security**: JWT auth, bcrypt passwords, AES-256 private key encryption

## Deployment Notes
- User deploys to self-managed VPS
- Backend runs on port 8002 (via systemd)
- Nginx as reverse proxy
- See `/app/DEPLOYMENT.md` for full deployment guide
