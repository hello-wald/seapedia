<h1 align="center">
  <img src="apps/web/public/favicon.png" alt="logo" width="20" height="20"/> SEApedia
</h1>

<p align="center">
  A full-featured multi-seller marketplace — monorepo powered by NestJS, React Router, and Prisma.
</p>

<p align="center">
  <a href="https://seapedia.sharkcat.cloud" target="_blank">
    <img src="https://img.shields.io/badge/Live-seapedia.sharkcat.cloud-0EA5E9?style=for-the-badge&logo=globe&logoColor=white" alt="Live Demo" />
  </a>
  <a href="https://seapedia.sharkcat.cloud/api/docs" target="_blank">
    <img src="https://img.shields.io/badge/API%20Docs-Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black" alt="API Docs" />
  </a>
  <img src="https://img.shields.io/badge/pnpm-workspaces-F69220?style=for-the-badge&logo=pnpm&logoColor=white" alt="pnpm workspaces" />
  <img src="https://img.shields.io/badge/License-GPL--3.0-blue?style=for-the-badge" alt="License" />
</p>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Monorepo Structure](#-monorepo-structure)
- [Feature Checklist](#-feature-checklist)
- [Getting Started](#-getting-started)
    - [Prerequisites](#prerequisites)
    - [Local Development](#local-development)
    - [Environment Variables](#environment-variables)
    - [Creating an Admin Account](#creating-an-admin-account)
- [Available Scripts](#-available-scripts)
- [Seed Accounts](#-seed-accounts)
- [Business Rules](#-business-rules)
- [API Documentation](#-api-documentation)
- [Security](#-security)
- [Demo & Testing Guide](#-demo--testing-guide)
- [Deployment](#-deployment)

---

## 🌊 Overview

SEApedia is a multi-seller e-commerce marketplace where **buyers**, **sellers**, **drivers**, and **admins** each have their own dedicated experience. Buyers browse a public catalog and purchase from individual seller stores; sellers manage inventory and process orders; drivers pick up and deliver packages; admins monitor the platform and manage discounts.

Key business rules:

- 🛒 **Single-store cart** — a cart can only hold products from one seller at a time.
- 💳 **Wallet-based payments** — all purchases debit the buyer's in-app wallet.
- 📦 **Atomic checkout** — stock reduction, wallet debit, order creation, and cart clearing happen in a single DB transaction.
- 🚚 **Driver job marketplace** — orders generate delivery jobs that drivers can claim.

---

## 🛠 Tech Stack

### Frontend — `apps/web`

| Technology                                                                                            | Purpose                              |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------ |
| ![React](https://img.shields.io/badge/React_19-61DAFB?logo=react&logoColor=black)                     | UI library                           |
| ![React Router](https://img.shields.io/badge/React_Router_v8-CA4245?logo=reactrouter&logoColor=white) | Full-stack framework (SSR + routing) |
| ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?logo=tailwindcss&logoColor=white) | Utility-first styling                |
| ![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000000?logo=shadcnui&logoColor=white)           | Accessible component library         |
| ![Lucide](https://img.shields.io/badge/Lucide_React-F56565?logo=lucide&logoColor=white)               | Icon set                             |
| ![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)                           | Build tool                           |
| ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)         | Type safety                          |

### Backend — `apps/api`

| Technology                                                                                       | Purpose                 |
| ------------------------------------------------------------------------------------------------ | ----------------------- |
| ![NestJS](https://img.shields.io/badge/NestJS-E0234E?logo=nestjs&logoColor=white)                | Server framework        |
| ![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white)                | ORM & migrations        |
| ![PostgreSQL](https://img.shields.io/badge/PostgreSQL_17-4169E1?logo=postgresql&logoColor=white) | Primary database        |
| ![Swagger](https://img.shields.io/badge/Swagger-85EA2D?logo=swagger&logoColor=black)             | API documentation       |
| ![JWT](https://img.shields.io/badge/JWT-000000?logo=jsonwebtokens&logoColor=white)               | Authentication          |
| ![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?logo=cloudinary&logoColor=white)    | Image uploads & storage |

### Shared — `packages/shared`

| Technology                                                                                    | Purpose                              |
| --------------------------------------------------------------------------------------------- | ------------------------------------ |
| ![Zod](https://img.shields.io/badge/Zod-3E67B1?logo=zod&logoColor=white)                      | Shared schema validation (API ↔ Web) |
| ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white) | Shared types                         |

### Infrastructure

| Technology                                                                                     | Purpose                  |
| ---------------------------------------------------------------------------------------------- | ------------------------ |
| ![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)              | Containerization         |
| ![Hostinger](https://img.shields.io/badge/Hostinger_VPS-673DE6?logo=hostinger&logoColor=white) | Production server        |
| ![pnpm](https://img.shields.io/badge/pnpm-F69220?logo=pnpm&logoColor=white)                    | Monorepo package manager |

---

## 📁 Monorepo Structure

```
seapedia/
├── apps/
│   ├── api/          # NestJS backend (REST API + Swagger)
│   │   ├── prisma/   # Schema, migrations & seed
│   │   └── src/      # Modules: auth, cart, orders, delivery, wallet, …
│   └── web/          # React Router frontend (SSR)
│       └── app/      # Routes, components, layouts
├── packages/
│   └── shared/       # Zod schemas & TypeScript types shared by api + web
├── docker-compose.yml          # Local dev (Postgres only)
├── docker-compose.prod.yml     # Production (api + web + postgres)
└── .env.prod.example           # Production env template
```

---

## ✅ Feature Checklist

### Level 1 — Public Marketplace, Authentication & Reviews

- [x] Create the Public Marketplace Interface
- [x] Implement Basic Authentication and Role Awareness
- [x] Add Public Application Reviews
- [x] Build Reusable UI Foundations

### Level 2 — Building the Seller Experience

- [x] Create Seller Store Management
- [x] Implement Product Management for Sellers
- [x] Connect Products to the Public Catalog

### Level 3 — Buyer Wallet, Cart & Checkout

- [x] Build Buyer Wallet and Address Management
- [x] Implement Cart Management
- [x] Create Checkout and Basic Orders

### Level 4 — Discounts and Seller Order Processing

- [x] Implement Voucher and Promo Discounts
- [x] Allow Sellers to Process Orders
- [x] Add Buyer and Seller Reports

### Level 5 — Delivery and Driver Workflow

- [x] Create Delivery Jobs for Drivers
- [x] Implement Take Job and Delivery Completion
- [x] Show Driver Earnings and Job History

### Level 6 — Admin Monitoring and Overdue Handling

- [x] Build Admin Monitoring Dashboard
- [x] Complete Voucher and Promo Management UI
- [x] Implement Overdue Auto Return or Refund

### Level 7 — Security Hardening and Finalization

- [x] Secure Inputs, Queries, and Public Comments
- [x] Harden Session and Role-Based Access Control
- [x] Prepare Final Documentation and Demo Data

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) ≥ 20
- [pnpm](https://pnpm.io) ≥ 9 — `npm install -g pnpm`
- [Docker](https://www.docker.com) (for local Postgres)

### Local Development

```bash
# 1. Clone the repo
git clone https://github.com/your-org/seapedia.git
cd seapedia

# 2. Install dependencies
pnpm install

# 3. Copy and fill in environment variables
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env with your values (see table below)

# 4. Start the local Postgres container
pnpm db:up

# 5. Run database migrations
#    prisma migrate dev automatically runs the seed script on first run,
#    so demo accounts and products are created for you.
pnpm db:migrate

# 6. Start the development servers (api + web in parallel)
pnpm dev
```

> To re-seed at any time without re-running migrations:
>
> ```bash
> pnpm --filter api prisma:seed
> ```

| Service      | URL                            |
| ------------ | ------------------------------ |
| Web app      | http://localhost:5173          |
| API          | http://localhost:3000          |
| Swagger docs | http://localhost:3000/api/docs |

### Environment Variables

Copy `apps/api/.env.example` to `apps/api/.env` for local development.
For production, copy `.env.prod.example` to `.env` in the project root.

| Variable                | Required  | Description                                                       |
| ----------------------- | --------- | ----------------------------------------------------------------- |
| `DATABASE_URL`          | ✅ always | PostgreSQL connection string                                      |
| `JWT_SECRET`            | ✅ always | Secret key for signing JWTs (use a long random string)            |
| `JWT_EXPIRES_IN`        | ✅ always | Token expiry duration (e.g. `7d`)                                 |
| `SESSION_SECRET`        | ✅ always | Secret key for signing session cookies (use a long random string) |
| `ADMIN_EMAIL`           | ✅ always | Initial admin account email (read by the seed script)             |
| `ADMIN_PASSWORD`        | ✅ always | Initial admin account password (read by the seed script)          |
| `CLOUDINARY_CLOUD_NAME` | ✅ always | Cloudinary cloud name (for image uploads)                         |
| `CLOUDINARY_API_KEY`    | ✅ always | Cloudinary API key                                                |
| `CLOUDINARY_API_SECRET` | ✅ always | Cloudinary API secret                                             |
| `DOMAIN`                | prod only | Public domain for the deployment (e.g. `seapedia.sharkcat.cloud`) |
| `POSTGRES_PASSWORD`     | prod only | Postgres password for the Docker-managed database                 |

### Creating an Admin Account

The seed script reads `ADMIN_EMAIL` and `ADMIN_PASSWORD` from your environment and creates the admin account automatically.

**Via migration + seed (recommended for first setup):**

```bash
# Set ADMIN_EMAIL and ADMIN_PASSWORD in apps/api/.env, then:
pnpm db:migrate   # runs migrations and auto-seeds on first run
```

The seeded admin can log in at `/login` and will land on the Admin dashboard at `/admin`.

**Re-seed only (if the account was deleted or you need to reset it):**

```bash
pnpm --filter api prisma:seed
```

**Manually promote an existing user to Admin:**

Using Prisma Studio:

```bash
pnpm --filter api prisma studio
# Open UserRole table → add a new row with the user's id and role = ADMIN
```

Or directly in SQL:

```sql
INSERT INTO "UserRole" ("userId", "role")
SELECT id, 'ADMIN' FROM "User" WHERE email = 'your@email.com';
```

---

## 📦 Available Scripts

Run these from the **monorepo root**:

| Script                          | Description                                           |
| ------------------------------- | ----------------------------------------------------- |
| `pnpm dev`                      | Start api + web in parallel (watch mode)              |
| `pnpm build`                    | Build all packages and apps                           |
| `pnpm lint`                     | Type-check all packages and apps                      |
| `pnpm db:up`                    | Start local Postgres via Docker Compose               |
| `pnpm db:down`                  | Stop local Postgres                                   |
| `pnpm db:migrate`               | Apply Prisma migrations and auto-seed (`migrate dev`) |
| `pnpm --filter api prisma:seed` | Re-seed demo data without re-running migrations       |
| `pnpm prod:build`               | Build production Docker images                        |
| `pnpm prod:up`                  | Start production stack (detached)                     |
| `pnpm prod:down`                | Stop production stack                                 |
| `pnpm prod:logs`                | Tail production logs                                  |
| `pnpm prod:seed`                | Seed the production database                          |

---

## 🌱 Seed Accounts

After running `pnpm db:migrate` (local) or `pnpm prod:seed` (production), the following demo accounts are available:

| Role      | Email                      | Password    | Notes                                                       |
| --------- | -------------------------- | ----------- | ----------------------------------------------------------- |
| 👑 Admin  | `admin@seapedia.local`     | `admin123`  | Configured via `ADMIN_EMAIL` / `ADMIN_PASSWORD` env vars    |
| 🏪 Seller | `gadgetku@seapedia.local`  | `seller123` | Owns **GadgetKu** store (Electronics · Surabaya)            |
| 🏪 Seller | `sportline@seapedia.local` | `seller123` | Owns **SportLine** store (Sportswear · Bandung)             |
| 🏪 Seller | `hijauasri@seapedia.local` | `seller123` | Owns **HijauAsri** store (Plants & Coffee · Yogyakarta)     |
| 🛒 Buyer  | `buyer@seapedia.local`     | `buyer123`  | Pre-loaded wallet balance of Rp 500,000 and 1 saved address |
| 🚚 Driver | `driver@seapedia.local`    | `driver123` | Ready to claim delivery jobs                                |

**Seeded discount codes:**

| Code       | Type    | Discount | Status              |
| ---------- | ------- | -------- | ------------------- |
| `HEMAT10`  | Voucher | 10%      | Valid (30 days)     |
| `PROMO20`  | Promo   | 20%      | Valid (30 days)     |
| `EXPIRED5` | Voucher | 5%       | Expired             |
| `HABIS`    | Voucher | 15%      | Usage limit reached |

---

## 📐 Business Rules

### 🛒 Single-Store Cart

A buyer's cart can only contain products from **one seller store at a time**.

If a buyer adds a product from a **different store** than what is currently in their cart, a dialog prompts them:

- **Replace** — the cart is cleared and replaced with the item from the new store.
- **Cancel** — the cart remains unchanged.

This rule is enforced on both the frontend (dialog) and the backend (cart API validation).

---

### 💸 Pricing: Discounts + PPN 12%

SEApedia applies Indonesian PPN (VAT) of **12%** on all orders. Discounts are calculated **before** tax is applied.

**Combination rule:** a voucher and a promo **cannot be combined** — only one discount code may be applied per order.

**Calculation formula:**

```
subtotal          = Σ (item price × quantity)
discounted_amount = subtotal × discount_percent / 100
after_discount    = subtotal − discounted_amount
PPN               = after_discount × 12%
total             = after_discount + PPN + delivery_fee
```

**Example with voucher `HEMAT10` (10% off):**

|                        | Amount         |
| ---------------------- | -------------- |
| Subtotal               | Rp 100,000     |
| Voucher HEMAT10 (−10%) | −Rp 10,000     |
| After discount         | Rp 90,000      |
| PPN 12%                | +Rp 10,800     |
| Delivery fee           | +Rp 15,000     |
| **Total charged**      | **Rp 115,800** |

---

### 🚚 Driver Earnings

Drivers earn **100% of the delivery fee** for each completed delivery. There is no platform commission deducted from delivery fees.

Earnings are aggregated from completed deliveries and shown on the Driver dashboard under **Earnings & Job History**.

---

### ⏰ Overdue SLA & Time Simulation

Each order has an SLA deadline based on the chosen delivery type:

| Delivery Type | SLA Deadline           |
| ------------- | ---------------------- |
| **Instant**   | Same day (today)       |
| **Next Day**  | Next calendar day      |
| **Regular**   | 3 days from order date |

Orders that exceed their SLA without being delivered are flagged as **overdue**.

**Simulating time (for testing):**

Because waiting real days during a demo is impractical, the Admin dashboard includes a time simulation tool:

1. Log in as Admin and navigate to **Admin → Dashboard → Overdue**.
2. Use the **"Advance 1 day"** trigger to add 1 day to the simulation clock.
3. Orders whose SLA deadline has now passed will be marked overdue and shown in the list below.

---

## 📖 API Documentation

Interactive Swagger documentation is available at:

- **Production:** [seapedia.sharkcat.cloud/api/docs](https://seapedia.sharkcat.cloud/api/docs)
- **Local:** [localhost:3000/api/docs](http://localhost:3000/api/docs)

All protected endpoints require a `Bearer` JWT token. Use the **Authorize** button in Swagger (top right) to set your token after logging in.

The API is organized around the following resource groups:

| Group       | Description                                     |
| ----------- | ----------------------------------------------- |
| `auth`      | Registration, login, JWT refresh                |
| `products`  | Public catalog and seller product management    |
| `stores`    | Seller store management                         |
| `cart`      | Buyer cart (single-store rule enforced)         |
| `orders`    | Checkout, buyer history, seller incoming orders |
| `wallet`    | Top-up, balance, transaction ledger             |
| `addresses` | Buyer saved addresses                           |
| `delivery`  | Driver job listing, take job, completion        |
| `discounts` | Vouchers and promos                             |
| `reports`   | Buyer / seller analytics                        |
| `admin`     | Platform monitoring and management              |
| `uploads`   | Image upload via Cloudinary                     |

---

## 🔐 Security

### SQL Injection

All database queries go through **Prisma ORM**, which uses parameterized queries exclusively. Raw SQL is not used anywhere in the codebase, eliminating the SQL injection attack surface at the data layer.

### XSS (Cross-Site Scripting)

The frontend is built with **React 19**, which escapes all dynamic values rendered into the DOM by default. `dangerouslySetInnerHTML` is not used. User-submitted content (product descriptions, store names, reviews) is always rendered as text, not HTML.

### Input Validation

Validation is enforced at **two independent layers**:

1. **Backend** — every API endpoint uses **Zod schemas** (via `nestjs-zod`) to parse and validate request bodies. Invalid payloads are rejected with a structured 400 error before reaching any business logic.
2. **Frontend** — forms use the same shared Zod schemas from `packages/shared`, so client-side validation mirrors backend rules exactly.

### Session & Authentication

- Authentication uses **JWT tokens** stored in an **httpOnly session cookie**, preventing JavaScript from reading the token.
- The JWT payload includes the user's `activeRole`, allowing multi-role users to switch roles without re-authenticating.
- Tokens expire after the duration configured in `JWT_EXPIRES_IN` (default `7d`).
- All secrets are read from environment variables (`SESSION_SECRET`, `JWT_SECRET`) — never hardcoded.

### Role-Based Access Control (RBAC)

- **Backend** — NestJS **Guards** and **`@Roles()` decorators** protect every route. Requests without a valid JWT or with an insufficient role are rejected with 401/403 before the controller runs.
- **Frontend** — route-level guards read the user's `activeRole` from the session and redirect unauthorized users. `/seller/*` routes redirect non-sellers; `/admin/*` routes redirect non-admins; and so on.
- The four roles are **ADMIN**, **SELLER**, **BUYER**, and **DRIVER** — each with a distinct set of permitted endpoints and UI routes.

---

## 🧪 Demo & Testing Guide

---

## 🐳 Deployment

**Live URL:** [https://seapedia.sharkcat.cloud](https://seapedia.sharkcat.cloud)

The production stack runs on a **Hostinger VPS** and is containerized via `docker-compose.prod.yml`:

| Service    | Description                                             |
| ---------- | ------------------------------------------------------- |
| `api`      | NestJS backend — exposed on `127.0.0.1:8081`            |
| `web`      | React Router SSR frontend — exposed on `127.0.0.1:8080` |
| `postgres` | PostgreSQL 17 database (internal only)                  |

A reverse proxy running on the VPS routes traffic: `/api/*` → `api`, everything else → `web`, and handles TLS termination.

**First deploy:**

```bash
# 1. Copy the env template and fill in production values
cp .env.prod.example .env
nano .env

# 2. Build and start all services
pnpm prod:up

# 3. Run migrations — migrations run automatically on API startup,
#    then seed demo data separately:
pnpm prod:seed
```

**Subsequent deploys:**

```bash
pnpm prod:build && pnpm prod:up
```

**View logs:**

```bash
pnpm prod:logs
```
