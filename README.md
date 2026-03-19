# Goalsetter+ (MERN)

Goalsetter+ is a full-stack goals tracking app built with the MERN stack. It supports JWT authentication, protected routes, goals CRUD, due dates with overdue detection, filtering/search/sorting, and a backend-powered stats panel.

## Features
- JWT Auth (Register / Login) + Protected Routes
- Goals CRUD (Create / Read / Update / Delete)
- Status Toggle (Active ↔ Completed)
- Filtering, Search, and Sorting
- Due Dates + Overdue Badge
- Stats Endpoint: Total / Active / Completed / Overdue (`GET /api/goals/stats`)
- Edit Goal Modal (update title, category, priority, status, due date)

## Tech Stack
Frontend:
- React (Vite), React Router
- Redux Toolkit, React Redux
- Axios

Backend:
- Node.js, Express
- MongoDB Atlas, Mongoose
- JWT Auth
- express-validator

## API Endpoints
Auth:
- `POST /api/users` (register)
- `POST /api/users/login`
- `GET /api/users/me`

Goals (protected):
- `GET /api/goals`
- `POST /api/goals`
- `PUT /api/goals/:id`
- `DELETE /api/goals/:id`
- `GET /api/goals/stats`

## Local Setup

### 1) Clone
```bash
git clone https://github.com/akallam04/goalsetter-plus.git
cd goalsetter-plus
git add README.md
git commit -m "docs: add README"
git push
