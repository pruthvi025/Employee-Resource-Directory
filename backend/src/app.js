const express = require('express');
const cors = require('cors');
const employeeRoutes = require('./routes/employeeRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Parse incoming JSON request bodies
app.use(express.json());

// Enable CORS for frontend requests
app.use(cors());

// Health check endpoint to verify the server is running
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Employee Resource Directory API is running' });
});

// Employee API routes
app.use('/api/employees', employeeRoutes);

// Centralized error handling — must be registered AFTER all routes
app.use(errorHandler);

module.exports = app;
