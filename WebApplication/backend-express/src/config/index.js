import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend-express root
dotenv.config({ path: path.join(__dirname, '../../.env') });

const requireEnv = (key) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const requireStrongJwtSecret = () => {
  const secret = requireEnv('JWT_SECRET');
  if (secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }
  return secret;
};

const parsePositiveIntegerEnv = (key, fallback) => {
  const rawValue = process.env[key] || fallback;
  const value = Number(rawValue);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${key} must be a positive integer`);
  }
  return value;
};

const parseBooleanEnv = (key, fallback = false) => {
  const rawValue = process.env[key];
  if (rawValue === undefined || rawValue === '') return fallback;
  return rawValue.toLowerCase() === 'true';
};

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  db: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
  },
  jwt: {
    secret: requireStrongJwtSecret(),
    expiresIn: requireEnv('JWT_EXPIRES_IN'),
  },
  ai: {
    careerMatchUrl: process.env.AI_CAREER_MATCH_URL || 'http://127.0.0.1:8001',
    requestTimeoutMs: parsePositiveIntegerEnv('AI_REQUEST_TIMEOUT_MS', '30000'),
  },
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parsePositiveIntegerEnv('SMTP_PORT', '587'),
    secure: parseBooleanEnv('SMTP_SECURE', false),
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    from: process.env.SMTP_FROM || '',
  },
  passwordReset: {
    tokenExpiresMinutes: parsePositiveIntegerEnv('PASSWORD_RESET_TOKEN_EXPIRES_MINUTES', '30'),
  }
};
