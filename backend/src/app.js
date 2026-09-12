const express = require('express');

const app = express();

// Parse incoming JSON request bodies
app.use(express.json());

// Health check endpoint to verify the server is running
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Employee Resource Directory API is running' });
});

module.exports = app;
