# NexTrade — Investment Broker Platform

A full-stack simulated investment broker platform with real-time trading, investment plans, admin panel and live chat.

---

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js + Express
- **Database:** MongoDB
- **Real-time:** Socket.io
- **Charts:** Chart.js + TradingView
- **Auth:** JWT

---

## Project Structure

```
investment-broker/
├── frontend/
│   ├── index.html              # Landing page
│   ├── login.html              # Customer login
│   ├── register.html           # Customer register
│   ├── dashboard.html          # Customer dashboard
│   ├── trading.html            # Trading page
│   ├── investment-plans.html   # Investment plans
│   ├── portfolio.html          # Portfolio
│   ├── deposit-withdrawal.html # Deposit & withdraw
│   ├── contact.html            # Contact & live chat
│   ├── css/
│   │   ├── style.css           # Global dark theme
│   │   └── dashboard.css       # Dashboard layout
│   ├── js/
│   │   └── utils.js            # Shared utilities
│   └── admin/
│       ├── admin-login.html
│       ├── admin-dashboard.html
│       ├── users.html
│       ├── transactions.html
│       ├── plans.html
│       ├── investments.html
│       ├── chat.html
│       ├── admin-utils.js
│       └── admin-sidebar.js
├── backend/
│   ├── server.js
│   ├── config/db.js
│   ├── middleware/auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Plan.js
│   │   ├── Investment.js
│   │   ├── Trade.js
│   │   ├── Transaction.js
│   │   └── Message.js
│   └── routes/
│       ├── auth.js
│       ├── users.js
│       ├── plans.js
│       ├── trades.js
│       ├── transactions.js
│       └── chat.js
├── .env
└── package.json
```

---

## Setup Instructions

### 1. Prerequisites
- [Node.js](https://nodejs.org/) v16+
- [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally

### 2. Install Dependencies
```bash
cd investment-broker
npm install
```

### 3. Configure Environment
Edit `.env` file:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/investment-broker
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
ADMIN_SECRET=admin_registration_secret_key
```

### 4. Start MongoDB
```bash
# Windows
net start MongoDB

# macOS/Linux
mongod
```

### 5. Start the Server
```bash
# Development (auto-restart)
npm run dev

# Production
npm start
```

### 6. Open the App
Open `frontend/index.html` in your browser or use Live Server in VS Code.

---

## Create Admin Account

Send a POST request using Postman or curl:

```bash
curl -X POST http://localhost:5000/api/auth/register-admin \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Admin",
    "email": "admin@nextrade.com",
    "password": "Admin@1234",
    "adminSecret": "admin_registration_secret_key"
  }'
```

Or use this HTML form in your browser console:
```js
fetch('http://localhost:5000/api/auth/register-admin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fullName: 'Admin',
    email: 'admin@nextrade.com',
    password: 'Admin@1234',
    adminSecret: 'admin_registration_secret_key'
  })
}).then(r => r.json()).then(console.log)
```

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register customer |
| POST | /api/auth/register-admin | Register admin |
| POST | /api/auth/login | Login (both roles) |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/users/me | Get own profile |
| GET | /api/users | Admin: get all users |
| PUT | /api/users/:id/balance | Admin: update balance |
| PUT | /api/users/:id/toggle | Admin: suspend/activate |

### Plans & Investments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/plans | Get all active plans |
| POST | /api/plans | Admin: create plan |
| PUT | /api/plans/:id | Admin: update plan |
| DELETE | /api/plans/:id | Admin: delete plan |
| POST | /api/plans/invest | Customer: invest |
| GET | /api/plans/my | Customer: my investments |
| GET | /api/plans/all | Admin: all investments |

### Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/transactions | Request deposit/withdrawal |
| GET | /api/transactions/my | Customer: my transactions |
| GET | /api/transactions | Admin: all transactions |
| PUT | /api/transactions/:id | Admin: approve/reject |

### Trades
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/trades | Place a trade |
| GET | /api/trades/my | Customer: my trades |
| GET | /api/trades | Admin: all trades |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/chat | Send message |
| GET | /api/chat/my | Customer: chat history |
| GET | /api/chat/conversations | Admin: all conversations |
| POST | /api/chat/reply | Admin: reply to user |

---

## Features

### Customer
- Register & login
- Dashboard with balance, investments, returns
- Trade stocks, crypto & forex (simulated)
- Choose investment plans and track ROI
- Deposit & withdrawal requests
- Live chat with admin
- Portfolio with charts

### Admin
- Secure admin login
- Platform stats dashboard
- Manage all users (edit balance, suspend/activate)
- Approve or reject deposits & withdrawals
- Create, edit, delete investment plans
- View all investments
- Real-time live chat with all customers

---

## Notes
- This is a **demo/simulated** platform — no real money is involved
- Market prices are simulated with small random fluctuations
- TradingView charts show real market data (read-only)
- Change all secrets in `.env` before any deployment
