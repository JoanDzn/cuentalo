import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { AdminLog } from '../models/AdminLog.js';
import connectDB from '../db.js';
import crypto from 'crypto';
import { mailService } from '../services/mailService.js';

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

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Solicita enlace de recuperación (Protección de enumeración incluida)
 */
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email es requerido' });

        await connectDB();
        const user = await User.findOne({ email });

        // Protección contra enumeración: 
        // Siempre devolvemos éxito incluso si el usuario no existe.
        if (!user) {
            console.warn(`Forgot password attempt for non-existent email: ${email}`);
            return res.json({ message: 'Si el correo está registrado, recibirás un enlace de recuperación.' });
        }

        // Generar token criptográfico (Hex para la URL, SHA256 para la DB)
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Guardar en DB con expiración de 1 hora
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpire = Date.now() + 3600000;
        await user.save();

        // Enviar Correo
        try {
            await mailService.sendRecoveryEmail(user.email, resetToken, user.name);

            // Log de auditoría
            await AdminLog.create({
                type: 'PASSWORD_RESET',
                userId: user._id,
                details: { status: 'REQUESTED', ip: req.ip },
                ip: req.ip
            });

        } catch (emailError) {
            console.error('Email service failed:', emailError);
            // En producción, podrías querer revertir los campos del usuario aquí
        }

        res.json({ message: 'Si el correo está registrado, recibirás un enlace de recuperación.' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

/**
 * @route   POST /api/auth/reset-password/:token
 * @desc    Restablece la contraseña usando el token
 */
router.post('/reset-password/:token', async (req, res) => {
    try {
        const { password } = req.body;
        if (!password) return res.status(400).json({ message: 'Nueva contraseña requerida' });

        // Hashear el token recibido para compararlo con el de la DB
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        await connectDB();
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'El enlace es inválido o ha expirado.' });
        }

        // Hashear y actualizar contraseña
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Limpiar tokens de recuperación
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        // Log de auditoría
        await AdminLog.create({
            type: 'PASSWORD_RESET',
            userId: user._id,
            details: { status: 'SUCCESS', ip: req.ip },
            ip: req.ip
        });

        res.json({ message: 'Contraseña actualizada con éxito. Ya puedes iniciar sesión.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Error al restablecer contraseña' });
    }
});

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

// Lazy initialization of OAuth2Client
let client;
const getClient = () => {
    if (!client) {
        client = new OAuth2Client(
            process.env.VITE_GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
        );
    }
    return client;
};

// GOOGLE AUTH
router.post('/google', async (req, res) => {
    try {
        const { token, redirectUri } = req.body;
        if (!token) return res.status(400).json({ message: 'Token required' });

        const _client = getClient();
        let payload;

        try {
            if (redirectUri) {
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
            } else {
                const ticket = await _client.verifyIdToken({
                    idToken: token,
                    audience: process.env.VITE_GOOGLE_CLIENT_ID,
                });
                payload = ticket.getPayload();
            }
        } catch (verifyError) {
            console.error("Google Token Verification Failed:", verifyError);
            return res.status(401).json({ message: 'Error de verificación con Google', error: verifyError.message });
        }

        const { email, name, picture, sub: googleId } = payload;
        await connectDB();
        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({ googleId, email, name, picture, role: 'user' });
        } else if (!user.googleId) {
            user.googleId = googleId;
            if (!user.picture) user.picture = picture;
            await user.save();
        }

        const { accessToken, refreshToken } = await createTokens(user);

        res.json({
            message: 'Auth successful',
            accessToken,
            refreshToken,
            user: { id: user.id, email: user.email, name: user.name, picture: user.picture, role: user.role }
        });

    } catch (e) {
        console.error("Critical Google Auth Error:", e);
        res.status(500).json({ message: 'Error interno en Google Auth', error: e.message });
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
