# Architecture & Design Document

## 1. System Overview
The Slooze Food Ordering application is a monorepo containing a full-stack solution built with modern web technologies. It implements a robust **Role-Based Access Control (RBAC)** system and a **Regional-Based Access Control (Re-BAC)** model to manage multi-national operations (India & America).

## 2. Tech Stack
-   **Frontend**: Next.js (App Router), Apollo Client, Tailwind CSS.
-   **Backend**: NestJS, GraphQL (Apollo Server), Prisma ORM.
-   **Database**: SQLite (for ease of local setup and review).

## 3. Data Model
Defined in `backend/prisma/schema.prisma`:
-   **User**: email, password (hashed), role (ADMIN, MANAGER, MEMBER), country (INDIA, AMERICA).
-   **Restaurant**: name, cuisine, country, imageUrl.
-   **MenuItem**: name, price, category, linked to Restaurant.
-   **Order**: linked to User and Restaurant, status (PENDING, PLACED, CANCELLED).
-   **PaymentMethod**: linked to User, type (card/upi).
-   **Payment**: record of successful checkout.

## 4. Access Management Implementation

### Role-Based Access Control (RBAC)
Implemented using NestJS Guards (`RolesGuard`) and Custom Decorators (`@Roles`).
-   **Admin**: Global permissions for all operations.
-   **Manager**: Permissions to view data, place orders, and cancel orders.
-   **Member**: Limited to viewing items and creating "Pending" orders.

### Regional-Based Access Control (Re-BAC)
Implemented via database query filtering and manual checks in resolvers.
-   **Query Filtering**: When fetching `restaurants` or `orders`, the `where` clause automatically filters by `user.country` unless the user is an `ADMIN`.
-   **Mutation Guards**: Mutations like `createOrder` or `placeOrder` verify that the target resource (Restaurant/Order) belongs to the same country as the user.

## 5. API Design
The application uses a **GraphQL** API. While all requests transition through a single `POST /graphql` endpoint, the logic is highly modular:
-   **Resolvers**: Logic is split into `AuthResolver`, `RestaurantsResolver`, `OrdersResolver`, and `PaymentsResolver`.
-   **Type Safety**: The `schema.gql` provides an explicit contract between frontend and backend.

## 6. Routing (Frontend)
The frontend uses **Path-based Dynamic Routing**:
-   `/dashboard/restaurants`: Entry point for ordering.
-   `/dashboard/orders`: Personal order history.
-   `/dashboard/all-orders`: Region-wide orders for Managers/Admins.
-   `/dashboard/payments`: Global payment management for Admins.
-   `/dashboard/team`: User management view.

This structure allows for direct URL access, bookmarking, and proper browser history management, distinct from a single-state "Dashboard" view.
