# Segregate-to-Earn: AI-Powered Waste Segregation & Tokenized Verification System

A complete, functional web application prototype for college-level innovation projects. Demonstrates source-level waste segregation, AI-assisted classification, QR/RFID verification, and token rewards.

## Overview

**Segregate-to-Earn** is a full-stack prototype that combines:
- **Waste Classification**: Upload images and get simulated AI classification into Organic, Recyclable, or Hazardous categories
- **Deposit Registration**: Log waste with category, weight, bin ID and optional images
- **Verification Engine**: Review deposits and confirm correct segregation; awards tokens only on successful verification
- **Token Wallet**: Configurable demo token rewards (not cryptocurrency); earn and redeem
- **QR/RFID Module**: Generate QR codes and simulate RFID scanning for bin identification
- **Analytics Dashboard**: Real-time metrics, category distribution, daily collection trends, and CSV export
- **Admin Panel**: Review all deposits, filter by status/category/date, and manage verifications

All data persists in SQLite. Every button works. No fake UI.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + SQLite3
- **Charts**: Recharts
- **Icons**: Lucide React
- **QR Codes**: qrcode library
- **Database**: SQLite (file-based, zero setup)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Data Directory

```bash
mkdir -p data
```

### 3. Start Both Server and Client

```bash
npm run dev
```

This will:
- Start the backend server on `http://localhost:3001`
- Start the Vite dev server on `http://localhost:5173`
- Open the app in your browser (usually automatic)

The database will be created automatically at `data/app.db` with demo data on first run.

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **API**: http://localhost:3001/api

## Pages & Features

### Dashboard (`/`)
- Real-time statistics: total waste collected, correctly segregated waste, verifications, tokens awarded
- Segregation accuracy percentage (calculated from verified deposits)
- Waste category distribution pie chart
- Daily waste collection area chart (last 7 days)
- Recent deposit activity feed
- Environmental impact estimates (clearly labeled as estimates)

### Waste Classification (`/classify`)
- Image upload interface
- Simulated AI classification (demo mode clearly marked)
- Confidence score display
- Manual category override
- Subcategory selection (Food Scraps, Paper, Plastic Bottles, Metal Cans, Batteries, etc.)
- Explanation of why category was selected
- Accept/Correct workflow

### Register Deposit (`/deposit`)
- User selection (demo user pre-filled)
- Bin/QR/RFID selection from database
- Category & subcategory dropdowns
- Weight input with validation (must be > 0)
- Optional image upload
- Optional notes
- Server-side validation of all fields
- Success/error messaging with deposit ID

### Verification Engine (`/verification`)
- Displays pending deposits (status: pending)
- Shows deposit details: user, category, weight, bin
- Approve/Reject buttons with confirmation
- Automatically awards tokens on approval (formula: 2 tokens/kg, configurable)
- Updates verification status in database
- Audit logging of all actions
- Prevents duplicate rewards per deposit

### Token Wallet (`/wallet`)
- Current balance (Earned - Redeemed)
- Total earned vs. total redeemed
- Full transaction history with timestamps
- Redeem demo tokens with confirmation
- Balance validation (prevents negative)
- Clear labeling as "prototype tokens" (not real value)
- Transaction details (type, amount, status)

### QR/RFID Module (`/qr-rfid`)
- **QR Code Generator**: Input bin ID/value → generates downloadable QR code
- **QR Scan Simulator**: Simulates scanning a generated QR code
- **RFID Scan Simulator**: Selects random RFID tag from database
- Shows scanned bin ID, accepted waste category, timestamp
- Bin database view (all registered bins, their QR codes, categories, locations)
- Clearly marked as simulated

### Analytics & Reports (`/analytics`)
- **Date Range Filter**: Filter all analytics by start/end date
- **Category-wise Segregation**: Bar chart of verified vs. rejected per category
- **Token Distribution**: Bar chart of tokens earned per category
- **Daily Collection**: 7-day area chart of total verified waste per day
- **Verification vs Rejected**: Overall deposit status breakdown
- **CSV Export**: Download deposit records or token transactions
- All charts are interactive (hover for details)

## Data Model

### Users
- `id`: Unique identifier
- `name`: User display name
- `email`: Optional
- `role`: 'user' or 'admin'
- `created_at`: Timestamp

### Waste Bins
- `id`: Internal ID
- `bin_id`: External identifier (e.g., 'BIN-ORG-001')
- `category`: Organic / Recyclable / Hazardous
- `location`: Physical location
- `qr_code`: QR code identifier
- `created_at`: Timestamp

### Waste Deposits
- `id`: Unique deposit ID
- `user_id`: Foreign key to users
- `bin_id`: Foreign key to waste bins
- `category`: User-selected category
- `subcategory`: Specific type
- `weight`: In kilograms (must be > 0)
- `image_url`: Optional image URL
- `predicted_category`: AI classification result (if available)
- `confidence`: Confidence score (0-1)
- `notes`: Optional notes
- `status`: pending / verified / rejected / needs_review
- `created_at` / `updated_at`: Timestamps

### Verification Records
- `id`: Unique ID
- `deposit_id`: Foreign key to deposits
- `verified_by`: Admin user ID
- `verification_status`: pending / verified / rejected / needs_review
- `is_correctly_segregated`: 0 or 1
- `notes`: Verification notes
- `verified_at`: Timestamp of verification
- `created_at`: Timestamp

### Token Transactions
- `id`: Unique transaction ID
- `user_id`: Foreign key to users
- `deposit_id`: Foreign key to deposits (null for manual transactions)
- `amount`: Token amount
- `type`: 'reward' / 'redeem' / 'adjust'
- `status`: 'pending' / 'completed'
- `created_at`: Timestamp

### Audit Logs
- `id`: Unique ID
- `action`: Action type (deposit_created, deposit_verified, tokens_redeemed, etc.)
- `target_type`: deposit / wallet / system / etc.
- `target_id`: ID of affected record
- `user_id`: Acting user
- `details`: Human-readable summary
- `created_at`: Timestamp

## Demo Data

The database is seeded on first run with:
- **2 demo users**: Alex Chen (regular user), Dr. Sarah Park (admin)
- **4 waste bins**: Organic, Recyclable (×2), Hazardous with QR codes
- **7 demo deposits**: Mix of verified, pending, rejected, and needs-review statuses
- **Token transactions**: Rewards for verified deposits (formula: 2 tokens/kg)
- **Audit trail**: All actions logged

### Reset Demo Data

POST `/api/demo/reset` will clear all deposits, verifications, and transactions, then re-seed.

Or use the admin button on the dashboard to reset for exhibition demonstrations.

## API Endpoints

### Dashboard
- `GET /api/dashboard/stats` → Total waste, verified, verifications, tokens, accuracy %
- `GET /api/dashboard/category-distribution` → Waste by category
- `GET /api/dashboard/daily-collection` → Daily totals (last 7 days)
- `GET /api/dashboard/recent-deposits` → 10 most recent deposits

### Classification
- `POST /api/waste/classify` → Simulated AI classification (returns category, confidence, explanation)

### Deposits
- `POST /api/deposits/register` → Create new deposit
- `GET /api/bins` → List all waste bins

### Verification
- `GET /api/verification/pending` → Pending deposits
- `POST /api/verification/:depositId/verify` → Verify/reject deposit (awards tokens)

### Wallet
- `GET /api/wallet/:userId/balance` → Current balance, earned, redeemed, transactions
- `POST /api/wallet/:userId/redeem` → Redeem demo tokens

### Admin
- `GET /api/admin/deposits?status=&category=&startDate=&endDate=` → Filterable deposit list
- `POST /api/demo/reset` → Reset demo data

### Analytics
- `GET /api/analytics/segregation?startDate=&endDate=` → Segregation by category
- `GET /api/export/deposits` → CSV export of all deposits
- `GET /api/export/transactions` → CSV export of all token transactions

## Key Design Decisions (Lazy Principles)

### Simulated AI Classification
- **Why simulated?** Real ML APIs (Google Vision, AWS Rekognition) require keys and cost money. Demo mode is clearer for prototypes.
- **Implementation**: Simple random selection with configurable categories. Clearly labeled "Demo Classification" in UI.
- **Real integration**: Replace `/api/waste/classify` with actual ML API call.

### SQLite Instead of PostgreSQL
- **Why?** Zero setup. File-based. Ships with Node via npm. Perfect for demos and local development.
- **Transition**: To use PostgreSQL, replace database.js with a pg client, update connection logic.

### No Authentication
- **Why?** Scope for college exhibition. Demo uses hardcoded user IDs.
- **Real implementation**: Add JWT or session-based auth, role-based access control.

### Token Formula: 2 tokens/kg
- **Why?** Simple, incentivizes volume. Configurable in server code.
- **Location**: `server/index.js`, line ~200 in `/api/verification/:depositId/verify`
- **Adjust**: Change `const tokenAmount = 5;` to any value.

### Recharts Over Custom D3
- **Why?** Pre-built, responsive, interactive tooltips, zero config.
- **Charts work immediately**: No styling, no axis setup, no data transformation boilerplate.

## Limitations & Future Work

### Current Limitations
1. **No real AI**: Classification is simulated (clearly marked in UI)
2. **No camera/hardware**: QR/RFID scanning is simulated
3. **No authentication**: All users access as admin/demo user
4. **No multi-language**: English only
5. **No email notifications**: Dashboard shows notifications badge but no actual emails
6. **SQLite only**: Not production-grade for high concurrency
7. **No image storage**: Images are client-side blobs, not persisted to disk

### Future Enhancements
1. **Connect real ML**: Replace simulated classification with Google Vision API or custom model
2. **Add hardware**: Connect actual QR scanner or RFID reader via WebUSB
3. **Authentication**: Implement JWT + role-based access
4. **Email alerts**: Notify users when deposits are verified
5. **Mobile app**: React Native version for mobile verification
6. **Multi-language**: i18n for regional deployments
7. **Image storage**: Save uploaded images to cloud storage (AWS S3, Firebase)
8. **Leaderboards**: Gamify with user rankings, achievements
9. **Real payments**: Integrate with actual token/cryptocurrency systems
10. **Scalable DB**: Migrate to PostgreSQL for production

## Running for Exhibition

### Before Demo
1. Ensure demo data is fresh: `curl -X POST http://localhost:3001/api/demo/reset`
2. Open http://localhost:5173 in a browser
3. Have the verification admin page (`/verification`) ready on a second monitor

### Demo Flow
1. **Show Dashboard**: Highlight real-time metrics, charts update with live data
2. **Upload & Classify**: Go to `/classify`, upload any image, show simulated AI classification
3. **Register Deposit**: `/deposit` page, fill form, submit, show success message
4. **Verify Deposit**: Refresh `/verification`, show new pending deposit, approve it
5. **Check Wallet**: `/wallet` page, show tokens awarded automatically
6. **QR/RFID**: Generate QR code, scan it, show simulated RFID
7. **Analytics**: Export CSV, show date filters, refresh data
8. **Show Code**: Open DevTools → Network, show API calls, explain architecture

### Troubleshooting

**"Cannot GET /api/dashboard/stats"**
- Backend not running. Run `npm run server` separately in another terminal.

**"Cannot connect to sqlite3"**
- Missing data directory. Run `mkdir -p data` in project root.

**Charts not rendering**
- Recharts sometimes needs a hard refresh. Ctrl+Shift+R (clear cache).

**QR code not generating**
- qrcode library needs npm install. Run `npm install` again.

**Tokens not appearing**
- Check if deposit status is "verified" (not "pending"). Only verified deposits earn tokens.

## File Structure

```
segregate-to-earn/
├── server/
│   ├── index.js           # Express API server
│   ├── database.js        # SQLite initialization & helpers
│   └── seed.js            # Demo data seeding
├── src/
│   ├── components/
│   │   ├── Layout.tsx     # Sidebar + top bar
│   │   └── StatsCard.tsx  # Reusable stats component
│   ├── pages/
│   │   ├── DashboardPage.tsx
│   │   ├── ClassifyPage.tsx
│   │   ├── DepositPage.tsx
│   │   ├── VerificationPage.tsx
│   │   ├── TokenWallet.tsx
│   │   ├── QRRFIDPage.tsx
│   │   └── AnalyticsPage.tsx
│   ├── App.tsx            # Route setup
│   ├── main.tsx           # React entry point
│   └── index.css          # Global styles
├── data/
│   └── app.db             # SQLite database (auto-created)
├── index.html             # HTML shell
├── package.json           # Dependencies
├── vite.config.ts         # Vite config
├── tsconfig.json          # TypeScript config
└── README.md              # This file
```

## Development Tips

### Add a New Page
1. Create `src/pages/NewPage.tsx` with React component
2. Add route in `src/App.tsx`: `<Route path="/new" element={<Layout><NewPage /></Layout>} />`
3. Add nav item in `src/components/Layout.tsx`

### Add an API Endpoint
1. Add handler in `server/index.js`
2. Call from frontend: `fetch('/api/endpoint')`

### Debug Database
1. Install SQLite CLI: `brew install sqlite3` (macOS) or `choco install sqlite` (Windows)
2. Open database: `sqlite3 data/app.db`
3. Query: `.tables`, `SELECT * FROM waste_deposits;`, etc.

### Style Changes
- Use Tailwind classes in JSX
- Color palette defined in `index.html` as CSS variables:
  - `--forest`: #1B3A2F (dark)
  - `--leaf`: #2D7A5A (medium)
  - `--mint`: #C8F5E8 (light)
  - `--sage`: #E8F8F0 (extra light)
  - `--stone`: #F6F8F5 (background)
  - `--ink`: #1A2220 (text)

## Deployment

### Local Machine
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
# Outputs to dist/
npm run preview
```

### Replit
1. Create a new Replit Node project
2. Upload this repo or git clone
3. Run `npm install`
4. Create `.replit` file:
   ```
   run = "npm run dev"
   ```
5. Click Run

### Heroku / Railway
1. Create `Procfile`:
   ```
   web: npm run server
   ```
2. Create separate frontend deployment (Vercel, Netlify) or build SPA into `public/` and serve from Express

## Support & Questions

- **Architecture**: See `server/index.js` for full API
- **Styles**: Check `index.html` for Tailwind config
- **Database**: Schema in `server/database.js`
- **Demo Data**: Seeding logic in `server/seed.js`
- **Clearly marked limitations**: Every simulated feature has a "Demo" or "Simulated" label in UI

---

**Status**: Complete, working prototype ready for college exhibition.  
**Last updated**: 2026-10-22  
**License**: MIT (for educational use)
