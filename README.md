# Slooze Food Ordering (Monorepo)

Full-stack food ordering application built for the Slooze take-home assignment using:
- `backend`: NestJS + GraphQL (code-first) + Prisma ORM + SQLite
- `frontend`: Next.js 14 (App Router) + Apollo Client + Tailwind CSS + TypeScript

This repository implements RBAC and the bonus country-scoped Re-BAC exactly as specified in the assignment.

---

## Assignment Requirements Coverage

### Functional Access Table (RBAC)

| # | Function | Admin | Manager | Member |
|---|---|---|---|---|
| 1 | View restaurants & menu items | ✅ | ✅ | ✅ |
| 2 | Create order (add food items) | ✅ | ✅ | ✅ |
| 3 | Place order (checkout & pay) | ✅ | ✅ | ❌ |
| 4 | Cancel order | ✅ | ✅ | ❌ |
| 5 | Update payment method | ✅ | ❌ | ❌ |

### Bonus Objective (Re-BAC)

Country-scoped access is implemented across all data layers:

| Role | Data Scope |
|---|---|
| `ADMIN` | Global — sees all countries |
| `MANAGER` | Own country only (India or America) |
| `MEMBER` | Own country only (India or America) |

Managers and Members from India cannot access or act on any data associated with America, and vice-versa. This is enforced at the GraphQL resolver level — not just the UI.

---

## Business Scenario (Seeded Data)

Users pre-seeded per the problem statement:

| Name | Email | Role | Country |
|---|---|---|---|
| Nick Fury | nick@shield.com | ADMIN | America |
| Captain Marvel | marvel@shield.com | MANAGER | India |
| Captain America | america@shield.com | MANAGER | America |
| Thanos | thanos@shield.com | MEMBER | India |
| Thor | thor@shield.com | MEMBER | India |
| Travis | travis@shield.com | MEMBER | America |

**Default password for all users:** `password123`

Restaurants, menu items, and payment methods are also pre-seeded (see `backend/prisma/seed.ts`).

---

## Monorepo Structure

```
food-ordering/
├── README.md
├── ARCHITECTURE.md
├── postman_collection.json
├── package.json                  ← root scripts (setup + dev)
├── backend/
│   ├── .env
│   ├── nest-cli.json
│   ├── tsconfig.json
│   ├── package.json
│   ├── prisma/
│   │   ├── schema.prisma         ← DB schema (User, Restaurant, Order, Payment...)
│   │   └── seed.ts               ← mock data seeder
│   └── src/
│       ├── main.ts
│       ├── app.module.ts
│       ├── schema.gql            ← auto-generated GraphQL schema
│       ├── auth/                 ← JWT login + Passport strategy
│       ├── common/               ← RolesGuard, enums, JWT guard, Re-BAC helper
│       ├── users/                ← user queries (country-scoped)
│       ├── restaurants/          ← restaurant + menu queries (country-scoped)
│       ├── orders/               ← full order lifecycle with RBAC + Re-BAC
│       ├── payments/             ← payment method management (Admin only)
│       └── prisma/               ← PrismaService (global module)
└── frontend/
    ├── .env.local
    ├── next.config.js
    ├── tailwind.config.js
    ├── tsconfig.json
    ├── package.json
    └── src/
        ├── app/
        │   ├── layout.tsx
        │   ├── page.tsx                    ← redirect to /login or /dashboard
        │   ├── login/page.tsx              ← login + quick demo buttons
        │   └── dashboard/
        │       ├── page.tsx                ← tab-based dashboard shell
        │       ├── restaurants/page.tsx
        │       ├── orders/page.tsx
        │       ├── all-orders/page.tsx
        │       ├── payments/page.tsx
        │       └── team/page.tsx
        ├── components/
        │   ├── Navbar.tsx
        │   ├── RestaurantsTab.tsx          ← browse + cart + checkout
        │   ├── OrdersTab.tsx               ← view + place + cancel orders
        │   ├── PaymentsTab.tsx             ← Admin-only payment management
        │   └── TeamTab.tsx                 ← country-scoped team list
        ├── graphql/
        │   └── queries.ts                  ← all GQL queries and mutations
        └── lib/
            ├── apollo.tsx                  ← Apollo Client + auth link
            └── auth.tsx                    ← auth context + RBAC helpers
```

---

## Architecture Summary

```
┌─────────────────────────────────────────────┐
│         Frontend (Next.js 14 App Router)     │
│  React · TypeScript · Tailwind · Apollo      │
│  Port: 3000                                  │
└──────────────────┬──────────────────────────┘
                   │ GraphQL over HTTP (Bearer JWT)
┌──────────────────▼──────────────────────────┐
│         Backend (NestJS)                     │
│  GraphQL Code-First · Passport JWT           │
│  RolesGuard (RBAC) · checkCountryAccess      │
│  Port: 4000                                  │
└──────────────────┬──────────────────────────┘
                   │ Prisma ORM
┌──────────────────▼──────────────────────────┐
│         SQLite Database                      │
│  User · Restaurant · MenuItem                │
│  Order · OrderItem · PaymentMethod · Payment │
└─────────────────────────────────────────────┘
```

1. Frontend calls the GraphQL API with a JWT bearer token in every request.
2. NestJS validates the JWT via Passport, then applies `JwtAuthGuard` and `RolesGuard`.
3. Resolver-level `checkCountryAccess()` enforces Re-BAC country filtering.
4. Prisma ORM handles all database access with full type safety.

---

## Prerequisites

- **Node.js** `>= 20.17` recommended
- **npm**

Verify:
```bash
node -v
npm -v
```

---

## Environment Variables

### Backend — `backend/.env`

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="super-secret-jwt-key-change-in-production"
PORT=4000
FRONTEND_URL="http://localhost:3000"
```

### Frontend — `frontend/.env.local`

```env
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql
```

Both files are included in the repository for local development convenience.

---

## Run Locally

### Option A: One-command setup (recommended)

From the repo root:

```bash
npm install
npm run setup
npm run dev
```

This installs all dependencies, sets up the database, seeds mock data, and starts both servers concurrently.

### Option B: Run backend and frontend separately

**Backend:**

```bash
cd backend
npm install
npm run setup        # runs: prisma generate + migrate dev + seed
npm run start:dev    # starts NestJS with hot reload
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

**URLs:**
- Frontend: `http://localhost:3000`
- Backend GraphQL Playground: `http://localhost:4000/graphql`

---

## GraphQL API Reference

### Authentication

```graphql
mutation Login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    accessToken
    user { id name email role country }
  }
}
```

### Restaurants & Menu (all roles — country-filtered for non-Admin)

```graphql
query GetRestaurants {
  restaurants {
    id name cuisine country imageUrl
    menuItems { id name description price category }
  }
}
```

### Orders

```graphql
# All roles — Re-BAC enforced on restaurantId
mutation CreateOrder($restaurantId: String!, $items: [OrderItemInput!]!) {
  createOrder(restaurantId: $restaurantId, items: $items) { id status total }
}

# Admin + Manager only
mutation PlaceOrder($orderId: ID!, $paymentMethodId: String!) {
  placeOrder(orderId: $orderId, paymentMethodId: $paymentMethodId) { id status }
}

# Admin + Manager only
mutation CancelOrder($orderId: ID!) {
  cancelOrder(orderId: $orderId) { id status }
}

query GetMyOrders { myOrders { id status total country createdAt items { quantity price } } }
query GetAllOrders { orders { id status total country userId createdAt } }   # country-scoped
```

### Payment Methods (Admin only)

```graphql
mutation AddPaymentMethod($input: CreatePaymentMethodInput!, $userId: String!) {
  addPaymentMethod(input: $input, userId: $userId) { id type last4 upiId isDefault }
}

mutation UpdatePaymentMethod($id: ID!, $input: CreatePaymentMethodInput!) {
  updatePaymentMethod(id: $id, input: $input) { id type last4 upiId isDefault }
}

mutation DeletePaymentMethod($id: ID!) {
  deletePaymentMethod(id: $id) { id }
}
```

Full API collection available in `postman_collection.json`.

---

## Dataset Used

Mock dataset seeded via `backend/prisma/seed.ts`:

- **6 users** with assigned roles and countries
- **4 restaurants** — 2 in India (Spicy Kitchen, Biryani House), 2 in America (The Burger Joint, Pizza Palace)
- **20 menu items** across all restaurants (5 per restaurant, various categories)
- **3 default payment methods** for Admin and Manager users

---

## Security Design

- JWT tokens with 7-day expiration, signed with a configurable secret
- Passwords hashed with `bcryptjs` (10 salt rounds)
- All mutations and protected queries require a valid JWT (`JwtAuthGuard`)
- Role enforcement via `@Roles()` decorator + `RolesGuard` at resolver level
- Country enforcement via `checkCountryAccess()` utility — throws `ForbiddenException` for cross-country access
- CORS restricted to the configured frontend origin

---

## Troubleshooting

**`@prisma/client did not initialize yet`**
```bash
cd backend && npx prisma generate && npm run setup
```

**`DATABASE_URL` missing error**
Ensure `backend/.env` exists with the values shown in the Environment Variables section.

**Port 4000 already in use**
```bash
lsof -ti:4000 | xargs kill   # Mac/Linux
# or change PORT=4001 in backend/.env
```

**Orders not appearing after checkout**
Apollo Client is configured to refetch queries after mutations. If stale data appears, log out and back in — this clears the cache.

**Prisma migration conflict**
Delete `backend/prisma/dev.db` and re-run `npm run setup` in the backend directory.