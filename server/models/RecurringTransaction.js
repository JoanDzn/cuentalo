import mongoose from 'mongoose';

const RecurringTransactionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    period: { type: String }, // e.g., '2026-02'
    day: { type: Number, required: true, min: 1, max: 31 }, // Day of month
    type: { type: String, enum: ['expense', 'income'], required: true },
    category: { type: String, default: 'General' },
    active: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

export const RecurringTransaction = mongoose.models.RecurringTransaction || mongoose.model('RecurringTransaction', RecurringTransactionSchema);
