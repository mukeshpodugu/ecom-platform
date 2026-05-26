# 🚀 Horizon Mall (Apex E-Commerce)

[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2F%20Express-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-mediumseagreen?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Redux](https://img.shields.io/badge/State--Management-Redux--Toolkit-purple?style=for-the-badge&logo=redux)](https://redux-toolkit.js.org/)

Horizon Mall (Apex) is a production-level, full-stack e-commerce marketplace designed with premium glassmorphism visuals, advanced state management, and real-time backend orchestration. Built to serve as a resume-weightage developer project, it goes beyond a standard store clone by introducing **AI product recommendations, a seller multi-vendor dashboard, and secure dynamic PDF invoice streaming**.

---

## ✨ Core Pillars & Highlights

*   **🛡️ Dual-Mode Database Engine**: Connects instantly to standard MongoDB or falls back automatically to local offline JSON storage (`dbService.js` adapter) to run local development without any database setup.
*   **🧠 AI Recommendation Engine**: Custom optional JWT middleware (`resolveUser`) resolves logged-in buyers to recommend tailored items based on their historical orders or active wishlist categories.
*   **📊 Multi-Vendor Seller Portal**: A specialized portal for merchants to add products, adjust stock units, delete inactive items, and inspect sales trends.
*   **📄 Automatic PDF Invoices**: Server-side document assembler (using `pdfkit`) that generates secure customer invoices downloadable from the order tracking timeline.
*   **👑 Admin Command Center**: Global overview metrics for total sales, active accounts, and a customer directory with toggle controls to block/unblock users.

---

## 🎨 Technology Architecture

```
                  ┌──────────────────────────────┐
                  │      Next.js Frontend        │
                  │   (Redux Toolkit / CSS)      │
                  └──────────────┬───────────────┘
                                 │ HTTP / JSON
                                 ▼
                  ┌──────────────────────────────┐
                  │      Node.js / Express       │
                  │       (REST API / JWT)       │
                  └──────────────┬───────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
       ┌───────────────────┐           ┌───────────────────┐
       │   MongoDB Cloud   │  < OR >   │  Local Database   │
       │    (Production)   │           │   (Mock JSONs)    │
       └───────────────────┘           └───────────────────┘
```

*   **Frontend**: Next.js 14 (App Router), React 18, Redux Toolkit, Lucide Icons, Glassmorphic CSS.
*   **Backend**: Node.js, Express.js, JWT, BcryptJS, PDFKit, Nodemon.
*   **Database**: Mongoose (MongoDB) / Custom File-system JSON adapter.

---

## 🚀 Installation & Local Launch

Follow these commands in your terminal to set up the project locally:

### 1. Install root package runners
```bash
npm install
```

### 2. Install all frontend & backend dependencies
```bash
# Semicolon is used for Windows PowerShell compatibility
npm install; npm run install:all
```

### 3. Seed mock products & test accounts
```bash
npm run seed
```

### 4. Run development servers
```bash
npm run dev
```

*   **Frontend App URL**: [http://localhost:3000](http://localhost:3000)
*   **Backend Docs URL**: [http://localhost:5000/api/docs](http://localhost:5000/api/docs)

---

## 🧪 Seeded Test Accounts

Log in with these pre-configured user profiles to test role-based dashboards:

| User Type | Email Address | Password | Features to Test |
| :--- | :--- | :--- | :--- |
| **Customer** | `user@apex.com` | `user123` | Cart operations, wishlist additions, checkout, view delivery timeline, download PDF invoice, star reviews. |
| **Seller** | `seller@apex.com` | `seller123` | Add custom products, modify inventory counts, check seller revenue statistics. |
| **Admin** | `admin@apex.com` | `admin123` | Aggregate marketplace earnings charts, block/unblock user login permissions. |

---

## 📂 Project Structure

```
ecom-platform/
├── backend/                  # Node.js API server
│   ├── config/               # DB connections
│   ├── controllers/          # Business logic handlers
│   ├── data/                 # JSON Database mocks (offline fallback)
│   ├── middleware/           # Auth and rate limits
│   ├── models/               # MongoDB Mongoose schemas
│   ├── routes/               # REST endpoint routes
│   └── server.js             # Server entry point
└── frontend/                 # Next.js App Router Client
    ├── public/
    └── src/
        ├── app/              # Page layouts (Cart, Checkout, Admin, Profile)
        ├── components/       # Global UI components (Chatbot, Header, Toast)
        └── store/            # Redux Slices (Auth, Cart, Products)
```
