# Backend

NestJS REST API for the Task Manager application.

## Overview

This backend is structured as a production-style API rather than a demo app. It includes cookie-based JWT authentication, Mongoose persistence, archived task handling, validation, rate limiting, and Swagger documentation.

## What It Has

- Register, login, logout, and current-user endpoints.
- JWT stored in HTTP-only cookies.
- MongoDB persistence via Mongoose.
- Authenticated task CRUD.
- Separate archive collection for deleted tasks.
- Permanent delete for archived tasks.
- Pagination and filtering for active and deleted task views.
- Global request validation and security hardening.

## Tech Stack

- NestJS
- Express platform
- Mongoose
- JWT and Passport
- class-validator and class-transformer
- Helmet
- Throttler

## Project Structure

```text
src/
├── main.ts
├── app.module.ts
├── auth/
├── common/
├── tasks/
│   ├── dto/
│   ├── schemas/
│   │   ├── task.schema.ts
│   │   └── deleted-task.schema.ts
│   ├── tasks.controller.ts
│   ├── tasks.service.ts
│   └── tasks.module.ts
└── users/
```

## Environment Variables

Create `backend/.env` with:

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<db>?retryWrites=true&w=majority
JWT_SECRET=<strong-random-secret>
JWT_EXPIRES_IN=1d
FRONTEND_URL=http://localhost:5173
```

## Local Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure `backend/.env`.
3. Start the API:
   ```bash
   npm run start:dev
   ```

The API runs on `http://localhost:3000`.

## Swagger

Swagger UI:

```text
http://localhost:3000/api/docs
```

## API Overview

### Auth

- `POST /auth/register` - create account and set auth cookie
- `POST /auth/login` - login and set auth cookie
- `POST /auth/logout` - clear auth cookie
- `GET /auth/me` - return current user profile

### Active Tasks

- `POST /tasks` - create a task
- `GET /tasks` - list active tasks
- `GET /tasks/:taskId` - fetch one active task
- `PUT /tasks/:taskId` - update a task
- `DELETE /tasks/:taskId` - archive a task into the deleted collection

### Deleted Tasks

- `GET /tasks/deleted` - list archived tasks
- `GET /tasks/deleted/:taskId` - fetch one archived task
- `DELETE /tasks/deleted/:taskId` - permanently delete an archived task

## Data Behavior

- Active tasks live in the `tasks` collection.
- Deleted tasks are copied into `deleted_tasks` before active removal.
- Archived tasks are hidden from the active task list.
- Titles and descriptions are trimmed before save and update.
- Past due dates are allowed.

## Security Notes

- JWTs are stored in HTTP-only cookies.
- `helmet` adds security headers.
- CORS is restricted to the configured frontend origin.
- Rate limiting is enabled globally.
- Task access is scoped by authenticated user.

## Scripts

- `npm run start:dev` - run the API in watch mode
- `npm run build` - compile the backend
- `npm run start:prod` - run the compiled production build
- `npm run lint` - lint and auto-fix backend files
- `npm run test` - run unit tests
- `npm run test:cov` - run tests with coverage
- `npm run audit` - security audit

## Production Notes

- Ensure `MONGODB_URI`, `JWT_SECRET`, and `FRONTEND_URL` are configured in production.
- Set `FRONTEND_URL` to the deployed frontend origin so cookie-based auth works correctly.