# Employee Resource Directory

A full-stack CRUD application for managing employees, their departments, roles, and reporting hierarchy within an organization.

## Technology Stack

| Layer      | Technology         |
| ---------- | ------------------ |
| Frontend   | React JS (Vite)    |
| Backend    | Node.js + Express  |
| Database   | MySQL              |
| DB Driver  | mysql2             |

## Current Status

> **Step 1 Complete** — Project foundation and folder structure set up. Frontend and backend scaffolded and verified to start successfully. No employee features implemented yet.

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm
- MySQL server running locally

### Install Dependencies

```bash
# Frontend
cd frontend
npm install

# Backend
cd backend
npm install
```

### Configure Environment

1. Copy the example environment file in the backend folder:

```bash
cd backend
cp .env.example .env
```

2. Fill in your MySQL credentials in `backend/.env`.

### Run the Application

```bash
# Start backend (from /backend)
npm start

# Start frontend (from /frontend)
npm run dev
```

- Frontend runs on: `http://localhost:5173`
- Backend runs on: `http://localhost:5000`

## Testing

> Tests will be added in a later step.
> - Backend: Jest + Supertest
> - Frontend: Jest + React Testing Library
