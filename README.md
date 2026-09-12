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

- **Step 1 Complete** — Project foundation and folder structure set up.
- **Step 2 Complete** — MySQL schema and seed data implemented (`backend/schema.sql`).
- **Step 3 Complete** — Express backend REST API implemented with CRUD operations and validation.
- **Step 4 Complete** — Backend automated testing implemented using Jest and Supertest.

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

### Backend Tests
Backend automated tests are written using **Jest** and **Supertest**.
They cover all CRUD operations, validation rules, error handling, and manager hierarchy edge cases.

To run the backend tests:
```bash
cd backend
npm test
```

> **Note**: Frontend tests will be added in a later step using Jest + React Testing Library.
