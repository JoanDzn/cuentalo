import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const router = express.Router(); // Using generic express router

const protectAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) throw new Error('No token');

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        if (decoded.email !== 'admin@gmail.com') throw new Error('Not admin');

        req.user = decoded;
        next();
    } catch (e) {
        res.status(401).json({ message: 'Unauthorized' });
    }
};

const adminRoutes = router;

// LOGIN
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (email === 'admin@gmail.com' && password === '123456') {
        const token = jwt.sign({ email, role: 'ADMIN' }, process.env.JWT_SECRET || 'fallback_secret');
        res.json({ token });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

// GET USERS
router.get('/users', protectAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (e) {
        res.status(500).json({ message: 'Error' });
    }
});

export default router;
