import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import connectDB from '../db.js';
import { User } from '../models/User.js';
import { AdminLog } from '../models/AdminLog.js';
import { SystemConfig } from '../models/SystemConfig.js';
import { protectAdmin } from '../middleware/adminAuth.js';
import { Transaction } from '../models/Transaction.js';

const router = express.Router();

const ADMIN_EMAIL = 'admin@gmail.com';
// Hardcoded password logic remains in login route for now

// 1. ADMIN LOGIN (Special Route)
router.post('/login', async (req, res) => {
    try {
        await connectDB();
        const { email, password } = req.body;
        // Basic hardcoded check
        if (email !== ADMIN_EMAIL || password !== '123456') {
            return res.status(401).json({ message: 'Credenciales de Admin Invalidas' });
        }

        const token = jwt.sign(
            { id: 'ADMIN_ID', email: ADMIN_EMAIL, role: 'ADMIN' },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '12h' }
        );

        res.json({ token, user: { email: ADMIN_EMAIL, role: 'ADMIN' } });
    } catch (e) {
        console.error("Login Error:", e);
        res.status(500).json({ message: 'Server error: ' + e.message });
    }
});

// 2. DASHBOARD METRICS (ENHANCED)
router.get('/metrics', protectAdmin, async (req, res) => {
    try {
        await connectDB();
        const totalUsers = await User.countDocuments();

        // Transaction Volume (Count)
        const totalTransactions = await Transaction.countDocuments();

        // AI Success Rate
        const totalAI = await AdminLog.countDocuments({ type: 'AI_RESPONSE' });
        const audioErrors = await AdminLog.countDocuments({ type: 'AUDIO_ERROR' });
        const successRate = totalAI > 0 ? Math.round(((totalAI - audioErrors) / totalAI) * 100) : 100;

        // Chart Data: User Growth (Last 7 Days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0); // Normalize time

        const userGrowthRaw = await User.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Transaction Volume Chart (Last 7 Days)
        // Ensure we match Date vs Date appropriately
        const txVolumeRaw = await Transaction.aggregate([
            { $match: { date: { $gte: sevenDaysAgo } } }, // Match strictly >= Date object
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    volume: { $sum: "$amount" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            users: totalUsers,
            transactions: totalTransactions,
            aiSuccessRate: successRate,
            charts: {
                userGrowth: userGrowthRaw,
                txVolume: txVolumeRaw
            }
        });
    } catch (e) {
        console.error("Metrics Error:", e);
        res.status(500).json({ message: 'Error fetching metrics', error: e.message });
    }
});

// 3. USER MANAGEMENT (PAGINATED & CRUD)
router.get('/users', protectAdmin, async (req, res) => {
    try {
        await connectDB();
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const total = await User.countDocuments();
        const users = await User.find()
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            users,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (e) {
        res.status(500).json({ message: 'Error fetching users' });
    }
});

// Helper for Balance (Calculated)
const calculateUserBalance = async (userId) => {
    const result = await Transaction.aggregate([
        {
            $match: {
                userId: new mongoose.Types.ObjectId(userId),
                isDeleted: { $ne: true }
            }
        },
        {
            $group: {
                _id: null,
                totalIncome: {
                    $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] }
                },
                totalExpense: {
                    $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] }
                }
            }
        }
    ]);

    if (result.length > 0) {
        return result[0].totalIncome - result[0].totalExpense;
    }
    return 0;
};

// GET Single User details (for Edit Modal)
router.get('/users/:id', protectAdmin, async (req, res) => {
    try {
        await connectDB();
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Calculate balance dynamically
        const balance = await calculateUserBalance(user._id);

        res.json({ ...user.toObject(), balance });
    } catch (e) {
        res.status(500).json({ message: 'Error fetching user details' });
    }
});

// UPDATE User
router.patch('/users/:id', protectAdmin, async (req, res) => {
    try {
        await connectDB();
        const { name, email, isActive } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { name, email, isActive },
            { new: true }
        ).select('-password');

        await AdminLog.create({
            type: 'SYSTEM_ACTION',
            details: { action: 'UPDATE_USER', targetId: req.params.id, changes: req.body },
            ip: req.ip
        });

        res.json(user);
    } catch (e) {
        res.status(500).json({ message: 'Error updating user' });
    }
});

// DELETE User
router.delete('/users/:id', protectAdmin, async (req, res) => {
    try {
        await connectDB();
        const userId = req.params.id;

        // Delete User
        await User.findByIdAndDelete(userId);
        // Delete Transactions
        await Transaction.deleteMany({ userId });

        await AdminLog.create({
            type: 'SYSTEM_ACTION',
            details: { action: 'DELETE_USER_FULL', targetId: userId },
            ip: req.ip
        });

        res.json({ message: 'User and data deleted' });
    } catch (e) {
        res.status(500).json({ message: 'Error deleting user' });
    }
});

// 4. LOGS (Filtered)
router.get('/logs', protectAdmin, async (req, res) => {
    try {
        await connectDB();
        const { type } = req.query;
        let query = {};
        if (type) query.type = type;

        const logs = await AdminLog.find(query).sort({ createdAt: -1 }).limit(100);
        res.json(logs);
    } catch (e) {
        res.status(500).json({ message: 'Error fetching logs' });
    }
});

// 5. SYSTEM CONFIG
router.get('/config', protectAdmin, async (req, res) => {
    try {
        await connectDB();
        let config = await SystemConfig.findOne();
        if (!config) {
            config = await SystemConfig.create({});
        }
        res.json(config);
    } catch (e) {
        res.status(500).json({ message: 'Error fetching config' });
    }
});

router.put('/config', protectAdmin, async (req, res) => {
    try {
        await connectDB();
        const { maintenanceMode, appVersion, systemMessage } = req.body;
        let config = await SystemConfig.findOne();
        if (!config) config = await SystemConfig.create({});

        if (maintenanceMode !== undefined) config.maintenanceMode = maintenanceMode;
        if (appVersion) config.appVersion = appVersion;
        if (systemMessage !== undefined) config.systemMessage = systemMessage;

        await config.save();
        res.json(config);
    } catch (e) {
        res.status(500).json({ message: 'Error updating config' });
    }
});

// 6. DB EDITOR (Delete Transaction)
router.delete('/transaction/:id', protectAdmin, async (req, res) => {
    try {
        await connectDB();
        await Transaction.findByIdAndDelete(req.params.id);
        await AdminLog.create({
            type: 'DB_CORRECTION',
            details: { action: 'DELETE_TRANSACTION', id: req.params.id },
            ip: req.ip
        });
        res.json({ message: 'Transaction deleted' });
    } catch (e) {
        res.status(500).json({ message: 'Error deleting transaction' });
    }
});

export default router;
