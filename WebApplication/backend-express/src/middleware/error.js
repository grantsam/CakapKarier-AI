const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err
    });
  } else {
    // Production: Jangan bocorkan stack trace
    res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.isOperational ? err.message : 'Something went very wrong!'
    });
  }
};

export default globalErrorHandler;
