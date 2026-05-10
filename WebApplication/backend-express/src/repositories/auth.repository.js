import db from '../database/db.js';

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
