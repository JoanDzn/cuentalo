import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { AdminLog } from '../models/AdminLog.js';
import connectDB from '../db.js';

const router = express.Router();

// Lazy initialization to ensure env vars are loaded
let client;
const getClient = () => {
    if (!client) {
        console.log("Initializing Google Client with ID:", process.env.VITE_GOOGLE_CLIENT_ID);
        if (!process.env.GOOGLE_CLIENT_SECRET) console.error("CRITICAL: GOOGLE_CLIENT_SECRET is missing!");

        client = new OAuth2Client(
            process.env.VITE_GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
        );
    }
    return client;
};

// Helper to create tokens
const createTokens = async (user) => {
    const accessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '30d' } // Long lived for dev
    );

    const expiredAt = new Date();
    expiredAt.setSeconds(expiredAt.getSeconds() + 86400 * 30); // 30 days

    const _refreshToken = java_uuid(); // Just a random string or JWT
    const refreshToken = await RefreshToken.create({
        token: _refreshToken,
        user: user._id,
        expiryDate: expiredAt.getTime(),
    });

    return { accessToken, refreshToken: refreshToken.token };
};

// Simple UUID generator for refresh token opacity
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
        console.error("Registration Error:", e);
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
                details: { status: 'SUCCESS', method: 'Email/Google' },
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

// REFRESH TOKEN
router.post('/refresh', async (req, res) => {
    const { refreshToken: requestToken } = req.body;
    if (!requestToken) return res.status(403).json({ message: 'Refresh Token is required' });

    try {
        await connectDB();
        const refreshToken = await RefreshToken.findOne({ token: requestToken });

        if (!refreshToken) {
            return res.status(403).json({ message: 'Refresh token is not in database!' });
        }

        if (RefreshToken.verifyExpiration(refreshToken)) {
            await RefreshToken.findByIdAndRemove(refreshToken._id, { useFindAndModify: false }).exec();
            return res.status(403).json({ message: 'Refresh token was expired. Please make a new signin request' });
        }

        const user = await User.findById(refreshToken.user);

        const newAccessToken = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '15m' }
        );

        return res.json({
            accessToken: newAccessToken,
            refreshToken: refreshToken.token,
        });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

// GOOGLE AUTH
router.post('/google', async (req, res) => {
    try {
        console.log("GOOGLE AUTH HIT. Body:", req.body);
        const { token, redirectUri } = req.body;
        if (!token) return res.status(400).json({ message: 'Token required' });

        let payload;

        // AUTH CODE FLOW (Code exchange)
        // If redirectUri is provided, we assume typical Authorization Code flow
        if (redirectUri) {
            try {
                const _client = getClient();
                const { tokens } = await _client.getToken({
                    code: token,
                    redirect_uri: redirectUri
                });
                _client.setCredentials(tokens);

                const ticket = await _client.verifyIdToken({
                    idToken: tokens.id_token,
                    audience: process.env.VITE_GOOGLE_CLIENT_ID,
                });
                payload = ticket.getPayload();
            } catch (error) {
                console.error("Code exchange failed:", error.message);
                throw new Error("Failed to exchange authorization code");
            }
        }
        // ID TOKEN FLOW (Implicit/Credential)
        else if (token.length > 500 || token.startsWith('eyJ')) {
            const ticket = await getClient().verifyIdToken({
                idToken: token,
                audience: process.env.VITE_GOOGLE_CLIENT_ID,
            });
            payload = ticket.getPayload();
        }
        // ACCESS TOKEN FLOW (Legacy)
        else {
            const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!userInfoResponse.ok) throw new Error('Invalid Access Token');
            const userInfo = await userInfoResponse.json();
            payload = { email: userInfo.email, name: userInfo.name, picture: userInfo.picture, sub: userInfo.sub };
        }

        if (!payload) return res.status(401).json({ message: 'Invalid payload' });

        const { email, name, picture, sub: googleId } = payload;

        await connectDB();
        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({ googleId, email, name, picture, role: 'user' });
        }

        const { accessToken, refreshToken } = await createTokens(user);

        // LOGGING
        try {
            // Dynamically import to avoid circular dependency issues if any, or just consistent logic
            // Assuming AdminLog model exists as per login route
            const { AdminLog } = await import('../models/AdminLog.js');
            await AdminLog.create({
                type: 'LOGIN',
                userId: user._id,
                details: { status: 'SUCCESS', method: 'Google' },
                ip: req.ip
            });
        } catch (e) {
            console.error("Login Log error", e);
        }

        res.json({
            message: 'Auth successful',
            accessToken,
            refreshToken,
            user: { id: user.id, email: user.email, name: user.name, picture: user.picture, role: user.role }
        });

    } catch (e) {
        console.error("Google Auth Error:", e);
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
        const user = await User.findById(decoded.id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({
            id: user.id,
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
