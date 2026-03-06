# 🚀 7-Day Build-to-Learn: Next.js Architecture Log

## 🎯 Project Goal
A web application for store backlogs, reviews of games played and games the user want to play.
The users can see other users reviews, backlogs, and fallow each other.

## 🏗️ Tech Stack & Dependencies
### Core Architecture
* **Pattern:** Strict MVC (Model-View-Controller)
* **Methodology:** TDD (Test-Driven Development)
* **Framework:** Next.js (App Router)
* **UI Library:** React
* **Language:** TypeScript
* **Styling:** Pure Vanilla CSS 

### Data & Backend
* **Database:** PostgreSQL
* **Driver:** `node-postgres` (`pg`) for raw SQL queries
* **Connection Management:** Global connection pooling in `src/lib/db.ts` to survive Next.js hot-reloading.

### Tooling & AI
* **Testing:** Jest + React Testing Library (`@testing-library/jest-dom`)
* **Environment:** GitHub Codespaces
* **AI Assistant:** Google Generative AI SDK (`gemini-2.5-flash`)
* **Execution:** `tsx` for local TypeScript scripting (`npm run ai`)

---

## 📂 Folder Structure (MVC + TDD)
```text
log-galinha/
├── src/
│   ├── models/           # [M] node-postgres SQL queries and data logic
│   ├── app/              # [V] React Components, Pages, and pure .css files
│   ├── controllers/      # [C] API Route Handlers routing data to views
│   ├── lib/              # DB connection pooling (db.ts) and shared helpers
│   └── types/            # Global TypeScript interfaces
├── __tests__/            # Jest test files matching the src/ structure
├── scripts/
│   └── gemini.ts         # Custom AI CLI Tool
├── jest.config.ts        # Next.js Jest configuration
├── jest.setup.ts         # DOM testing matchers setup
└── package.json