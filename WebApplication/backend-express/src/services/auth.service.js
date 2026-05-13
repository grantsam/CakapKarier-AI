import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import db from '../database/db.js';
import * as authRepository from '../repositories/auth.repository.js';
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
    throw new AppError('Email sudah terdaftar', 409);
  }

  // 2. Hash password
  const hashedPassword = await bcrypt.hash(password, 12);
  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    const createUserQuery = `
      INSERT INTO users (nama, email, password)
      VALUES ($1, $2, $3)
      RETURNING id, nama, email, created_at;
    `;
    const userResult = await client.query(createUserQuery, [nama, email, hashedPassword]);
    const newUser = userResult.rows[0];

    const createProfileQuery = `
      INSERT INTO profiles (user_id)
      VALUES ($1);
    `;
    await client.query(createProfileQuery, [newUser.id]);

    await client.query('COMMIT');

    const token = signToken(newUser.id);

    return {
      user: {
        id: newUser.id,
        nama: newUser.nama,
        email: newUser.email,
      },
      token,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
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
