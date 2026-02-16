import express from 'express';
import { RecurringTransaction } from '../models/RecurringTransaction.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// protect all routes
router.use(protect);

// GET all recurring transactions for user
router.get('/', async (req, res) => {
    try {
        const recurring = await RecurringTransaction.find({ user: req.user._id });
        res.json(recurring);
    } catch (error) {
        console.error('Error fetching recurring transactions:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// SYNC (Bulk Replace) all recurring transactions for user
// This is used because the frontend currently manages correct state as a full array
router.post('/sync', async (req, res) => {
    try {
        const { items } = req.body; // Array of recurring transactions

        if (!Array.isArray(items)) {
            return res.status(400).json({ message: 'Items must be an array' });
        }

        // 1. Delete all existing recurring for this user
        await RecurringTransaction.deleteMany({ user: req.user._id });

        // 2. Insert new ones
        if (items.length > 0) {
            const toInsert = items.map(item => ({
                user: req.user._id,
                name: item.name,
                amount: item.amount,
                day: item.day,
                type: item.type,
                category: item.category || 'General',
                active: true
            }));
            const inserted = await RecurringTransaction.insertMany(toInsert);
            res.json(inserted);
        } else {
            res.json([]);
        }

    } catch (error) {
        console.error('Error syncing recurring transactions:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
