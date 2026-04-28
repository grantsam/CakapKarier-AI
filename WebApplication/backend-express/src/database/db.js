import pg from 'pg';
import { config } from '../config/index.js';

const { Pool } = pg;

const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.name,
});

export default {
  query: (text, params) => pool.query(text, params),
  pool
};
