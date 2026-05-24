import db from '../database/db.js';

const getExecutor = (client) => client || db;

export const createUser = async (nama, email, password) => {
  const query = `
    INSERT INTO users (nama, email, password)
    VALUES ($1, $2, $3)
    RETURNING id, nama, email, created_at;
  `;
  const values = [nama, email, password];
  const result = await db.query(query, values);
  return result.rows[0];
};

export const findUserByEmail = async (email) => {
  const query = 'SELECT * FROM users WHERE email = $1';
  const result = await db.query(query, [email]);
  return result.rows[0];
};

export const findUserById = async (id) => {
  const query = 'SELECT id, nama, email FROM users WHERE id = $1';
  const result = await db.query(query, [id]);
  return result.rows[0];
};

export const markUserPasswordResetTokensUsed = async (userId, client = null) => {
  const query = `
    UPDATE password_reset_tokens
    SET used_at = COALESCE(used_at, NOW())
    WHERE user_id = $1 AND used_at IS NULL;
  `;
  await getExecutor(client).query(query, [userId]);
};

export const createPasswordResetToken = async ({ userId, tokenHash, expiresAt }, client = null) => {
  const query = `
    INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
    VALUES ($1, $2, $3)
    RETURNING id, user_id, token_hash, expires_at, used_at, created_at;
  `;
  const result = await getExecutor(client).query(query, [userId, tokenHash, expiresAt]);
  return result.rows[0];
};

export const findValidPasswordResetToken = async (tokenHash, client = null) => {
  const query = `
    SELECT
      id,
      user_id,
      token_hash,
      expires_at,
      used_at,
      created_at
    FROM password_reset_tokens
    WHERE token_hash = $1
      AND used_at IS NULL
      AND expires_at > NOW()
    LIMIT 1;
  `;
  const result = await getExecutor(client).query(query, [tokenHash]);
  return result.rows[0];
};

export const markPasswordResetTokenUsed = async (tokenId, client = null) => {
  const query = `
    UPDATE password_reset_tokens
    SET used_at = COALESCE(used_at, NOW())
    WHERE id = $1;
  `;
  await getExecutor(client).query(query, [tokenId]);
};

export const updateUserPassword = async (userId, hashedPassword, client = null) => {
  const query = `
    UPDATE users
    SET password = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING id, nama, email, updated_at;
  `;
  const result = await getExecutor(client).query(query, [hashedPassword, userId]);
  return result.rows[0];
};
