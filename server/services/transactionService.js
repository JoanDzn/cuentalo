import { Transaction } from '../models/Transaction.js';

export const transactionService = {
    async getAll(userId, lastSync) {
        const query = { userId, isDeleted: false };
        if (lastSync) {
            query.updatedAt = { $gt: new Date(lastSync) };
        }
        return await Transaction.find(query)
            .sort({ createdAt: -1 })
            .select('-__v')
            .lean();
    },

    async create(userId, data) {
        const transaction = await Transaction.create({ ...data, userId });
        return transaction;
    },

    async update(id, userId, updates) {
        const transaction = await Transaction.findOne({ _id: id, userId });
        if (!transaction) return null;

        Object.assign(transaction, updates);
        transaction.updatedAt = new Date();
        return await transaction.save();
    },

    async delete(id, userId) {
        const transaction = await Transaction.findOne({ _id: id, userId });
        if (!transaction) return null;

        transaction.isDeleted = true;
        transaction.updatedAt = new Date();
        return await transaction.save();
    }
};
