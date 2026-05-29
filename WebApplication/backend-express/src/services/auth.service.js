import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import db from '../database/db.js';
import * as authRepository from '../repositories/auth.repository.js';
import * as mailService from './mail.service.js';
import AppError from '../utils/AppError.js';
import { normalizeEmail } from '../utils/normalize.js';

const signToken = (id) => {
  return jwt.sign({ id }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

const hashResetToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const buildResetUrl = (token) => {
  const resetUrl = new URL('/reset-password', config.frontendUrl);
  resetUrl.searchParams.set('token', token);
  return resetUrl.toString();
};

const genericForgotPasswordMessage = 'Jika email terdaftar, link pemulihan kata sandi telah dikirim.';

export const register = async (userData) => {
  const { nama, password } = userData;
  const email = normalizeEmail(userData.email);

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
  const { password } = credentials;
  const email = normalizeEmail(credentials.email);

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

export const requestPasswordReset = async ({ email }) => {
  mailService.assertSmtpConfigured();

  const normalizedEmail = normalizeEmail(email);
  const user = await authRepository.findUserByEmail(normalizedEmail);

  if (!user) {
    return {
      message: genericForgotPasswordMessage,
    };
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashResetToken(rawToken);
  const expiresAt = new Date(Date.now() + config.passwordReset.tokenExpiresMinutes * 60 * 1000);
  const resetUrl = buildResetUrl(rawToken);

  const client = await db.pool.connect();
  let resetToken;

  try {
    await client.query('BEGIN');
    await authRepository.markUserPasswordResetTokensUsed(user.id, client);
    resetToken = await authRepository.createPasswordResetToken({
      userId: user.id,
      tokenHash,
      expiresAt,
    }, client);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }

  try {
    await mailService.sendPasswordResetEmail({
      to: user.email,
      resetUrl,
      expiresMinutes: config.passwordReset.tokenExpiresMinutes,
    });
  } catch (error) {
    await authRepository.markPasswordResetTokenUsed(resetToken.id);
    throw new AppError('Gagal mengirim email pemulihan kata sandi. Silakan coba lagi nanti.', 502);
  }

  return {
    message: genericForgotPasswordMessage,
  };
};

export const resetPassword = async ({ token, password }) => {
  const tokenHash = hashResetToken(token);
  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    const resetToken = await authRepository.findValidPasswordResetToken(tokenHash, client);
    if (!resetToken) {
      throw new AppError('Token tidak valid atau telah kadaluarsa.', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await authRepository.updateUserPassword(resetToken.user_id, hashedPassword, client);
    await authRepository.markUserPasswordResetTokensUsed(resetToken.user_id, client);
    await client.query('COMMIT');

    return {
      message: 'Kata sandi berhasil diperbarui.',
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
