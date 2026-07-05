# Task Manager

A polished full-stack Task Manager built with **NestJS**, **React + TypeScript**, and **MongoDB**. The project is designed to read like a real production system: secure cookie-based auth, a modular API, archived task handling, responsive UI, and clean documentation.

## Why This Project Stands Out

- Authentication is handled with JWTs stored in HTTP-only cookies.
- Active tasks and deleted tasks are separated cleanly at the data layer.
- The UI supports create, edit, view, complete, delete, archive, and permanent delete flows.
- Dates are displayed consistently in `DD-MMM-YYYY` format.
- The backend is protected with validation, CORS, Helmet, and rate limiting.
- The codebase is organized to be easy to navigate during an interview walkthrough.

## Product Overview

### Backend

- NestJS REST API
- MongoDB via Mongoose
- JWT auth with register, login, logout, and profile endpoints
- Active task CRUD
- Deleted-task archive collection
- Permanent delete for archived tasks
- Swagger API documentation

### Frontend

- React + TypeScript + Vite
- Tailwind CSS responsive layout
- Login / register / protected dashboard
- Task details modal
- Active and deleted task views
- Task filtering, pagination, toasts, and confirmation dialogs

## High-Level Architecture

```text
┌─────────────────────────┐     HTTP + HTTP-only Cookie     ┌─────────────────────────┐
│ React Frontend          │  ◄────────────────────────────►  │ NestJS Backend         │
│ Vite + TypeScript       │                                 │ Express + Mongoose     │
│ Tailwind CSS            │                                 │ Port 3000              │
└─────────────────────────┘                                 └──────────┬──────────────┘
                                                                      │
                                                                      ▼
                                                         ┌─────────────────────────┐
                                                         │ MongoDB                 │
                                                         │ tasks / deleted_tasks   │
                                                         └─────────────────────────┘
```

## Repository Layout

```text
backend/     NestJS API, Mongoose schemas, auth, and task services
frontend/    React UI, hooks, components, and app state
README.md    Top-level project overview
CONTRIBUTING.md  Branching and code standards
```

## Feature Highlights

- Register, login, logout, and session restore.
- Create, view, edit, complete, and delete tasks.
- Deleted tasks are archived separately and can be permanently removed.
- Task status filters for All, Pending, In Progress, and Completed.
- Pagination for large task sets.
- Security-conscious auth and request handling.
- Interview-ready structure with clear module boundaries.

## Local Setup

### 1. Install Dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Configure Environment Variables

Backend `backend/.env`:

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<db>?retryWrites=true&w=majority
JWT_SECRET=<strong-random-secret>
JWT_EXPIRES_IN=1d
FRONTEND_URL=http://localhost:5173
```

Frontend `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
```

### 3. Run the App

```bash
# Terminal 1
cd backend
npm run start:dev

# Terminal 2
cd frontend
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- Swagger: `http://localhost:3000/api/docs`

## API Summary

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`

### Active Tasks

- `POST /tasks`
- `GET /tasks`
- `GET /tasks/:taskId`
- `PUT /tasks/:taskId`
- `DELETE /tasks/:taskId`

### Deleted Tasks

- `GET /tasks/deleted`
- `GET /tasks/deleted/:taskId`
- `DELETE /tasks/deleted/:taskId`

## Security and Engineering Notes

- JWTs are stored in HTTP-only cookies.
- Passwords are hashed with `bcrypt`.
- Requests are validated using `class-validator`.
- `helmet` and CORS protection are enabled.
- Rate limiting is enforced globally.
- Tasks are scoped to the authenticated user.
- Deleted records remain in a separate archive collection until purged.

## Documentation

- [Backend README](backend/README.md)
- [Frontend README](frontend/README.md)
- [Contributing Guide](CONTRIBUTING.md)

## Tech Stack

**Backend:** NestJS, Express, MongoDB, Mongoose, JWT, Passport, class-validator, Helmet, Throttler

**Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Axios, React Router

**Tooling:** ESLint, Prettier, ts-node, Jest
