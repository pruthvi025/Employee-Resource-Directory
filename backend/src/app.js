const express = require('express');
const employeeRoutes = require('./routes/employeeRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Parse incoming JSON request bodies
app.use(express.json());

// Health check endpoint to verify the server is running
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Employee Resource Directory API is running' });
});

// Employee API routes
app.use('/api/employees', employeeRoutes);

// Centralized error handling — must be registered AFTER all routes
app.use(errorHandler);

module.exports = app;
