import AppError from '../utils/AppError.js';

const mapDatabaseError = (err) => {
  if (err.isOperational) return err;

  if (err.code === '23505') {
    return new AppError('Data sudah digunakan', 409);
  }

  if (err.code === '23503') {
    return new AppError('Referensi data tidak valid', 400);
  }

  if (err.code === '23502') {
    return new AppError('Data wajib belum lengkap', 400);
  }

  if (err.code === '22P02') {
    return new AppError('Format data tidak valid', 400);
  }

  return err;
};

const globalErrorHandler = (err, req, res, next) => {
  const error = mapDatabaseError(err);

  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    res.status(error.statusCode).json({
      success: false,
      status: error.status,
      message: error.message,
      stack: error.stack,
      error
    });
  } else {
    // Production: Jangan bocorkan stack trace
    res.status(error.statusCode).json({
      success: false,
      status: error.status,
      message: error.isOperational ? error.message : 'Something went very wrong!'
    });
  }
};

export default globalErrorHandler;
