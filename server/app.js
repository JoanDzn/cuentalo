import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
dotenv.config();
// explicitly load .env.local if not loaded automatically
dotenv.config({ path: '.env.local' });

import connectDB from './db.js';

import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';

const app = express();

// Security Headers
// app.use(helmet());

// Middleware
app.use(cors());
app.use(express.json());

// Sanitization against NoSQL Injection
// app.use(mongoSanitize());

// Rate Limiting
/*
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message: 'Too many requests from this IP'
});
app.use('/api', limiter);
*/

// Debug Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

import transactionRoutes from './routes/transactions.js';
import missionRoutes from './routes/missions.js';

app.use('/api/transactions', transactionRoutes);
app.use('/api/missions', missionRoutes);

import authRoutes from './routes/auth.js';
app.use('/api/auth', authRoutes);

// Admin Routes
import adminRoutes from './routes/admin.js';
app.use('/api/admin', adminRoutes);

// Rates Route (Cached)
import rateRoutes from './routes/rates.js';
app.use('/api/rates', rateRoutes);

// AI Routes
import aiRoutes from './routes/ai.js';
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

export default app;
