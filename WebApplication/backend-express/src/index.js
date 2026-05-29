import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { config } from './config/index.js';
import db from './database/db.js';
import analysisRoutes from './routes/analysis.routes.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import globalErrorHandler from './middleware/error.js';
import AppError from './utils/AppError.js';
import { openApiSpec, swaggerUiHtml } from './docs/openapi.js';

const app = express();

if (config.trustProxy) {
  app.set('trust proxy', 1);
}

app.use(helmet({
  contentSecurityPolicy: config.apiDocs.enabled ? false : undefined,
  hsts: config.nodeEnv === 'production' ? undefined : false,
}));

app.use(cors({
  origin(origin, callback) {
    if (!origin || config.cors.allowedOrigins.includes('*') || config.cors.allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new AppError('Origin tidak diizinkan oleh konfigurasi CORS', 403));
  },
  methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware
app.use(express.json({ limit: config.request.jsonLimit }));

// API documentation for frontend integration
if (config.apiDocs.enabled) {
  app.get('/api-docs.json', (req, res) => {
    res.json(openApiSpec);
  });

  app.get(['/api-docs', '/api-docs/'], (req, res) => {
    res.type('html').send(swaggerUiHtml);
  });
}

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'CakapKarier-AI Backend API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/analysis', analysisRoutes);

// Health Check
app.get('/health', async (req, res, next) => {
  try {
    const dbTest = await db.query('SELECT NOW()');
    res.json({
      status: 'UP',
      database: 'Connected',
      timestamp: dbTest.rows[0].now
    });
  } catch (err) {
    next(new AppError('Database connection failed', 500));
  }
});

// Route not found handler
app.use((req, res, next) => {
  next(new AppError('Route tidak ditemukan', 404));
});

// Global Error Handler
app.use(globalErrorHandler);

app.listen(config.port, () => {
  console.log(`Server is running on http://localhost:${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
});
