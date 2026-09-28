# CanteenX 🥪
> **"Order Ahead. Skip the Queue."**

CanteenX is a modern, full-stack smart college canteen management and pre-ordering platform built to eliminate lunch break crowding, billing counter queues, kitchen delays, and table availability uncertainty.

---

## 🚀 Key Features

### 🎓 Student Experience
- **Pre-order Meals**: Browse 20+ authentic canteen menu items before lunch break.
- **Smart Pickup Time Slots**: Choose a 5-minute express slot (e.g., 12:35 PM) to distribute kitchen rush.
- **Dietary & Price Filters**: Pure Veg, Quick Prep (<8 min), Under ₹50, ₹50–₹100, Above ₹100, and Search.
- **Digital Token & QR Verification**: Instant token generation (`CX-1042`) and scannable QR code for Express Counter 2.
- **Live Order Tracking**: Real-time status stepper (`Order Placed` → `Accepted` → `Preparing` → `Ready for Pickup` → `Collected`).
- **Smart Table Map**: Visual status map of 20 dining tables with a 20-minute table reservation lock.
- **CanteenX Digital Wallet**: Instant payments, balance management, and transaction logs.
- **Digital Receipts**: Downloadable and printable itemized tax invoices.

### 👨‍🍳 Canteen Admin & Staff Portal (`/admin`)
- **Live Kitchen Kanban Board**: Drag & drop order workflow (`NEW` → `PREPARING` → `READY` → `COMPLETED`).
- **QR / Token Verification Tool**: Search or scan token numbers to instantly verify and mark orders collected.
- **Menu & Stock Manager**: Add/edit food items, change prices, update stock, and toggle stock availability states.
- **Pickup Slot Capacity Configurator**: Set max orders allowed per 5-minute slot.
- **Seating Layout Manager**: Toggle real-time table states (`AVAILABLE`, `OCCUPIED`, `RESERVED`, `CLEANING`).
- **Smart Rush Prediction & Analytics**: Predict peak lunch rush hours and view top-selling menu items.
- **Announcement Publisher**: Broadcast real-time announcement banners to student dashboards.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Framer Motion, Socket.io-client, QRCode, Canvas Confetti
- **Backend**: Node.js, Express.js, Socket.io, Better-SQLite3, JWT, BcryptJS
- **Database**: SQLite (`database.sqlite`)

---

## 🔑 Demo Account Credentials

For quick testing, use these pre-seeded demo accounts:

| Role | Email / ID | Password |
| :--- | :--- | :--- |
| **Student** | `student@canteenx.demo` | `student123` |
| **Admin / Kitchen** | `admin@canteenx.demo` | `admin123` |

*(Note: Clickable helper buttons on the login page autofill these credentials automatically.)*

---

## ⚙️ Local Setup Instructions

### Prerequisites
- Node.js (v18+ recommended)
- npm

### 1. Backend Setup
```bash
cd backend
npm install
npm run seed      # Seeds 20+ food items, 20 tables, slots & demo users
npm run dev       # Starts Express backend on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev       # Starts Vite dev server on http://localhost:5173
```

Open `http://localhost:5173` in your browser to start using CanteenX!

---

## 📂 Project Structure

```
CanteenX/
├── backend/
│   ├── src/
│   │   ├── config/ (db.js schema setup)
│   │   ├── middleware/ (auth.js JWT authentication)
│   │   ├── routes/ (auth, menu, orders, tables, slots, wallet, notifications, admin)
│   │   ├── seed/ (seed.js database seeder)
│   │   └── index.js (express app & socket.io server)
│   ├── package.json
│   └── database.sqlite
└── frontend/
    ├── src/
    │   ├── components/ (Navbar, Footer, FoodCard, CartSidebar, CheckoutModal, TableCard, ReceiptModal, etc.)
    │   ├── context/ (AuthContext, CartContext, SocketContext)
    │   ├── pages/ (LandingPage, StudentDashboard, MenuPage, OrderTrackingPage, MyOrdersPage, TableMapPage, WalletPage, AdminDashboard)
    │   ├── services/ (api.js fetch client)
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```
