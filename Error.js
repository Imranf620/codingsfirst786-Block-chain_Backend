module.exports = (err, req, res, next) => {
  // Set default status code and message
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  // Handle duplicate key error (MongoDB error code 11000)
  if (err.code === 11000) {
    const message = `${Object.keys(err.keyValue).join(', ')} already exists`;
    err.statusCode = 400; // Bad Request
    err.message = message;
  }

  // Send error response
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack, // Hide stack trace in production
  });
};
