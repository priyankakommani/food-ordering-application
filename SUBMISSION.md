# Submission Summary: Slooze Food Ordering Application

**Candidate Name:** Priyanka Kommani  
**Role:** SDE Take Home Assignment  
**Tech Stack:** Next.js, NestJS, GraphQL, Prisma, SQLite

## 🚀 Project Overview
This submission is a full-stack food ordering application built as a monorepo. It features a robust **Role-Based Access Control (RBAC)** system and a **Regional-Based Access Control (Re-BAC)** model, designed to handle multi-region business operations (India & America) seamlessly.

## 🛠️ Key Features Implemented
-   **RBAC System**: Fully implemented functional access for Admin, Manager, and Member roles as per the requirements table.
-   **Bonus Objective (Re-BAC)**: Implemented a relational access model where Managers and Members are restricted to their own country's data and actions, while the Admin maintains global visibility.
-   **GraphQL Architecture**: A modular API design using resolvers and guards to ensure security and performance.
-   **Path-based Routing**: Refactored dashboard to use path-based routing (`/dashboard/restaurants`, `/dashboard/orders`, etc.) for better UX and browser history support.

## 📂 Submission Deliverables

| Requirement | Deliverable / Location |
|---|---|
| **Programming Stack** | Next.js (App Router) & NestJS (GraphQL) |
| **Local Setup Instructions** | [README.md](./README.md) |
| **Architecture & Design** | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| **API Documents** | GraphQL Schema in `backend/src/schema.gql` and [Postman Collection](./postman_collection.json) |
| **Seeded Datasets** | Mock data seeded via `backend/prisma/seed.ts` |
| **Git Repository** | [Insert Git Link Here] |
| **Demo Video** | [Insert Demo Link Here] |

## ✅ Objective Completion Checklist
-   [x] **Design full stack web app**: Completed using modern Next.js/NestJS architecture.
-   [x] **Implement Access Management (RBAC)**: All 5 functions restricted per the access table.
-   [x] **Bonus: Relational Access Model (Re-BAC)**: Data and features restricted by country (India vs. America).
-   [x] **Path-based Navigation**: Implemented for all dashboard modules.

---
**Note:** For the best experience during review, I recommend following the **One-Command Setup** mentioned in the [README.md](./README.md) to initialize the database and start both servers simultaneously.
