// Centralized error-handling middleware for Express.
// This must be registered AFTER all routes in app.js.
// Express identifies error middleware by its 4-parameter signature: (err, req, res, next).

const errorHandler = (err, req, res, next) => {
  // Log the full error to the console for development debugging
  console.error('Server Error:', err.message);

  // Handle known MySQL duplicate-entry error (e.g., unique email constraint)
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(400).json({ error: 'A record with that value already exists' });
  }

  // Handle MySQL foreign-key constraint violation
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ error: 'Referenced record does not exist' });
  }

  // Handle custom errors that have a statusCode property
  if (err.statusCode) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // For all other unexpected errors, return a generic 500 response.
  // Never expose stack traces, SQL internals, or credentials to the client.
  res.status(500).json({ error: 'Internal server error' });
};

module.exports = errorHandler;
