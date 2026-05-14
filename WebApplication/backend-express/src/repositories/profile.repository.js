import db from '../database/db.js';
import AppError from '../utils/AppError.js';

export const createProfile = async (userId) => {
  const query = `
    INSERT INTO profiles (user_id)
    VALUES ($1)
    RETURNING *;
  `;
  const result = await db.query(query, [userId]);
  return result.rows[0];
};

export const getProfileByUserId = async (userId) => {
  const query = `
    SELECT u.id, u.nama, u.email, COALESCE(p.nomor_telepon, '') as nomor_telepon, COALESCE(p.bio, '') as bio
    FROM users u
    LEFT JOIN profiles p ON u.id = p.user_id
    WHERE u.id = $1;
  `;
  const result = await db.query(query, [userId]);
  return result.rows[0];
};

export const updateProfile = async (userId, data) => {
  const { nama, email, nomor_telepon, bio } = data;
  
  const client = await db.pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 1. Update users table
    const updateUserQuery = `
      UPDATE users 
      SET nama = $1, email = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING id, nama, email;
    `;
    const updatedUser = await client.query(updateUserQuery, [nama, email, userId]);
    if (updatedUser.rowCount === 0) {
      throw new AppError('User tidak ditemukan', 404);
    }
    
    // 2. UPSERT profiles table (Insert if not exists, otherwise update)
    const upsertProfileQuery = `
      INSERT INTO profiles (user_id, nomor_telepon, bio, updated_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        nomor_telepon = EXCLUDED.nomor_telepon,
        bio = EXCLUDED.bio,
        updated_at = EXCLUDED.updated_at
      RETURNING nomor_telepon, bio;
    `;
    await client.query(upsertProfileQuery, [userId, nomor_telepon, bio]);
    
    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
