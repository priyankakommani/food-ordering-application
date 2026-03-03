# Slooze Food Ordering (Monorepo)

Full-stack food ordering application built for the Slooze take-home assignment using:
- `backend`: NestJS + GraphQL + Prisma + SQLite
- `frontend`: Next.js + Apollo Client + Tailwind

This repository implements RBAC and bonus country-scoped Re-BAC exactly as requested in the assignment.

## Assignment Requirements

### Functional Access Table (RBAC)

| # | Function | Admin | Manager | Member |
|---|---|---|---|---|
| 1 | View restaurants & menu items | Yes | Yes | Yes |
| 2 | Create order (add food items) | Yes | Yes | Yes |
| 3 | Place order (checkout & pay) | Yes | Yes | No |
| 4 | Cancel order | Yes | Yes | No |
| 5 | Update payment method | Yes | No | No |

### Bonus Objective (Re-BAC)

Country-scoped access is implemented:
- `ADMIN`: global access
- `MANAGER`: access limited to own country
- `MEMBER`: access limited to own country

Managers and members from India cannot access America data and vice-versa.

## Objectives Coverage

- Full-stack app implementation: Completed
- RBAC implementation per access table: Completed
- Bonus Re-BAC (country scoped): Completed

## Business Scenario Data

Users seeded as per problem statement:
- Nick Fury (`ADMIN`, `AMERICA`)
- Captain Marvel (`MANAGER`, `INDIA`)
- Captain America (`MANAGER`, `AMERICA`)
- Thanos (`MEMBER`, `INDIA`)
- Thor (`MEMBER`, `INDIA`)
- Travis (`MEMBER`, `AMERICA`)

Default password for all seeded users: `password123`

## Monorepo Structure

```text
food-ordering/
├── ARCHITECTURE.md
├── README.md
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
│       ├── auth/
│       ├── common/
│       ├── users/
│       ├── restaurants/
│       ├── orders/
│       ├── payments/
│       ├── prisma/
│       └── app.module.ts
├── frontend/
│   └── src/
│       ├── app/
│       ├── components/
│       ├── graphql/
│       └── lib/
└── package.json
```

## Architecture Summary

1. Frontend (Next.js) calls GraphQL API with JWT bearer token.
2. Backend (NestJS GraphQL) validates JWT and role/country guards.
3. Prisma ORM accesses SQLite database.
4. Seed script provides users, restaurants, menu items, and payment methods.

## Prerequisites

- Node.js `>= 20.17` recommended
- npm

## Environment Variables

### Backend (`backend/.env`)

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="super-secret-jwt-key-change-in-production"
PORT=4000
FRONTEND_URL="http://localhost:3000"
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql
```

## Run Locally

### Option A: One-command setup (recommended)

From repo root:

```bash
npm install
npm run setup
npm run dev
```

### Option B: Run backend and frontend separately

Backend:

```bash
cd backend
npm install
npm run setup
npm run start:dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

URLs:
- Frontend: `http://localhost:3000`
- Backend GraphQL: `http://localhost:4000/graphql`

## GraphQL APIs (Core)

### Login

```graphql
mutation Login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    accessToken
    user { id name email role country }
  }
}
```

### Restaurants and Menu

```graphql
query GetRestaurants {
  restaurants {
    id
    name
    cuisine
    country
    menuItems { id name description price category }
  }
}
```

### Orders

```graphql
mutation CreateOrder($restaurantId: String!, $items: [OrderItemInput!]!) {
  createOrder(restaurantId: $restaurantId, items: $items) { id status total }
}

mutation PlaceOrder($orderId: ID!, $paymentMethodId: String!) {
  placeOrder(orderId: $orderId, paymentMethodId: $paymentMethodId) { id status }
}

mutation CancelOrder($orderId: ID!) {
  cancelOrder(orderId: $orderId) { id status }
}
```

### Payment Methods (Admin only)

```graphql
mutation AddPaymentMethod($input: CreatePaymentMethodInput!, $userId: String!) {
  addPaymentMethod(input: $input, userId: $userId) { id type last4 upiId isDefault }
}

mutation UpdatePaymentMethod($id: ID!, $input: CreatePaymentMethodInput!) {
  updatePaymentMethod(id: $id, input: $input) { id type last4 upiId isDefault }
}
```

## Dataset Used

Mock dataset is seeded via:
- `backend/prisma/seed.ts`

It includes:
- Users with roles/countries
- India and America restaurants
- Menu items
- Initial payment methods

## Design and Security Notes

- JWT-based authentication (`Authorization: Bearer <token>`)
- Role-based access via guards/decorators
- Country-level filtering and checks for Re-BAC
- Backend validation on order creation, payment method usage, and payment method updates

## Submission Checklist (as requested in assignment note)

- [x] Source code repository (this monorepo)
- [x] README with local setup
- [x] Architecture & Design document ([ARCHITECTURE.md](./ARCHITECTURE.md))
- [x] Seed dataset (`prisma/seed.ts`)
- [x] API definitions via GraphQL schema (`backend/src/schema.gql`)
- [x] API Collection ([postman_collection.json](./postman_collection.json))
- [ ] Demo video or deployment link (to be added before final submission)

## Troubleshooting

### Prisma init error: `@prisma/client did not initialize yet`

Run:

```bash
cd backend
npm run prisma:generate
npm run setup
```

### `DATABASE_URL` missing error

Ensure `backend/.env` exists (see environment section above).

### Orders not appearing immediately

Logout/login once and refresh dashboard; queries are configured to refetch from network after mutations.

