import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { AdminLog } from '../models/AdminLog.js';
import connectDB from '../db.js';

const router = express.Router();

// Helper to create tokens
const createTokens = async (user) => {
    const accessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '15m' }
    );

    const expiredAt = new Date();
    expiredAt.setDate(expiredAt.getDate() + 7);

    const _refreshToken = java_uuid();
    const refreshToken = await RefreshToken.create({
        token: _refreshToken,
        user: user._id,
        expiryDate: expiredAt,
    });

    return { accessToken, refreshToken: refreshToken.token };
};

function java_uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// REGISTER
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        if (!email || !password || !name) return res.status(400).json({ message: 'Missing fields' });

        await connectDB();
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: 'Email already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            email,
            password: hashedPassword,
            name,
            role: 'user'
        });

        const { accessToken, refreshToken } = await createTokens(user);

        res.status(201).json({
            message: 'User registered',
            accessToken,
            refreshToken,
            user: { id: user.id, email: user.email, name: user.name, picture: user.picture }
        });
    } catch (e) {
        res.status(500).json({ message: e.message || 'Server error' });
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Missing credentials' });

        await connectDB();
        const user = await User.findOne({ email }).select('+password');

        if (!user || !user.password) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const { accessToken, refreshToken } = await createTokens(user);

        // LOGGING
        try {
            await AdminLog.create({
                type: 'LOGIN',
                userId: user._id,
                details: { status: 'SUCCESS', method: 'Email/Password' },
                ip: req.ip
            });
        } catch (e) {
            console.error("Login Log error", e);
        }

        res.json({
            message: 'Login successful',
            accessToken,
            refreshToken,
            user: { id: user.id, email: user.email, name: user.name, picture: user.picture, role: user.role }
        });
    } catch (e) {
        res.status(500).json({ message: 'Server error', error: e.message });
    }
});

// REFRESH TOKEN (With Rotation)
router.post('/refresh', async (req, res) => {
    const { refreshToken: requestToken } = req.body;
    if (!requestToken) return res.status(403).json({ message: 'Refresh Token is required' });

    try {
        await connectDB();
        const refreshToken = await RefreshToken.findOne({ token: requestToken });

        if (!refreshToken) {
            return res.status(403).json({ message: 'Invalid Refresh Token' });
        }

        if (RefreshToken.verifyExpiration(refreshToken)) {
            await RefreshToken.findByIdAndDelete(refreshToken._id);
            return res.status(403).json({ message: 'Refresh token expired' });
        }

        const user = await User.findById(refreshToken.user);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // ROTATION: Use once and destroy
        await RefreshToken.findByIdAndDelete(refreshToken._id);
        const tokens = await createTokens(user);

        return res.json({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        });

    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// GOOGLE AUTH
router.post('/google', async (req, res) => {
    try {
        const { token } = req.body;
        const client = new OAuth2Client(process.env.VITE_GOOGLE_CLIENT_ID);
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.VITE_GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, name, picture, sub: googleId } = payload;

        await connectDB();
        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({ googleId, email, name, picture, role: 'user' });
        }

        const { accessToken, refreshToken } = await createTokens(user);

        res.json({
            message: 'Auth successful',
            accessToken,
            refreshToken,
            user: { id: user.id, email: user.email, name: user.name, picture: user.picture, role: user.role }
        });

    } catch (e) {
        res.status(401).json({ message: 'Auth failed', error: e.message });
    }
});

// GET CURRENT USER (/me)
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'No token provided' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        await connectDB();
        const user = await User.findById(decoded.id).lean();

        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({
            id: user._id,
            email: user.email,
            name: user.name,
            picture: user.picture,
            role: user.role
        });
    } catch (e) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

export default router;
