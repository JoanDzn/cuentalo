import express from 'express';
import cors from 'cors';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
dotenv.config();
// explicitly load .env.local if not loaded automatically
dotenv.config({ path: '.env.local' });

import connectDB from './db.js';
import { User } from './models/User.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Google Client Config
const client = new OAuth2Client(
    process.env.VITE_GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
);

// Mock Database (In-memory for demo)
// In production, connect to MongoDB/Postgres here.
// Connection to MongoDB handled inside route


app.post('/api/auth/google', async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ message: 'Token is required' });
        }

        // 1. Verify Google Token (ID Token, Access Token, or Auth Code)
        let payload;

        // Check if it's an Auth Code (for Redirect Flow)
        if (!token.startsWith('ey') && token.length < 256) {
            const { redirectUri } = req.body;

            const { tokens } = await client.getToken({
                code: token,
                redirect_uri: redirectUri
            });

            client.setCredentials(tokens);

            if (tokens.id_token) {
                const ticket = await client.verifyIdToken({
                    idToken: tokens.id_token,
                    audience: process.env.VITE_GOOGLE_CLIENT_ID,
                });
                payload = ticket.getPayload();
            } else {
                const userInfoResponse = await client.request({ url: 'https://www.googleapis.com/oauth2/v3/userinfo' });
                payload = userInfoResponse.data;
            }

        } else if (token.length > 500 || token.startsWith('eyJ')) {
            // It's a JWT ID Token (Popup Flow)
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: process.env.VITE_GOOGLE_CLIENT_ID,
            });
            payload = ticket.getPayload();
        } else {
            // It's an Access Token (Implicit Flow)
            const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!userInfoResponse.ok) {
                throw new Error('Invalid Access Token');
            }

            const userInfo = await userInfoResponse.json();
            payload = {
                email: userInfo.email,
                name: userInfo.name,
                picture: userInfo.picture,
                sub: userInfo.sub
            };
        }

        if (!payload) {
            return res.status(401).json({ message: 'Invalid token payload' });
        }

        const { email, name, picture, sub: googleId } = payload;

        // 2. Connect DB
        await connectDB();

        // 3. Find or Create User in MongoDB
        let user = await User.findOne({ email });

        if (!user) {
            // Create new user
            user = await User.create({
                googleId,
                email,
                name,
                picture,
                role: 'user'
            });
            console.log('New user created in MongoDB:', email);
        } else {
            console.log('User logged in from MongoDB:', email);
        }

        // 3. Generate App JWT
        // This token maintains the session in YOUR app
        const appToken = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '7d' }
        );

        // 4. Return success response
        return res.status(200).json({
            message: 'Authentication successful',
            token: appToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                picture: user.picture
            }
        });

    } catch (error) {
        console.error('Google Auth Error:', error);
        return res.status(401).json({
            message: 'Authentication failed',
            error: error.message
        });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

export default app;
