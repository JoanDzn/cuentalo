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

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

import transactionRoutes from './routes/transactions.js';
import missionRoutes from './routes/missions.js';

app.use('/api/transactions', transactionRoutes);
app.use('/api/missions', missionRoutes);

import authRoutes from './routes/auth.js';
app.use('/api/auth', authRoutes);

// Admin Routes
import adminRoutes from './routes/admin.js';
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

export default app;
