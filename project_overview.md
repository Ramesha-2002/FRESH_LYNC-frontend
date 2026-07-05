# FreshLync Project Architecture & Codebase Overview

FreshLync is a modern, full-stack food distribution and logistics optimization platform. It connects food suppliers (farmers/producers) directly with buyers (customers/retailers) while streamlining route optimization, cold chain logistics, and supply chain tracking.

---

## 🛠️ Technology Stack

| Layer | Technologies & Libraries | Key Responsibilities |
| :--- | :--- | :--- |
| **Frontend** | React (Vite), React Router DOM v6, Axios, Lucide React | Single Page Application (SPA), role-based dashboards, interactive cart, state contexts. |
| **Backend** | Node.js, Express, Multer, Bcrypt, JsonWebToken | RESTful API, authentication/authorization middleware, file uploads management. |
| **Database** | MongoDB, Mongoose ODM | Data persistence, validation, schemas definitions, referencing relationships. |

---

## 🗄️ Database Schema & Models (`freshlync-backend/src/models/`)

The database consists of three Mongoose models:

### 1. User.js
* **Fields**: `name`, `email` (unique, lowercase), `password` (hashed with bcrypt), `role` (`buyer`, `supplier`, `admin`), `company`, `phone`, `avatar`, `address`, `bankName`, `accountNumber`, `sortCode`, `isVerified` (boolean).
* **Hooks**: Hashes password before save using bcrypt; exposes `matchPassword` method.

### 2. Product.js
* **Fields**: `supplier` (Reference to User ID), `name`, `description`, `price`, `stock`, `unit` (e.g., kg, pack), `category`, `image` (URL string).
* **Timestamps**: Automatically populated by Mongoose.

### 3. Order.js
* **Fields**:
  * `buyer` (Reference to User ID)
  * `supplier` (Reference to User ID)
  * `items`: Array of `{ product: Ref, name, quantity, price, unit }`
  * `subtotal`, `margin` (platform fee), `total`
  * `status`: Enum (`Pending`, `Paid`, `Processing`, `Shipping`, `Delivered`, `Cancelled`)
  * `shippingAddress`, `deliveryRoute` (GPS points for route tracing).

---

## 🔌 API Endpoints & Routes (`freshlync-backend/src/routes/`)

### 🔑 Authentication (`/api/auth`)
* `POST /register` – Register a new buyer or supplier.
* `POST /login` – Sign in and retrieve JWT token.
* `GET /me` – Retrieve current user details (protected).
* `PUT /profile` – Update profile details (protected).
* `PUT /password` – Change account password (protected).

### 🥦 Products (`/api/products`)
* `GET /` – Fetch all products (public).
* `GET /:id` – Fetch a single product's details (public).
* `POST /` – Create new product (suppliers/admins only; supports image upload via Multer).
* `PUT /:id` – Update product details (suppliers/admins only).
* `DELETE /:id` – Delete product (suppliers/admins only).
* `PATCH /:id/stock` – Quick stock adjustment (suppliers/admins only).

### 📦 Orders (`/api/orders`)
* `GET /` – Fetch orders related to the logged-in user (buyers see their orders; suppliers see orders they fulfill; admins see all).
* `GET /:id` – Fetch single order detail.
* `POST /` – Place an order (buyers only).
* `PUT /:id/status` – Update order shipping/processing status (suppliers/admins only).

### 📊 Analytics (`/api/analytics`)
* `GET /summary` – Fetch financial and sales summary metrics (suppliers/admins only).
* `GET /chart` – Fetch chart coordinates data for revenue/sales timelines (suppliers/admins only).

### 🛡️ Admin Controls (`/api/admin`)
* `GET /stats` – Global dashboard platform KPIs.
* `GET /users` – List all registered platform users.
* `PUT /margin` – Adjust global platform fee margin percentage.
* `PUT /users/:id/verify` – Approve/verify supplier accounts.

---

## 💻 Frontend Architecture (`Freshlync-Frontend/src/`)

### 🗺️ Router Setup & Layouts (`App.jsx`)
Routes are protected with a custom `<ProtectedRoute>` shell that monitors user login status and user permissions.

* **Public Routes**: `Landing (/)`, `Login (/login)`, `Register (/register)`
* **Setup Wizard**: `ProfileSetup (/setup/profile)`, `Verification (/setup/verification)`
* **Buyer Portal**: `Marketplace Home (/marketplace)`, `Cart & Checkout`, `Tracking (/marketplace/shipments)`
* **Supplier Dashboard**: `Overview (/dashboard)`, `Inventory CRUD`, `Orders Fulfillment`
* **Admin Portal**: `Users verification (/admin/users)`, `Commission Management`

### 🧠 State Management & React Contexts
1. **AuthContext.jsx**: Manages authentication token (`fl_token`), current user state (`fl_user`), logins, registration, profile updates, and automatic token rehydration upon page load.
2. **CartContext.jsx**: Manages items in the user's shopping cart, adding items, increasing/decreasing quantities, calculating totals, and resetting the cart upon checkout.

### 🌐 Client Integration Services (`services/`)
API calls are routed through a base Axios instance configured in `api.js`:
* Automatically injects the JWT token as a `Bearer` token inside the HTTP `Authorization` header.
* Redirects users to the `/login` route automatically if a `401 Unauthorized` response is encountered.

* **Services**:
  * `authService.js`
  * `productService.js`
  * `orderService.js`
  * `analyticsService.js`
  * `adminService.js`
