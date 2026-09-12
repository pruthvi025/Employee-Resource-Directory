# Employee Resource Directory

A full-stack employee management web application built with Node.js, Express, MySQL, and React (Vite). It provides full CRUD capabilities for managing organizational employees, department organization, roles, active/inactive statuses, and hierarchical reporting manager relationships.

## Features

- **Employee Listing**: View complete employee directory in a responsive tabular interface.
- **Search**: Real-time name search with automatic input debouncing.
- **Department Filtering**: Filter employee records by exact department (Engineering, Sales, Finance, HR).
- **Combined Search & Filter**: Seamlessly search by name while filtering by department simultaneously.
- **Add Employee**: Create new employee records with client and server-side validation.
- **Edit Employee**: Update employee details, department, role, status, and reporting manager.
- **Delete Employee**: Remove employees with an in-app confirmation modal dialog.
- **Reporting Manager Hierarchy**: Self-referencing relationship linking employees to their reporting managers. Handles manager deletion gracefully (`ON DELETE SET NULL`).
- **Validation**:
  - Required fields check (Name, Email, Department, Role).
  - Server-side and client-side email format regex validation.
  - Unique email enforcement across active employee database.
  - Manager ID existence verification.
  - Prevention of self-manager assignment (an employee cannot report to themselves).
- **State Management & UX**:
  - Dynamic loading spinners.
  - User-friendly error alert banners.
  - Clean empty state displays when no records match search/filter criteria.

## Quick Start — How to Run the Project (After Setup)

Once database setup (`backend/schema.sql`) and environment setup (`backend/.env`) are completed:

1. **Start Backend Server** (Terminal 1):
   ```bash
   cd backend
   npm run dev
   ```
   *Runs backend API on `http://localhost:5000`.*

2. **Start Frontend App** (Terminal 2):
   ```bash
   cd frontend
   npm run dev
   ```
   *Runs React UI on `http://localhost:5173`.*

3. **Open Application**:
   Navigate to **`http://localhost:5173`** in your browser.

---

## Tech Stack

- **Frontend**: React, Vite, JavaScript, CSS (Vanilla), Fetch API
- **Backend**: Node.js, Express, `mysql2/promise` (connection pooling), `dotenv`, `cors`
- **Database**: MySQL Server
- **Testing**: Jest, Supertest

## Project Structure

```text
Employee Resource Directory/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── employeeController.js
│   │   ├── middleware/
│   │   │   └── errorHandler.js
│   │   ├── routes/
│   │   │   └── employeeRoutes.js
│   │   ├── app.js
│   │   ├── db.js
│   │   └── server.js
│   ├── tests/
│   │   └── employee.test.js
│   ├── .env.example
│   ├── package.json
│   └── schema.sql
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── EmployeeForm.jsx
│   │   │   └── EmployeeTable.jsx
│   │   ├── api.js
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

## Database Setup

This application uses MySQL Server. The repository does **NOT** connect to or rely on any remote or original developer database. Every developer cloning this repository must use their own local MySQL instance.

### Step-by-Step Local Database Initialization

1. Ensure **MySQL Server** is installed and running locally on port `3306`.
2. Open **MySQL Workbench** or your preferred MySQL CLI tool.
3. Open the file `backend/schema.sql` located inside the project repository.
4. Execute the entire `schema.sql` script.
5. Verify that:
   - The database `employee_resource_directory` is created.
   - The table `employees` is created with auto-incrementing primary key `id`.
   - The self-referencing foreign key constraint `manager_id -> employees(id)` with `ON DELETE SET NULL` is established.
   - 12 initial seed employees are inserted across 4 departments (Engineering, Sales, Finance, HR) with multi-level manager hierarchy.

## Environment Variables

Real credentials are never committed to version control. The repository ignores `.env` files via `.gitignore`.

Create a file named `backend/.env` based on `backend/.env.example`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=employee_resource_directory
PORT=5000
```

> **Note**: Replace `your_mysql_password` with your local MySQL user password.

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd "Employee Resource Directory"
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

## Running the Application

### 1. Start the Backend API Server
In the `backend/` directory, run:
```bash
npm run dev
```
*(Runs `node --watch src/server.js` on `http://localhost:5000`)*

### 2. Start the Frontend React Client
In a separate terminal, inside the `frontend/` directory, run:
```bash
npm run dev
```
*(Runs Vite dev server on `http://localhost:5173`)*

Open your browser and navigate to **`http://localhost:5173`**.

## API Documentation

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Description | Query Parameters / Body | Status Codes |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/employees` | Retrieve all employees | Query: `?search=<name>&department=<dept>` | `200 OK`, `500 Internal Error` |
| **GET** | `/employees/:id` | Get single employee details | URL parameter: `id` | `200 OK`, `404 Not Found`, `500 Internal Error` |
| **POST** | `/employees` | Create a new employee | Body: `{ name, email, department, role, manager_id, status }` | `201 Created`, `400 Bad Request`, `500 Internal Error` |
| **PUT** | `/employees/:id` | Update an existing employee | Body: `{ name, email, department, role, manager_id, status }` | `200 OK`, `400 Bad Request`, `404 Not Found`, `500 Internal Error` |
| **DELETE**| `/employees/:id` | Delete an employee | URL parameter: `id` | `200 OK`, `404 Not Found`, `500 Internal Error` |

## Validation and Error Handling

- **Server-Side Validation**: Sanitizes and validates inputs before touching the database. Returns clean JSON error objects (`{ "error": "Reason..." }`).
- **Duplicate Email Handling**: Prevents duplicate emails during creation and updates (excluding the employee's own record during update).
- **Manager Validation**: Checks that `manager_id` exists in the database and ensures `manager_id != id` to prevent self-management loops.
- **Centralized Error Middleware**: Intercepts unhandled backend errors in `app.js` and outputs generic safe HTTP 500 error messages without leaking database stack traces.

## Testing

### Backend API Automated Tests

The backend includes a comprehensive automated integration test suite built with **Jest** and **Supertest**.

To execute the tests:
```bash
cd backend
npm test
```
- Tests all 5 API endpoints (GET, POST, PUT, DELETE).
- Tests search, filtering, non-existent 404 routes, missing required fields, duplicate emails, invalid manager IDs, and self-management prevention.

### Frontend Production Build Verification

To verify that the frontend builds cleanly for production:
```bash
cd frontend
npm run build
```

## Architecture

```text
React Frontend (SPA on Vite)
      ↓ HTTP / JSON (Fetch API)
Express REST API (Routing & Controllers)
      ↓ SQL Queries
mysql2 Connection Pool (promise-based)
      ↓ TCP Connection
MySQL Database (employee_resource_directory)
```

- **Frontend**: Renders modern state-driven React UI, manages search debouncing, form modals, and async API requests.
- **Express Backend**: Exposes REST API endpoints, performs validation, and executes parameterized SQL queries.
- **Database Layer**: Stores relational employee records with self-referencing foreign keys for manager hierarchies.

## Security & Configuration

- **Environment Isolation**: Database credentials strictly loaded via `process.env` through `dotenv`.
- **SQL Injection Prevention**: All MySQL database queries use parameterized placeholders (`?`).
- **CORS Configured**: Cross-Origin Resource Sharing enabled for safe local development.
- **Git Hygiene**: `.env` and `node_modules` are excluded via `.gitignore`.

## Assumptions

- The MySQL database is running locally on port `3306`.
- Direct reports become top-level employees (`manager_id = NULL`) if their manager is deleted (`ON DELETE SET NULL`).
- Departments used in standard dropdowns: Engineering, Sales, Finance, HR.

## Known Limitations

- Single organization structure (no multi-tenant support).
- Basic role strings rather than a dynamic role management table.
