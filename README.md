# Goalsetter+

A full-stack goal tracking app built with the MERN stack. Designed as a portfolio project showcasing advanced React patterns, AI integration, real-time analytics, and production deployment.

**Live Demo:** [goalsetter-plus.vercel.app](https://goalsetter-plus.vercel.app)

---

## Features

### Core
- JWT authentication — register, login, protected routes, auto-logout on token expiry
- Full Goals CRUD with status toggle (Active ↔ Completed)
- Sub-tasks per goal with individual completion tracking
- Notes field for context, links, or research per goal
- Due dates with overdue detection and countdown badges ("in 3d", "Due today")
- Natural language date input — type "next Friday" or "in 2 weeks" and it parses automatically

### Dashboard
- Tab navigation: **Goals | Analytics | AI Suggest | Share** — all features visible without scrolling
- Stats cards: Total / Active / Done / Overdue — update instantly (computed from local state, no extra round-trip)
- Completion rate progress bar
- Inline filter toolbar: status pills, search, and sort — always visible alongside the goals list

### Analytics
- **Goals by category** — donut chart with breakdown
- **Goals completed over time** — line chart (7d / 30d toggle)
- Completions tracked via a dedicated `completedAt` timestamp (not `updatedAt`) for accuracy
- Charts refresh automatically when the Analytics tab is opened or a goal is completed

### AI Goal Suggestions (Claude API)
- Describe what you want to achieve in plain English
- Claude (Haiku) suggests 3 SMART goals — specific, measurable, time-bound
- One-click to add any suggestion directly to your goals list
- Rate limited to prevent abuse

### Public Share Link
- Generate a read-only shareable link to your goals
- Anyone can view without an account — great for accountability partners
- Revokable at any time

---

## Tech Stack

**Frontend**
- React 19 + Vite
- Redux Toolkit (state management, async thunks)
- React Router v7
- Recharts (analytics charts)
- chrono-node (natural language date parsing)
- Axios with 401 interceptor (auto-logout on expired token)

**Backend**
- Node.js + Express
- MongoDB Atlas + Mongoose
- JWT authentication (httpOnly-ready)
- express-validator (input validation)
- Helmet + CORS + Rate limiting
- Anthropic SDK (Claude Haiku for AI suggestions)

**Deployment**
- Frontend: Vercel (with SPA rewrites)
- Backend: Render (Node.js service)
- Database: MongoDB Atlas

---

## API Endpoints

**Auth**
```
POST   /api/users          Register
POST   /api/users/login    Login
GET    /api/users/me       Get current user
```

**Goals** (protected)
```
GET    /api/goals            List goals (filterable by status, category, priority)
POST   /api/goals            Create goal
PUT    /api/goals/:id        Update goal (title, category, priority, status, dueDate, subtasks, notes)
DELETE /api/goals/:id        Delete goal
GET    /api/goals/stats      Total / active / completed / overdue counts
GET    /api/goals/analytics  Completions by day + breakdown by category
```

**AI** (protected, rate limited)
```
POST   /api/ai/suggest-goals   Generate 3 SMART goal suggestions from a plain-English intent
```

**Share**
```
GET    /api/share/:token        Public — view shared goals (no auth)
POST   /api/share/generate      Generate share token (protected)
DELETE /api/share/revoke        Revoke share token (protected)
```

---

## Local Setup

### 1. Clone
```bash
git clone https://github.com/akallam04/goalsetter-plus.git
cd goalsetter-plus
```

### 2. Backend
```bash
cd backend
npm install
```

Create `backend/.env`:
```
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
ANTHROPIC_API_KEY=your_anthropic_key
```

```bash
npm run dev
```

### 3. Frontend
```bash
cd frontend
npm install
```

Create `frontend/.env`:
```
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Design Decisions

- **`completedAt` instead of `updatedAt` for analytics** — `updatedAt` changes on any edit (notes, title, etc.), making it an unreliable proxy for completion date. A dedicated `completedAt` field gives accurate per-day counts.
- **Client-side stats computation** — after every create/update/delete, stats are recomputed from the local Redux items array, eliminating a redundant `GET /stats` round-trip on every action.
- **Tab navigation** — all four feature areas (Goals, Analytics, AI Suggest, Share) are reachable without scrolling, making the app feel focused rather than like a long landing page.
- **`forwardDate: true` in chrono-node** — ensures "sunday" always means the *next* upcoming Sunday, not yesterday.
