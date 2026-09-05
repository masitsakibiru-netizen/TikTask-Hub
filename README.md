# TikTask Hub 🎯

A full-stack MERN application where users earn money by completing social media tasks. Built with React, Node.js, Express, MongoDB, and M-Pesa Daraja integration.

---

## Features

### User Features
- Register / Login with JWT authentication
- Pay membership via M-Pesa STK Push (KES 500)
- View and complete social media tasks
- Submit screenshot proof for task completion
- Track earnings, balance, and withdrawal history
- Referral system — earn KES 50 per referral
- Withdraw earnings via M-Pesa

### Admin Features
- Dashboard with full statistics
- Create, edit, delete, enable/disable tasks
- Approve or reject task submissions (auto-credits user)
- Manage withdrawal requests (Approve / Reject / Mark Paid)
- Manage users (suspend, activate, reset balance, delete)
- Manage membership payments
- Manually activate memberships

---

## Tech Stack

| Layer       | Tech                              |
|------------|-----------------------------------|
| Frontend   | React 18, Vite, React Router v6   |
| Backend    | Node.js, Express                  |
| Database   | MongoDB Atlas, Mongoose            |
| Auth       | JWT, bcryptjs                     |
| Payments   | M-Pesa Daraja API (STK Push)      |
| Uploads    | Multer                            |
| Styling    | Custom CSS (no UI framework)       |

---

## Quick Start

### 1. Clone and install
```bash
git clone <repo-url>
cd tiktaskhub
npm install          # installs concurrently (for root dev script)
npm run install-all  # installs server + client dependencies
```

### 2. Configure environment
```bash
cp server/.env.example server/.env
# Edit server/.env with your values
```

### 3. Run development
```bash
npm run dev
```
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

---

## Environment Variables

Copy `server/.env.example` to `server/.env` and fill in:

```env
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret_key

# M-Pesa (get from developer.safaricom.co.ke)
MPESA_CONSUMER_KEY=...
MPESA_CONSUMER_SECRET=...
MPESA_SHORTCODE=174379
MPESA_PASSKEY=...
MPESA_CALLBACK_URL=https://yourdomain.com/api/payments/callback

NODE_ENV=development
```

---

## M-Pesa Setup

1. Go to [Safaricom Developer Portal](https://developer.safaricom.co.ke)
2. Create an app and get Consumer Key + Secret
3. For sandbox, use shortcode `174379` and the sandbox passkey
4. For production, use your actual till/paybill number
5. Set `MPESA_CALLBACK_URL` to a publicly accessible HTTPS URL
6. For local testing, use [ngrok](https://ngrok.com): `ngrok http 5000` then set the callback URL

---

## API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| PUT | /api/auth/change-password | Change password |

### Tasks
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/tasks | Get all active tasks |
| POST | /api/tasks | Admin: Create task |
| PUT | /api/tasks/:id | Admin: Update task |
| DELETE | /api/tasks/:id | Admin: Delete task |
| PATCH | /api/tasks/:id/toggle | Admin: Toggle status |

### Submissions
| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/submissions/submit | Submit task proof |
| GET | /api/submissions/my | Get my submissions |
| GET | /api/submissions/all | Admin: All submissions |
| PUT | /api/submissions/approve/:id | Admin: Approve |
| PUT | /api/submissions/reject/:id | Admin: Reject |

### Withdrawals
| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/withdrawals/request | Request withdrawal |
| GET | /api/withdrawals/my | My withdrawals |
| GET | /api/withdrawals/all | Admin: All withdrawals |
| PUT | /api/withdrawals/approve/:id | Admin: Approve |
| PUT | /api/withdrawals/reject/:id | Admin: Reject |
| PUT | /api/withdrawals/paid/:id | Admin: Mark paid |

### Payments
| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/payments/membership | Initiate STK Push |
| POST | /api/payments/callback | M-Pesa callback (no auth) |
| GET | /api/payments/status/:id | Check payment status |
| GET | /api/payments/my | My payment history |
| GET | /api/payments/all | Admin: All payments |
| POST | /api/payments/activate/:userId | Admin: Activate manually |

### Admin
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/admin/dashboard | Dashboard stats |
| GET | /api/admin/users | All users |
| PUT | /api/admin/users/:id | Update user |
| DELETE | /api/admin/users/:id | Delete user |
| PUT | /api/admin/users/:id/reset-balance | Reset balance |

---

## Creating an Admin Account

After registering a user, update their role in MongoDB:

```js
// In MongoDB Atlas or Compass
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } })
```

Or set `role: "admin"` in your .env and seed script.

---

## Project Structure

```
tiktaskhub/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # Shared components
│   │   ├── context/         # Auth context
│   │   ├── pages/           # All pages
│   │   │   └── admin/       # Admin pages
│   │   └── services/        # API service
│   └── package.json
│
├── server/                  # Express backend
│   ├── config/              # DB connection
│   ├── controllers/         # Route handlers
│   ├── middleware/          # Auth, upload, admin
│   ├── models/              # Mongoose schemas
│   ├── routes/              # Express routes
│   ├── services/            # M-Pesa service
│   ├── uploads/             # Uploaded files
│   └── server.js
│
└── package.json             # Root (concurrently)
```

---

## License

MIT
