import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import * as authRepository from '../repositories/auth.repository.js';
import * as profileRepository from '../repositories/profile.repository.js';
import AppError from '../utils/AppError.js';

const signToken = (id) => {
  return jwt.sign({ id }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

export const register = async (userData) => {
  const { nama, email, password } = userData;

  // 1. Cek apakah user sudah ada
  const existingUser = await authRepository.findUserByEmail(email);
  if (existingUser) {
    throw new AppError('Email sudah terdaftar', 400);
  }

  // 2. Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // 3. Simpan ke database
  const newUser = await authRepository.createUser(nama, email, hashedPassword);

  // 4. Create empty profile for the new user
  await profileRepository.createProfile(newUser.id);

  // 5. Generate token
  const token = signToken(newUser.id);

  return {
    user: {
      id: newUser.id,
      nama: newUser.nama,
      email: newUser.email,
    },
    token,
  };
};

export const login = async (credentials) => {
  const { email, password } = credentials;

  // 1. Cek apakah user ada
  const user = await authRepository.findUserByEmail(email);
  if (!user) {
    throw new AppError('Email atau password salah', 401);
  }

  // 2. Cek apakah password benar
  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    throw new AppError('Email atau password salah', 401);
  }

  // 3. Generate token
  const token = signToken(user.id);

  return {
    user: {
      id: user.id,
      nama: user.nama,
      email: user.email,
    },
    token,
  };
};
