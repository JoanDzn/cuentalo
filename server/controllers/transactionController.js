import { transactionService } from '../services/transactionService.js';

export const transactionController = {
    // GET all transactions
    async getAll(req, res) {
        try {
            const { lastSync } = req.query;
            const transactions = await transactionService.getAll(req.user._id, lastSync);
            res.json(transactions);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error retrieving transactions' });
        }
    },

    // CREATE Transaction
    async create(req, res) {
        try {
            // Validate request body using middleware
            const transaction = await transactionService.create(req.user._id, req.body);
            res.status(201).json(transaction);
        } catch (error) {
            console.error(error);
            if (error.name === 'ValidationError') {
                return res.status(400).json({ message: error.message });
            }
            res.status(500).json({ message: 'Error creating transaction' });
        }
    },

    // UPDATE Transaction
    async update(req, res) {
        try {
            const updated = await transactionService.update(req.params.id, req.user._id, req.body);
            if (!updated) {
                return res.status(404).json({ message: 'Transaction not found' });
            }
            res.json(updated);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error updating transaction' });
        }
    },

    // DELETE Transaction (Soft Delete)
    async delete(req, res) {
        try {
            const success = await transactionService.delete(req.params.id, req.user._id);
            if (!success) {
                return res.status(404).json({ message: 'Transaction not found' });
            }
            res.json({ message: 'Transaction removed' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error deleting transaction' });
        }
    }
};
