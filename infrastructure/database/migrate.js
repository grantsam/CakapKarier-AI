import pg from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../WebApplication/backend-express/.env') });

const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
};

async function runMigrations() {
  const targetDb = process.env.DB_NAME;
  
  // 1. Koneksi ke database 'postgres' (default) untuk cek/buat database target
  const defaultPool = new pg.Pool({ ...dbConfig, database: 'postgres' });
  
  try {
    const result = await defaultPool.query(`SELECT 1 FROM pg_database WHERE datname = '${targetDb}'`);
    if (result.rowCount === 0) {
      console.log(`Database '${targetDb}' tidak ditemukan. Membuat database...`);
      await defaultPool.query(`CREATE DATABASE ${targetDb}`);
      console.log(`Database '${targetDb}' berhasil dibuat.`);
    }
  } catch (err) {
    console.error('Gagal mengecek/membuat database:', err.message);
    console.log('Pastikan service PostgreSQL sudah berjalan (Start Postgres Service).');
    process.exit(1);
  } finally {
    await defaultPool.end();
  }

  // 2. Koneksi ke database target untuk jalankan migrasi tabel
  const pool = new pg.Pool({ ...dbConfig, database: targetDb });
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));

  for (const file of files) {
    console.log(`Running migration: ${file}...`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('COMMIT');
      console.log(`Migration ${file} selesai.`);
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(`Error pada ${file}:`, err.message);
      process.exit(1);
    } finally {
      client.release();
    }
  }

  console.log('Semua migrasi selesai.');
  await pool.end();
}

runMigrations();
