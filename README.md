# Goalsetter+

A full-stack goal tracking system built with the MERN stack. Designed as a portfolio project showcasing a custom design system, hand-built data visualizations, AI integration, and production deployment.

**Live Demo:** [goalsetter-plus.vercel.app](https://goalsetter-plus.vercel.app)

Two ways in, no signup needed:
- Hit **Try the live demo** on the sign-in page for a one-click, preloaded board (goals, streaks, analytics history)
- Or view the [public demo board](https://goalsetter-plus.vercel.app/share/demoboard), the read-only share-link feature in action

---

## Design

The v2 interface is a custom "mission control" design system built from scratch in plain CSS:

- Two themes, dark and light, on one muted teal accent chosen to sit calmly on both a near-black and an off-white background, with an animated day/night switch hand-built in plain CSS
- Guided tour that runs itself for the demo account and for new sign ups, replayable anytime from the labelled Tour button
- Flash-free theming: an inline head script applies the saved mode before first paint, persisted in localStorage across refreshes
- Graphite surfaces with hairline borders and one signal color, on a 7-step type scale and a 4px spacing scale
- Space Grotesk for UI, JetBrains Mono for data readouts (tabular numerals throughout)
- Custom SVG icon set, status LEDs, corner-tick panels, an animated radar on the auth pages
- 3D ambience: perspective horizon grid, CSS 3D gyroscope ornament, cursor-tracking spotlight
- Claude mascot: a floating coral starburst toy on the AI Coach tab, with matching coral accents for everything Claude generates
- Desktop is a two column workspace: a readable focus column beside a sticky momentum sidebar, under a sticky header and tab bar
- No chart library: the area chart, contribution heatmap, and progress rings are hand-built SVG
- Mobile first: thumb-reachable bottom navigation, a menu sheet instead of a crowded top bar, safe-area insets, no horizontal overflow, and no tap target under 44px

## Features

### Core
- JWT authentication: register, login, protected routes, auto-logout on token expiry
- Profile editing: name, email, password change, and a profile photo uploaded from your device (resized client-side to a compact data URL)
- Full goals CRUD with status toggle, sub-tasks, notes, and priorities
- Due dates with overdue detection and plain-English timing ("Due today", "19 days late")
- Natural language dates and times: "submit essay sept 4th by 1pm" sets the date and the time and leaves a clean title behind
- Times on goals and on individual steps, so a workout or a study block can carry its own slot
- Keyboard shortcuts: N focuses the new-goal form, / jumps to search

### Today (home)
- Answers one question: what needs you now. Overdue, due today, and the next few days, in that order
- Momentum sidebar with the current streak and a 6-week completion chain
- One-line quick add: type it, press Enter. "gym tomorrow" sets the date and cleans the title
- Sub-tasks tick inline on the card, no modal
- Optimistic writes: the UI moves in about 30ms and rolls back with a plain-English message if the server refuses

### Board
- Every goal with filters, search, and smart ordering (overdue first, then due soonest, then priority)

### Resilience
- Designed error, empty, offline, and cold-start states, all with a way out
- A failed load says so and offers retry instead of rendering an empty board
- Internal server and SDK messages are never shown to the user

### Analytics
- GitHub-style completion heatmap covering the last 13 weeks
- Streak engine: current streak, best streak, weekly momentum (last 7 days vs previous 7), and power day
- Completions chart with 7 / 30 / 90 day ranges, sliced client-side from a single 90-day fetch
- Per-category completion bars (done vs total)
- Completions tracked via a dedicated `completedAt` timestamp for accuracy

### AI Coach (Claude API)
- Describe an intent in plain English; Claude Haiku returns 3 SMART goals
- Claude-branded experience: coral mascot, "Claude is thinking" scanner, generated-by-Claude tags
- Quick-prompt chips for one-tap inspiration, plus Show more ideas when three is not enough
- Suggestions arrive with steps and suggested timings that carry across when you add them
- One tap adds any suggestion to your board with a computed due date
- Rate limited server-side to control API cost

### Public Share Link
- Generate a read-only link to your board for accountability partners
- Viewers need no account; revoke or rotate the link anytime

---

## Tech Stack

**Frontend**
- React 19 + Vite, code-split routes via React.lazy
- Redux Toolkit (async thunks, derived stats)
- React Router v7
- chrono-node (natural language dates)
- Axios with request interceptor (token injection) and 401 interceptor (auto-logout)
- Hand-rolled SVG charts (no charting dependency)

**Backend**
- Node.js + Express
- MongoDB Atlas + Mongoose (aggregation pipelines for analytics)
- JWT authentication
- express-validator, Helmet, CORS, rate limiting
- Anthropic SDK (Claude Haiku for goal suggestions)

**Deployment**
- Frontend: Vercel (SPA rewrites)
- Backend: Render
- Database: MongoDB Atlas

---

## API Endpoints

**Auth**
```
POST   /api/users          Register
POST   /api/users/login    Login
GET    /api/users/me       Get current user
PUT    /api/users/me       Update profile (name, email, avatar, password)
```

**Goals** (protected)
```
GET    /api/goals            List goals (filterable by status, category, priority)
POST   /api/goals            Create goal
PUT    /api/goals/:id        Update goal (title, category, priority, status, dueDate, subtasks, notes)
DELETE /api/goals/:id        Delete goal
GET    /api/goals/stats      Total / active / completed / overdue counts
GET    /api/goals/analytics  Completions by day plus category breakdown
```

**AI** (protected, rate limited)
```
POST   /api/ai/suggest-goals   Generate 3 SMART goal suggestions from a plain-English intent
```

**Share**
```
GET    /api/share/:token        Public: view shared goals (no auth)
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
PORT=5001
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
ANTHROPIC_API_KEY=your_anthropic_key
```

```bash
npm run dev
```

Optional: seed or reset the public demo account (used by the "Try the live demo" button):
```bash
npm run seed:demo
```

### 3. Frontend
```bash
cd frontend
npm install
```

Create `frontend/.env`:
```
VITE_API_URL=http://localhost:5001/api
```

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Design Decisions

- **`completedAt` instead of `updatedAt` for analytics.** `updatedAt` changes on any edit, making it an unreliable proxy for completion date. A dedicated field gives accurate per-day counts.
- **Single 90-day analytics fetch.** The 7 / 30 / 90 day chart ranges and the heatmap are all derived client-side from one request instead of refetching per toggle.
- **Client-side stats.** After every create, update, or delete, stats recompute from the local Redux items array, so the telemetry strip updates instantly with zero extra requests.
- **No chart library.** The area chart, heatmap, and rings are small hand-built SVG components. This cut roughly 100 kB gzipped from the bundle and allows exact visual control.
- **Axios request interceptor.** The JWT attaches in one place instead of being threaded through every thunk and call site.
- **Timezone-pinned day math.** Streaks, overdue checks, and heatmap cells all use the same timezone as the backend aggregation, so day boundaries always agree.
- **`forwardDate: true` in chrono-node.** "Sunday" always means the next upcoming Sunday, never yesterday.

---

## License

[MIT](LICENSE)
