import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import * as authRepository from '../repositories/auth.repository.js';
import AppError from '../utils/AppError.js';

export const protect = async (req, res, next) => {
  try {
    // 1. Ambil token dari header
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Anda belum masuk. Silakan masuk untuk mendapatkan akses.', 401));
    }

    // 2. Verifikasi token
    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await authRepository.findUserById(decoded.id);
    if (!user) {
      return next(new AppError('User tidak ditemukan. Silakan masuk kembali.', 401));
    }

    // 3. Simpan data user ke request
    req.user = { id: user.id };
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Token tidak valid. Silakan masuk kembali.', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token Anda telah kedaluwarsa. Silakan masuk kembali.', 401));
    }
    next(error);
  }
};
