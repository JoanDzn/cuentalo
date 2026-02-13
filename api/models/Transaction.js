import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true }, // e.g., 'Comida', 'Transporte'
    date: { type: Date, required: true, default: Date.now },
    type: { type: String, enum: ['expense', 'income'], required: true },

    // Exchange Rate Details (useful for Venezuela context)
    originalAmount: { type: Number },
    originalCurrency: { type: String, enum: ['USD', 'VES'], default: 'USD' },
    rateType: { type: String, enum: ['bcv', 'euro', 'usdt', null] },
    rateValue: { type: Number },

    // Sync Metadata
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false } // Soft delete for sync
});

// Compound Index for efficient sync queries
TransactionSchema.index({ userId: 1, updatedAt: 1 });

export const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);
