# Employee Resource Directory

A full-stack CRUD application for managing employees, their departments, roles, and reporting hierarchy within an organization.

## Project Architecture

```text
React Frontend
      ↓
Express REST API
      ↓
MySQL Database
```

* **React Frontend**: Handles the user interface, employee tables, forms, and client-side validation.
* **Express REST API**: Serves JSON data, processes requests, and handles server-side validation.
* **MySQL Database**: Stores employee records and hierarchy relationships.
* The database connection is configured through environment variables.
* The included `backend/schema.sql` script allows another developer to recreate the exact database locally.

## Local MySQL Setup

This project uses MySQL. The repository **does NOT depend on the original developer's personal/local MySQL instance**. 
Instead, every developer who clones this repository must use their own local MySQL instance.

* Another person cloning the repository cannot access the original developer's `localhost` database.
* The repository includes `backend/schema.sql`, which contains the complete database and table definitions along with seed data.
* You must execute `backend/schema.sql` using MySQL Workbench or the MySQL CLI on your machine.
* This will create the required `employee_resource_directory` database, the `employees` table, and insert seed data.
* The backend connects to this database using environment variables provided in `backend/.env`.

## Environment Configuration

This repository intentionally does **NOT** contain the real `.env` file, as it contains sensitive database credentials.

To run the project, you must create your own configuration file:
`backend/.env`

Use the following format (you can copy this from `backend/.env.example` if available, or create it from scratch):

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=employee_resource_directory
PORT=5000
```

* **Replace `your_mysql_password`** with your own local MySQL password.
* Do **NOT** commit `.env` to GitHub. The project's `.gitignore` is configured to ignore it.
* Database credentials are never hardcoded in the source code.

## How Another Developer Can Run This Project

Follow these steps to set up the project from a fresh clone:

### 1. Clone the repository

```bash
git clone <repository-url>
cd employee-resource-directory
```

### 2. Set up MySQL

MySQL Server must be installed and running on your machine.
1. Open MySQL Workbench (or MySQL CLI) and connect to your local MySQL server.
2. Open the file `backend/schema.sql`.
3. Execute the complete script. 
This step creates the `employee_resource_directory` database, the `employees` table, and inserts the initial seed employees.

### 3. Configure backend environment

Create a file named `.env` inside the `backend` folder:
`backend/.env`

Copy the variables from above (or `.env.example`) into it, and update `DB_PASSWORD` to match your own local MySQL credentials.

### 4. Install backend dependencies

```bash
cd backend
npm install
```

### 5. Start backend

Start the backend server in development mode (which enables auto-reloading):

```bash
npm run dev
```

Alternatively, you can run `npm start`. 
The backend connects to your local MySQL instance and will run on `http://localhost:5000`.

### 6. Install frontend dependencies

Open a **new** terminal window and run:

```bash
cd frontend
npm install
```

### 7. Start frontend

Start the React development server:

```bash
npm run dev
```

### 8. Open the application

The frontend runs on the default Vite port. Open your browser and navigate to:
`http://localhost:5173`

You should now see the Employee Resource Directory UI communicating with your local backend and database.

## API Endpoints

The backend implements the following RESTful endpoints:

```text
GET    /api/employees
GET    /api/employees/:id
POST   /api/employees
PUT    /api/employees/:id
DELETE /api/employees/:id
```

The `GET /api/employees` endpoint also supports query parameters for filtering:
* `search`: Filters employees by name (e.g., `?search=Sarah`)
* `department`: Filters employees by exact department (e.g., `?department=Engineering`)

## Testing

The project includes automated backend API tests using **Jest** and **Supertest**. 

To run the backend test suite:
```bash
cd backend
npm test
```
*(Frontend testing has not been implemented yet).*

## Security / Credentials

* The `.env` file contains your local database credentials.
* `.env` is intentionally ignored by Git to prevent leaking secrets.
* `.env.example` contains placeholders only and is safe to commit.
* No real database password is ever committed to the repository.
* Another developer running this code must provide their own local MySQL credentials.
