# Frontend

React + TypeScript + Tailwind CSS UI for the Task Manager application.

## Overview

The frontend is designed as a polished product dashboard rather than a simple CRUD screen. It includes secure session restore, a protected workspace, archived task management, and a responsive UI that looks intentional on desktop and mobile.

## What It Has

- Login and register pages.
- Cookie-based session restore.
- Protected dashboard route.
- Active task creation, editing, completion, deletion, and filtering.
- Task details modal.
- Deleted task archive view with permanent delete.
- Pagination for both active and archived tasks.
- Toasts, confirmation dialogs, and loading states.
- Responsive Tailwind UI.
- Task date formatting in `DD-MMM-YYYY`.

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Axios
- React Router

## Project Structure

```text
src/
├── api/
├── components/
│   ├── Layout/
│   ├── Tasks/
│   └── UI/
├── context/
├── hooks/
├── pages/
├── types/
└── utils/
```

## Environment Variables

Create `frontend/.env` with:

```env
VITE_API_URL=http://localhost:3000
```

## Local Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Make sure the backend is running.
3. Start the app:
   ```bash
   npm run dev
   ```

The app runs on `http://localhost:5173` by default.

## Main Screens

### Login and Register

- Allow users to sign in or create an account.
- Use the backend cookie-based auth flow.

### Dashboard

- Shows task totals and status counts.
- Lets the user create a new task.
- Lists tasks with view, edit, delete, and completion actions.
- Filters by All, Pending, In Progress, and Completed.
- Switches between active and deleted collections.

### Task Details

- Opens a modal with the selected task information.
- Formats dates in `DD-MMM-YYYY`.
- Capitalizes the first letter of the task title in the modal.

### Deleted Tasks View

- Shows archived tasks only.
- Hides edit and completion controls.
- Allows permanent delete from MongoDB.

## Data Flow

- Axios sends requests with cookies enabled.
- Auth state is restored from `GET /auth/me`.
- Task state is fetched from the backend and managed locally in hooks.

## Scripts

- `npm run dev` - start Vite locally
- `npm run build` - type-check and build the app
- `npm run preview` - preview the production build
- `npm run lint` - lint the frontend source
- `npm run format` - format source files

## Notes

- Past due dates are allowed.
- Archived tasks are shown separately from active tasks.
- The UI uses confirmation dialogs for destructive actions.