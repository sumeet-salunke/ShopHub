# 🛒 CartSystem (Advanced Backend)

A production-style backend system built using the MERN stack principles, focusing on **authentication, security, and real-world e-commerce flows**.

---

## 🚀 Features

### 🔐 Authentication & Security

* JWT-based authentication (Access + Refresh tokens)
* HTTP-only cookie handling
* Email verification system
* Password reset flow
* Account lock after failed attempts
* Rate limiting & Helmet security

---

### 🛍️ Product System

* Create, update, delete products (admin only)
* Pagination & filtering
* Stock management
* Soft delete (`isActive`)

---

### 🛒 Cart System

* Add to cart
* Update quantity
* Remove items
* Stock validation
* One cart per user design

---

### 📦 Order System

* Place order from cart
* Product data snapshot (price, name)
* MongoDB transactions for consistency
* Order lifecycle:

  * `pending → confirmed → delivered`
  * `pending → cancelled`

---

### 📩 Email Workflows

* Email verification
* Password reset
* Order confirmation (token-based)
* Delivery notification
* Account deletion email

---

### ⏱️ Automation

* Cron job for auto-delivery
* Time-based state transitions

---

### 🧾 Account Management

* Secure logout
* Delete account
* Cascade cleanup (cart, tokens)

---

## 🧠 Key Design Decisions

### 1. Snapshot vs Dynamic Data

Orders store product **price & name at purchase time** to maintain historical consistency.

---

### 2. Transactions

Used MongoDB transactions to ensure:

* Order creation
* Stock update
* Cart clearing
  happen atomically.

---

### 3. Token-Based Flows

Sensitive flows (email verification, order confirmation) use:

* DB-stored tokens
* Expiry + one-time usage
  (Not JWT)

---

### 4. Soft Deletes

Products are not removed, but marked inactive for consistency.

---

## 🛠️ Tech Stack

* Node.js
* Express.js
* MongoDB (Atlas)
* Mongoose
* JWT
* Nodemailer
* node-cron

---

## ⚙️ Setup Instructions

### 1. Clone repo

```bash
git clone <your-repo-url>
cd CARTSYSTEM/backend
```

---

### 2. Install dependencies

```bash
npm install
```

---

### 3. Environment variables

Create `.env` based on `.env.example`

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_ACCESS_SECRET=your_secret
JWT_REFRESH_SECRET=your_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
CLIENT_URL=http://localhost:5000
```

---

### 4. Run server

```bash
npm run dev
```

---

## 📌 API Overview

### Auth

* `POST /api/auth/register`
* `POST /api/auth/login`
* `POST /api/auth/logout`

---

### Products

* `POST /api/products` (admin)
* `GET /api/products`
* `PATCH /api/products/:id`
* `DELETE /api/products/:id`

---

### Cart

* `POST /api/cart`
* `GET /api/cart`
* `PATCH /api/cart/:productId`
* `DELETE /api/cart/:productId`

---

### Orders

* `POST /api/orders`
* `GET /api/orders`
* `GET /api/orders/all` (admin)
* `GET /api/orders/confirm/:token`
* `PATCH /api/orders/:id/cancel`

---

## 🧪 Testing

Tested using Postman:

* Auth flows
* Cart operations
* Order lifecycle
* Token validation
* Edge cases (invalid token, stock issues, reuse)

---

## 📈 Future Improvements

* Admin dashboard (stats & analytics)
* Payment gateway integration
* Background job queue (BullMQ)

---

## 👨‍💻 Author

Built as a deep backend learning project focusing on **real-world architecture, security, and system design**.
