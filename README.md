# TK Concepts

> **Faith. Purpose. Identity.**

A full-stack e-commerce platform for faith-inspired products — games, puzzles, devotionals, storybooks, and ebooks. Built with Next.js 16, Express.js, MongoDB, and deployed on Render.

[![Deployed](https://img.shields.io/badge/Live-Production-22c55e?style=for-the-badge)](https://tkayconcept-frontend.onrender.com)
[![License](https://img.shields.io/badge/License-Proprietary-blue?style=for-the-badge)](#)

---

## Table of Contents

- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Architecture Diagram](#architecture-diagram)
- [Data Flow](#data-flow)
- [Authentication Flow](#authentication-flow)
- [Payment Flow](#payment-flow)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Performance](#performance)

---

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                                   │
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │
│  │   Browser     │  │   Mobile     │  │   PWA        │                 │
│  │   (Desktop)   │  │   (Android)  │  │   (Install)  │                 │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                 │
│         └──────────────────┼──────────────────┘                         │
│                            │                                            │
│  ┌─────────────────────────▼─────────────────────────────┐             │
│  │              Next.js 16 Frontend                       │             │
│  │         React 19 · TypeScript · Tailwind CSS 4         │             │
│  │                                                         │             │
│  │  ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌───────────┐  │             │
│  │  │ App     │ │ Zustand  │ │ React   │ │ Framer    │  │             │
│  │  │ Router  │ │ Stores   │ │ Query   │ │ Motion    │  │             │
│  │  └─────────┘ └──────────┘ └─────────┘ └───────────┘  │             │
│  │  ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌───────────┐  │             │
│  │  │ i18n    │ │ Clerk    │ │ Zod     │ │ Scroll    │  │             │
│  │  │ EN/FR/ES│ │ Auth     │ │ Forms   │ │ Reveal    │  │             │
│  │  └─────────┘ └──────────┘ └─────────┘ └───────────┘  │             │
│  └────────────────────────┬──────────────────────────────┘             │
│                           │                                             │
└───────────────────────────┼─────────────────────────────────────────────┘
                            │ HTTPS
┌───────────────────────────┼─────────────────────────────────────────────┐
│                    API GATEWAY LAYER                                     │
│                           │                                             │
│  ┌────────────────────────▼──────────────────────────────┐             │
│  │              Express.js 5 Backend                      │             │
│  │              Port: 5000 · Node.js 20+                  │             │
│  │                                                         │             │
│  │  ┌──────────┐ ┌───────────┐ ┌────────────┐           │             │
│  │  │ CORS     │ │ Rate      │ │ Auth       │           │             │
│  │  │ Config   │ │ Limiter   │ │ Middleware  │           │             │
│  │  └──────────┘ └───────────┘ └────────────┘           │             │
│  │                                                         │             │
│  │  ┌──────────────────────────────────────────────┐     │             │
│  │  │              Route Handlers                   │     │             │
│  │  │                                               │     │             │
│  │  │  /api/products    /api/orders                 │     │             │
│  │  │  /api/categories  /api/payments              │     │             │
│  │  │  /api/auth        /api/newsletter            │     │             │
│  │  │  /api/coupons     /api/gift-cards            │     │             │
│  │  │  /api/marketing   /api/abandoned-carts       │     │             │
│  │  │  /api/reviews     /api/testimonials          │     │             │
│  │  │  /api/blog        /api/contacts              │     │             │
│  │  └──────────────────────────────────────────────┘     │             │
│  └────────────────────────┬──────────────────────────────┘             │
│                           │                                             │
└───────────────────────────┼─────────────────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────────────────┐
│                      DATA LAYER                                          │
│                           │                                             │
│  ┌────────────────────────▼──────────────────────────────┐             │
│  │              MongoDB Atlas                             │             │
│  │              Mongoose ODM                              │             │
│  │                                                         │             │
│  │  ┌──────────┐ ┌───────────┐ ┌────────────┐           │             │
│  │  │ Users    │ │ Products  │ │ Orders     │           │             │
│  │  │ (Clerk)  │ │ Categories│ │ Payments   │           │             │
│  │  └──────────┘ └───────────┘ └────────────┘           │             │
│  │  ┌──────────┐ ┌───────────┐ ┌────────────┐           │             │
│  │  │ Coupons  │ │ Reviews   │ │ Wishlist   │           │             │
│  │  │ GiftCards│ │ Testimon. │ │ Newsletter │           │             │
│  │  └──────────┘ └───────────┘ └────────────┘           │             │
│  │  ┌──────────┐ ┌───────────┐ ┌────────────┐           │             │
│  │  │ Blog     │ │ Contacts  │ │ Abandoned  │           │             │
│  │  │ Posts    │ │ Messages  │ │ Carts      │           │             │
│  │  └──────────┘ └───────────┘ └────────────┘           │             │
│  └──────────────────────────────────────────────────────┘             │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                                     │
│                                                                         │
│  ┌──────────┐ ┌───────────┐ ┌────────────┐ ┌──────────────┐          │
│  │ Clerk    │ │ Stripe    │ │ Cloudinary │ │ Nodemailer   │          │
│  │ Auth     │ │ Payments  │ │ Media CDN  │ │ SMTP/Email   │          │
│  │ ─────── │ │ ──────── │ │ ───────── │ │ ──────────── │          │
│  │ • SSO    │ │ • Charges │ │ • Uploads  │ │ • Order Conf │          │
│  │ • MFA    │ │ • Webhook │ │ • Resize   │ │ • Recovery   │          │
│  │ • RBAC   │ │ • Refund  │ │ • Optimize │ │ • Marketing  │          │
│  │ • Session│ │ • Payouts │ │ • CDN      │ │ • Gift Card  │          │
│  └──────────┘ └───────────┘ └────────────┘ └──────────────┘          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | Next.js | 16.2.10 | React App Router, SSR, Static Gen |
| **UI** | React | 19.1.0 | Component framework |
| **Styling** | Tailwind CSS | 4.1.10 | Utility-first CSS |
| **Animation** | Framer Motion | 11.18.2 | Scroll reveals, transitions |
| **State** | Zustand | 5.0.5 | Cart, wishlist, currency stores |
| **Forms** | React Hook Form | 7.54.2 | Form management + validation |
| **Validation** | Zod | 4.1.5 | Schema validation |
| **Data Fetching** | Axios + React Query | — | API client + cache |
| **Auth (FE)** | Clerk | 7.5.17 | User auth, session, RBAC |
| **Backend** | Express.js | 5.1.0 | REST API server |
| **Database** | MongoDB + Mongoose | 8.16.0 | Document database + ODM |
| **Auth (BE)** | Clerk Backend SDK | 2.4.1 | Token verification, user mgmt |
| **Payments** | Stripe | 17.7.0 | Payment processing |
| **Media** | Cloudinary | — | Image upload, optimization, CDN |
| **Email** | Nodemailer | 6.9.16 | Transactional emails |
| **Build** | Webpack | — | Next.js production build |
| **Deploy** | Render | — | Backend + Frontend hosting |
| **Database** | MongoDB Atlas | — | Managed cloud database |

---

## Architecture Diagram

### Component Architecture

```mermaid
graph TB
    subgraph Client["Client (Browser)"]
        direction TB
        App["Next.js App"]
        Store["Zustand Stores<br/>Cart · Wishlist · Currency · UI"]
        Providers["Providers<br/>Clerk · React Query · i18n"]
        Pages["Pages<br/>Shop · Cart · Checkout · Admin"]
        Components["Components<br/>Header · Footer · ProductCard · Hero"]
    end

    subgraph API["Express.js API"]
        direction TB
        Middleware["Middleware<br/>CORS · Auth · Rate Limit"]
        Routes["Route Handlers"]
        Controllers["Controllers<br/>Product · Order · Payment"]
        Models["Mongoose Models"]
    end

    subgraph Data["External Services"]
        direction TB
        DB["MongoDB Atlas"]
        Auth["Clerk"]
        Pay["Stripe"]
        Media["Cloudinary"]
        Mail["Nodemailer"]
    end

    App --> Store
    App --> Providers
    App --> Pages
    Pages --> Components
    Components -->|"HTTP/HTTPS"| Middleware
    Middleware --> Routes
    Routes --> Controllers
    Controllers --> Models
    Models --> DB
    Controllers --> Auth
    Controllers --> Pay
    Controllers --> Media
    Controllers --> Mail
```

### Database Schema

```mermaid
erDiagram
    User ||--o{ Order : places
    User ||--o{ Review : writes
    User ||--o{ Wishlist : has
    User ||--o{ AbandonedCart : abandons

    Category ||--o{ Product : contains
    Product ||--o{ OrderItem : "ordered in"
    Product ||--o{ Review : "reviewed in"
    Product ||--o{ WishlistItem : "saved in"

    Order ||--|| Payment : "paid via"
    Order ||--o{ OrderItem : contains
    Order }o--|| Coupon : "uses"
    Order }o--|| GiftCard : "redeems"

    BlogPost }o--|| User : "written by"
    Newsletter }o--|| User : "subscribed by"
    Contact }o--|| User : "submitted by"
    Testimonial }o--|| User : "from"
    Campaign }o--o{ Newsletter : "targets"

    User {
        string _id PK
        string clerkId UK
        string email
        string firstName
        string lastName
        string role "admin | super_admin | user"
        object publicMetadata
        date createdAt
    }

    Product {
        string _id PK
        string name
        string slug UK
        string description
        string richDescription "HTML"
        number price
        number originalPrice
        string brand "TK Concepts | Rooted Identity"
        string category FK
        array images
        object variants "Map of String"
        number stock
        boolean featured
        boolean isNewArrival
        boolean isBestSeller
        number soldCount
        date createdAt
    }

    Category {
        string _id PK
        string name
        string slug UK
        string description
        string image
        number productCount
        boolean isActive
    }

    Order {
        string _id PK
        string orderNumber UK
        object user FK
        array items
        number subtotal
        number shippingCost
        number tax
        number total
        string currency
        string status "pending | confirmed | shipped | delivered"
        string paymentIntentId
        string shippingAddress
        date createdAt
    }

    Review {
        string _id PK
        object user FK
        object product FK
        number rating
        string title
        string comment
        boolean verified
        boolean approved
        date createdAt
    }

    GiftCard {
        string _id PK
        string code UK
        number balance
        number originalAmount
        string purchaser FK
        string recipientEmail
        string status "active | used | expired"
        date expiresAt
    }

    Coupon {
        string _id PK
        string code UK
        string type "percentage | fixed"
        number value
        number minPurchase
        number maxUses
        number usedCount
        boolean isActive
    }

    Campaign {
        string _id PK
        string name
        string type "email | sms"
        string subject
        string content
        number recipientCount
        number sentCount
        string status "draft | sent"
    }

    AbandonedCart {
        string _id PK
        object user FK
        string email
        array items
        number subtotal
        boolean recovered
        boolean recoveryEmailSent
        date createdAt
    }
```

---

## Data Flow

### 1. Product Catalog Flow

```mermaid
sequenceDiagram
    participant Browser
    participant NextJS as Next.js Frontend
    participant API as Express API
    participant DB as MongoDB Atlas
    participant CDN as Cloudinary

    Browser->>NextJS: Visit /shop
    NextJS->>API: GET /api/products
    API->>DB: Product.find({}).populate('category')
    DB-->>API: Products[]
    API-->>NextJS: { data: Products[] }
    NextJS->>NextJS: Cache (React Query)
    NextJS-->>Browser: Rendered product grid

    Note over Browser,CDN: Images served from Cloudinary CDN
    Browser->>CDN: GET product image
    CDN-->>Browser: Optimized image (f_auto, q_auto)
```

### 2. Order & Payment Flow

```mermaid
sequenceDiagram
    participant Customer
    participant Frontend as Next.js
    participant API as Express API
    participant Stripe
    participant DB as MongoDB
    participant Email as Nodemailer

    Customer->>Frontend: Click "Place Order"
    Frontend->>API: POST /api/payments/create-intent
    API->>Stripe: Create PaymentIntent (GBP)
    Stripe-->>API: client_secret
    API-->>Frontend: client_secret

    Frontend->>Stripe: Confirm payment
    Stripe-->>Frontend: Payment confirmed

    Frontend->>API: POST /api/orders
    API->>DB: Order.create({ ... })
    API->>Email: Send order confirmation
    Email-->>Customer: Order confirmation email
    API-->>Frontend: Order created
    Frontend-->>Customer: Order success page
```

### 3. Admin CRUD Flow

```mermaid
sequenceDiagram
    participant Admin
    participant Frontend as Admin Dashboard
    participant API as Express API
    participant Clerk as Clerk Auth
    participant DB as MongoDB
    participant Cloudinary as Cloudinary

    Admin->>Frontend: Navigate to /admin/products
    Frontend->>Clerk: Verify session + role
    Clerk-->>Frontend: Authorized (admin)

    Frontend->>API: GET /api/products (admin)
    API->>DB: Product.find({})
    DB-->>API: Products[]
    API-->>Frontend: Products[]

    Admin->>Frontend: Upload new product
    Frontend->>Cloudinary: Upload images
    Cloudinary-->>Frontend: Image URLs
    Frontend->>API: POST /api/products
    API->>DB: Product.create(data)
    API-->>Frontend: Created product
```

---

## Authentication Flow

```mermaid
flowchart TD
    A[User visits site] --> B{Signed In?}
    B -->|No| C[Sign In Page]
    B -->|Yes| D[Dashboard / Shop]

    C --> E[Clerk Widget]
    E --> F[Email / OAuth]
    F --> G[Clerk Verifies]
    G --> H[JWT Token]
    H --> I[Session Created]
    I --> D

    D --> J{Route Guard}
    J -->|Public| K[Allow]
    J -->|Customer| L{Has Session?}
    L -->|Yes| K
    L -->|No| C
    J -->|Admin| M{Has Admin Role?}
    M -->|Yes| N[Admin Dashboard]
    M -->|No| O[Access Denied Page]

    subgraph "Role-Based Access"
        P[User Role] --> Q[Shop, Cart, Orders]
        R[Admin Role] --> S[Full Dashboard]
        T[Super Admin] --> S
    end
```

---

## Payment Flow

```mermaid
flowchart LR
    A[Cart] --> B[Checkout]
    B --> C[Shipping Info]
    C --> D{Has Coupon?}
    D -->|Yes| E[Apply Discount]
    D -->|No| F[Calculate Total]
    E --> F
    F --> G[Stripe PaymentIntent]
    G --> H[3D Secure Check]
    H -->|Passed| I[Charge Card]
    H -->|Failed| J[Retry / Error]
    I --> K[Webhook Confirmation]
    K --> L[Create Order]
    L --> M[Send Confirmation Email]
    L --> N[Update Inventory]
    L --> O[Clear Cart]

    subgraph "GBP Currency"
        G -.-> P[Currency: GBP]
        I -.-> P
    end
```

---

## Project Structure

```
tkayconcept/
├── frontend/                          # Next.js 16 App Router
│   ├── src/
│   │   ├── app/
│   │   │   ├── (public)/              # Public pages (no auth)
│   │   │   │   ├── page.tsx           # Homepage
│   │   │   │   ├── shop/              # Shop + category pages
│   │   │   │   ├── about/             # About page
│   │   │   │   ├── contact/           # Contact form
│   │   │   │   ├── faq/               # FAQ
│   │   │   │   ├── blog/              # Blog listing
│   │   │   │   ├── terms/             # Terms of service
│   │   │   │   ├── privacy/           # Privacy policy
│   │   │   │   ├── returns/           # Return policy
│   │   │   │   ├── shipping/          # Shipping policy
│   │   │   │   ├── community/         # Community page
│   │   │   │   ├── rooted-identity/   # Brand collection
│   │   │   │   └── custom-printing/   # Redirect to Rooted Identity
│   │   │   ├── (customer)/            # Auth-required pages
│   │   │   │   ├── cart/              # Shopping cart
│   │   │   │   ├── checkout/          # Checkout flow
│   │   │   │   ├── orders/            # Order history
│   │   │   │   ├── wishlist/          # Saved items
│   │   │   │   ├── gift-cards/        # Gift card purchase
│   │   │   │   └── track/             # Order tracking
│   │   │   ├── admin/                 # Admin dashboard
│   │   │   │   ├── products/          # Product management
│   │   │   │   ├── categories/        # Category management
│   │   │   │   ├── orders/            # Order management
│   │   │   │   ├── customers/         # Customer list
│   │   │   │   ├── coupons/           # Coupon management
│   │   │   │   ├── blog/              # Blog management
│   │   │   │   ├── analytics/         # Store analytics
│   │   │   │   ├── marketing/         # Email campaigns
│   │   │   │   ├── abandoned-carts/   # Cart recovery
│   │   │   │   ├── testimonials/      # Social proof
│   │   │   │   ├── media/             # Image uploads
│   │   │   │   ├── settings/          # Store settings
│   │   │   │   └── homepage-builder/  # Homepage customization
│   │   │   ├── sign-in/               # Clerk sign-in
│   │   │   ├── sign-up/               # Clerk sign-up
│   │   │   └── layout.tsx             # Root layout
│   │   │
│   │   ├── components/
│   │   │   ├── home/                  # Homepage sections
│   │   │   ├── shop/                  # Product cards, filters
│   │   │   ├── layout/                # Header, Footer, Admin
│   │   │   ├── shared/                # Cart drawer, search, popups
│   │   │   └── ui/                    # Button, Input, Modal, etc.
│   │   │
│   │   ├── lib/
│   │   │   ├── api.ts                 # Axios instance + retry
│   │   │   ├── safe-clerk.ts          # Clerk with error boundary
│   │   │   ├── constants.ts           # Site config, URLs, socials
│   │   │   ├── utils.ts               # formatPrice, cn, etc.
│   │   │   ├── validations.ts         # Zod schemas
│   │   │   └── opt-img.ts            # Cloudinary image optimizer
│   │   │
│   │   ├── stores/                    # Zustand state stores
│   │   │   ├── cartStore.ts
│   │   │   ├── wishlistStore.ts
│   │   │   ├── currencyStore.ts
│   │   │   └── uiStore.ts
│   │   │
│   │   ├── hooks/                     # Custom React hooks
│   │   │   ├── useAuthenticatedApi.ts
│   │   │   ├── useKeepAlive.ts
│   │   │   └── useRefetchOnWakeUp.ts
│   │   │
│   │   ├── i18n/                      # Internationalization
│   │   │   ├── en.json
│   │   │   ├── fr.json
│   │   │   └── es.json
│   │   │
│   │   └── types/
│   │       └── index.ts               # TypeScript interfaces
│   │
│   ├── public/                        # Static assets
│   │   ├── favicon.ico
│   │   ├── logo.png                   # Brand logo
│   │   ├── og-image.png               # Social share image
│   │   └── manifest.json              # PWA manifest
│   │
│   ├── package.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── backend/                           # Express.js 5 API
│   ├── src/
│   │   ├── models/                    # Mongoose schemas
│   │   │   ├── Product.js
│   │   │   ├── Category.js
│   │   │   ├── Order.js
│   │   │   ├── User.js
│   │   │   ├── Review.js
│   │   │   ├── Coupon.js
│   │   │   ├── GiftCard.js
│   │   │   ├── Campaign.js
│   │   │   ├── AbandonedCart.js
│   │   │   ├── Newsletter.js
│   │   │   ├── Contact.js
│   │   │   ├── Testimonial.js
│   │   │   └── BlogPost.js
│   │   │
│   │   ├── routes/                    # API route definitions
│   │   │   ├── product.routes.js
│   │   │   ├── order.routes.js
│   │   │   ├── payment.routes.js
│   │   │   ├── coupon.routes.js
│   │   │   ├── gift-card.routes.js
│   │   │   ├── marketing.routes.js
│   │   │   ├── abandoned-cart.routes.js
│   │   │   ├── review.routes.js
│   │   │   ├── blog.routes.js
│   │   │   ├── contact.routes.js
│   │   │   └── newsletter.routes.js
│   │   │
│   │   ├── controllers/               # Business logic
│   │   │   ├── order.controller.js
│   │   │   └── coupon.js
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.js                # Clerk token verification
│   │   │   ├── errorHandler.js        # Global error handler
│   │   │   └── cors.js                # CORS configuration
│   │   │
│   │   ├── utils/
│   │   │   ├── email.js               # Nodemailer setup
│   │   │   ├── cloudinary.js          # Cloudinary config
│   │   │   └── stripe.js              # Stripe setup
│   │   │
│   │   ├── seeds/                     # Database seeders
│   │   │   ├── seed.js                # Products + Categories
│   │   │   ├── seed-testimonials.js
│   │   │   └── seed-blog.js
│   │   │
│   │   ├── migrations/                # Data migrations
│   │   │   └── rebrand-to-tk-concepts.js
│   │   │
│   │   ├── server.js                  # Entry point
│   │   └── app.js                     # Express app setup
│   │
│   ├── __tests__/                     # Jest test suites
│   │   └── routes/
│   │       └── api.test.js            # 57 tests, 5 suites
│   │
│   ├── package.json
│   └── jest.config.js
│
├── .github/                           # GitHub Actions (if any)
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** 20+
- **MongoDB Atlas** account (free tier)
- **Clerk** account (free tier)
- **Stripe** account (test mode)
- **Cloudinary** account (free tier)
- **Render** account (free tier)

### Quick Start

```bash
# Clone the repository
git clone <repo-url>
cd tkayconcept

# Backend setup
cd backend
cp .env.example .env    # Fill in environment variables
npm install
npm run seed            # Seed database with initial data
npm run dev             # Starts on http://localhost:5000

# Frontend setup (new terminal)
cd ../frontend
cp .env.example .env    # Fill in environment variables
npm install
npm run dev             # Starts on http://localhost:3000
```

### Run Tests

```bash
cd backend
npm test                # Jest — 57 tests across 5 suites
```

---

## Environment Variables

### Backend (`backend/.env`)

```env
# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/tkayconcept

# Clerk
CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Email (SMTP)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
EMAIL_FROM=noreply@tkconcepts.co.uk

# App
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Frontend (`frontend/.env`)

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# API
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
```

---

## API Reference

### Products

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/products` | Public | List all products |
| `GET` | `/api/products/featured` | Public | Featured products |
| `GET` | `/api/products/best-sellers` | Public | Best sellers |
| `GET` | `/api/products/new-arrivals` | Public | New arrivals |
| `GET` | `/api/products/:id` | Public | Get product by ID |
| `POST` | `/api/products` | Admin | Create product |
| `PUT` | `/api/products/:id` | Admin | Update product |
| `DELETE` | `/api/products/:id` | Admin | Delete product |

### Orders

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/orders` | User | Get user's orders |
| `GET` | `/api/orders/:id` | User | Get order details |
| `POST` | `/api/orders` | User | Create order |
| `GET` | `/api/orders/admin/all` | Admin | All orders |
| `PUT` | `/api/orders/:id/status` | Admin | Update status |

### Payments

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/payments/create-intent` | User | Create Stripe PaymentIntent |
| `POST` | `/api/payments/webhook` | Stripe | Stripe webhook handler |

### Other

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/categories` | Public | List categories |
| `POST` | `/api/coupons/validate` | User | Validate coupon code |
| `POST` | `/api/newsletter/subscribe` | Public | Subscribe to newsletter |
| `GET` | `/api/reviews/:productId` | Public | Product reviews |
| `POST` | `/api/reviews` | User | Submit review |
| `GET` | `/api/health` | Public | Health check |
| `POST` | `/api/gift-cards/purchase` | User | Purchase gift card |
| `POST` | `/api/gift-cards/redeem` | User | Redeem gift card |

---

## Deployment

### Render (Production)

```
┌──────────────────────────────────────────────────┐
│                  RENDER SERVICES                  │
│                                                    │
│  ┌────────────────────┐  ┌──────────────────────┐ │
│  │  Backend Service    │  │  Frontend Service    │ │
│  │                     │  │                      │ │
│  │  Runtime: Node.js   │  │  Runtime: Node.js    │ │
│  │  Build: npm install │  │  Build: next build   │ │
│  │  Start: node server │  │  --webpack           │ │
│  │  Plan: Free (512MB) │  │  Start: npm start    │ │
│  │                     │  │  Plan: Free (512MB)  │ │
│  │  Region: Oregon     │  │  Region: Oregon      │ │
│  └─────────┬──────────┘  └──────────┬───────────┘ │
│            │                         │              │
│            └────────┬────────────────┘              │
│                     │                               │
│              ┌──────▼──────┐                        │
│              │  MongoDB     │                        │
│              │  Atlas       │                        │
│              │  (Free M0)   │                        │
│              └─────────────┘                        │
└──────────────────────────────────────────────────┘
```

### Build Optimization

| Technique | Implementation |
|-----------|---------------|
| **Webpack** | `next build --webpack` (avoids Turbopack OOM on 512MB) |
| **Memory** | `NODE_OPTIONS=--max-old-space-size=400` |
| **Keep-alive** | Pings `/health` every 4 min to prevent spin-down |
| **Image optimization** | Cloudinary `f_auto,q_auto,c_fill` at component level |

---

## Performance

### Frontend Optimizations

- **Webpack build** — avoids Turbopack OOM on Render free tier
- **Cloudinary image transforms** — `f_auto,q_auto,c_fill` served from CDN
- **Zustand** — lightweight stores (cart, wishlist, currency, UI)
- **Scroll reveals** — framer-motion `whileInView` with `once: true`
- **Keep-alive pings** — prevents Render spin-down (4-min interval)
- **Offline detection** — banner with auto-retry on network recovery
- **Lazy loading** — React Query caching + stale-while-revalidate

### Backend Optimizations

- **Graceful degradation** — Nodemailer failures don't block responses
- **Error boundaries** — Clerk, auth, and API failures handled gracefully
- **Rate limiting** — API protection against abuse
- **MongoDB indexes** — indexed on slug, orderNumber, clerkId
- **Keep-alive** — `/health` endpoint for uptime monitoring

---

## License

Proprietary — TK Concepts. All rights reserved.
