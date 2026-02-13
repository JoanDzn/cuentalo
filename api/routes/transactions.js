import express from 'express';
import { Transaction } from '../models/Transaction.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET all transactions (Sync friendly)
router.get('/', protect, async (req, res) => {
    try {
        const { lastSync } = req.query;
        const query = { userId: req.user._id, isDeleted: false };

        if (lastSync) {
            query.updatedAt = { $gt: new Date(lastSync) };
        }

        const transactions = await Transaction.find(query).sort({ date: -1 });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// CREATE Transaction
router.post('/', protect, async (req, res) => {
    try {
        const { amount, description, category, date, type, originalAmount, originalCurrency, rateType } = req.body;

        const transaction = new Transaction({
            userId: req.user._id,
            amount,
            description,
            category,
            date,
            type,
            originalAmount,
            originalCurrency,
            rateType,
        });

        const createdTransaction = await transaction.save();
        res.status(201).json(createdTransaction);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// UPDATE Transaction
router.put('/:id', protect, async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        if (transaction) {
            if (transaction.userId.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Not authorized' });
            }

            const { amount, description, category, date, type } = req.body;

            transaction.amount = amount || transaction.amount;
            transaction.description = description || transaction.description;
            transaction.category = category || transaction.category;
            transaction.date = date || transaction.date;
            transaction.type = type || transaction.type;
            transaction.updatedAt = Date.now();

            const updatedTransaction = await transaction.save();
            res.json(updatedTransaction);
        } else {
            res.status(404).json({ message: 'Transaction not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// DELETE Transaction (Soft Delete)
router.delete('/:id', protect, async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        if (transaction) {
            if (transaction.userId.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Not authorized' });
            }

            transaction.isDeleted = true;
            transaction.updatedAt = Date.now();
            await transaction.save();
            res.json({ message: 'Transaction removed' });
        } else {
            res.status(404).json({ message: 'Transaction not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
