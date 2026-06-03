import pg from 'pg';
import { config } from '../config/index.js';

const { Pool } = pg;

const buildSslConfig = () => {
  if (!config.db.ssl) return false;

  const sslConfig = {
    rejectUnauthorized: config.db.sslRejectUnauthorized,
  };

  if (config.db.sslCa) {
    sslConfig.ca = config.db.sslCa.replace(/\\n/g, '\n');
  }

  return sslConfig;
};

const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.name,
  ssl: buildSslConfig(),
});

export default {
  query: (text, params) => pool.query(text, params),
  pool
};
