# 🚀 7-Day Build-to-Learn: Next.js Architecture Log

## 🎯 Project Goal
A web application to store backlogs and keep short reviews of games the user has played or wants to play. 
Social features include the ability for users to see other users' reviews and backlogs, and to follow each other.

## 🏗️ Tech Stack & Dependencies
### Core Architecture
* **Pattern:** Strict MVC (Model-View-Controller)
* **Methodology:** TDD (Test-Driven Development) - Red/Green/Refactor cycle is mandatory.
* **Framework:** Next.js (App Router)
* **UI Library:** React (Server and Client Components)
* **Language:** TypeScript
* **Styling:** Pure Vanilla CSS (Strictly NO Tailwind CSS, NO CSS-in-JS, NO CSS Modules unless explicitly requested)

### Data & Backend
* **Database:** PostgreSQL
* **Driver:** `node-postgres` (`pg`) for raw SQL queries (Strictly NO ORMs like Prisma, Drizzle, or TypeORM).
* **Connection Management:** Global connection pooling in `src/lib/db.ts` to survive Next.js hot-reloading.

### Tooling & AI
* **Testing:** Jest + React Testing Library (`@testing-library/jest-dom`)
* **Environment:** GitHub Codespaces
* **AI Assistant:** Google Generative AI SDK (`gemini-2.5-flash`)
* **Execution:** `tsx` for local TypeScript scripting (`npm run ai`)

## 🛑 Strict Development Rules for the AI Pilot

1. **Architecture Enforcement:** **Never** mix database queries or complex business logic directly into the `src/app/` components. Always route data access through `models` and business logic through `controllers`.
2. **Stack Compliance:** **Never** assume or use tools outside the defined tech stack (e.g., strictly no Tailwind classes or ORM methods).
3. **Methodology (TDD):** **Always** write or ask to write the Jest test block *first* when implementing a new feature.
4. **Environment Variables:** **Never** expose sensitive keys (like database credentials) to the frontend. Only use the `NEXT_PUBLIC_` prefix for variables that are strictly safe for browser exposure. Validate environment variables before connecting to the database.
5. **Global Error Handling:** **Never** leak raw database errors, SQL queries, or stack traces to the client. The controllers must catch exceptions, log them appropriately on the server, and return standardized, user-friendly HTTP error responses (e.g., 400 Bad Request, 500 Internal Server Error).

---

## 📂 Folder Structure (Strict MVC Enforcement)
```text
log-galinha/
├── src/
│   ├── models/           # [M] Data Access Layer: ONLY pure TS files with node-postgres raw SQL queries. No UI logic.
│   ├── controllers/      # [C] Business Logic & API Route Handlers: Orchestrates models and processes data for the views.
│   ├── app/              # [V] Views: Next.js pages, layouts, React Components, and pure .css files. 
│   │   ├── components/   # Reusable UI components.
│   │   └── hooks/        # Custom React Hooks.
│   ├── lib/              # Shared utilities, AI SDK setup, and DB connection pooling (db.ts).
│   └── types/            # Global TypeScript interfaces and type definitions.
├── __tests__/            # Jest test files strictly mirroring the src/ folder structure.
├── scripts/
│   └── gemini.ts         # Custom AI CLI Tool scripts.
├── jest.config.ts        # Next.js Jest configuration.
├── jest.setup.ts         # DOM testing matchers setup.
└── package.json