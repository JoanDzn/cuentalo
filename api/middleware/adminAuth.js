import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const ADMIN_EMAIL = 'admin@gmail.com';
// Hardcoded password 123456 logic IS HANDLED IN THE LOGIN ENDPOINT, not here (here we verify token).
// Token for admin should contain role: 'ADMIN'

export const protectAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

        // Specific Check: Email MUST be admin@gmail.com
        if (decoded.email !== ADMIN_EMAIL) {
            return res.status(403).json({ message: 'Access denied: Invalid Admin Credentials' });
        }

        req.user = decoded; // Attach admin user payload
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};
