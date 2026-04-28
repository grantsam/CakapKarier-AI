import express from 'express';
import { config } from './config/index.js';
import db from './database/db.js';
import authRoutes from './routes/auth.routes.js';
import globalErrorHandler from './middleware/error.js';
import AppError from './utils/AppError.js';

const app = express();

// Middleware
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'CakapKarier-AI Backend API is running' });
});

app.use('/api/auth', authRoutes);

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
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(globalErrorHandler);

app.listen(config.port, () => {
  console.log(`Server is running on http://localhost:${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
});
