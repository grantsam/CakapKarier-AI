import { config } from '../config/index.js';
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

const logServerError = (error, req) => {
  if (error.statusCode < 500 && error.isOperational) return;

  console.error({
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    statusCode: error.statusCode,
    name: error.name,
    message: error.message,
    stack: error.stack,
  });
};

const globalErrorHandler = (err, req, res, next) => {
  const error = mapDatabaseError(err);

  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  logServerError(error, req);

  if (config.nodeEnv === 'development' && config.debugErrors) {
    return res.status(error.statusCode).json({
      success: false,
      status: error.status,
      message: error.message,
      stack: error.stack,
      error
    });
  }

  return res.status(error.statusCode).json({
    success: false,
    status: error.status,
    message: error.isOperational ? error.message : 'Terjadi gangguan pada server. Silakan coba lagi nanti.'
  });
};

export default globalErrorHandler;
