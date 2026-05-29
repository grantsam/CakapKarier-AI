import * as profileRepository from '../repositories/profile.repository.js';
import * as authRepository from '../repositories/auth.repository.js';
import AppError from '../utils/AppError.js';
import { normalizeEmail } from '../utils/normalize.js';

export const getProfile = async (userId) => {
  const profile = await profileRepository.getProfileByUserId(userId);
  if (!profile) {
    throw new AppError('Profil tidak ditemukan', 404);
  }
  return profile;
};

export const updateProfile = async (userId, updateData) => {
  const normalizedUpdate = {
    ...updateData,
    email: normalizeEmail(updateData.email),
  };

  // 1. Cek apakah email baru sudah dipakai user lain
  const existingUser = await authRepository.findUserByEmail(normalizedUpdate.email);
  if (existingUser && existingUser.id !== userId) {
    throw new AppError('Email sudah terdaftar oleh pengguna lain', 409);
  }

  // 2. Update data
  await profileRepository.updateProfile(userId, normalizedUpdate);
  
  return true;
};
