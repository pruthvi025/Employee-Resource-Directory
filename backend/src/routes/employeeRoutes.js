const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');

// GET /api/employees       — list all (with optional ?search= and ?department= filters)
router.get('/', employeeController.getAllEmployees);

// GET /api/employees/:id   — get a single employee by ID
router.get('/:id', employeeController.getEmployeeById);

// POST /api/employees      — create a new employee
router.post('/', employeeController.createEmployee);

// PUT /api/employees/:id   — update an existing employee
router.put('/:id', employeeController.updateEmployee);

// DELETE /api/employees/:id — delete an employee
router.delete('/:id', employeeController.deleteEmployee);

module.exports = router;
