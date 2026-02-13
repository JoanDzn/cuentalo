import mongoose from 'mongoose';

const MissionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    title: { type: String, required: true },
    description: { type: String },
    targetAmount: { type: Number }, // Financial Goal
    currentAmount: { type: Number, default: 0 }, // Financial Progress

    // Abstract Progress (for habits, generic counters)
    targetProgress: { type: Number, required: true, default: 100 },
    currentProgress: { type: Number, default: 0 },

    deadline: { type: Date },
    status: {
        type: String,
        enum: ['active', 'completed', 'paused', 'locked'],
        default: 'active'
    },
    icon: { type: String, default: 'target' },
    code: { type: String, index: true },
    type: { type: String, default: 'amount' }, // amount, habit, static
    tip: { type: String, default: '' },

    // Sync Metadata
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false }
});

export const Mission = mongoose.models.Mission || mongoose.model('Mission', MissionSchema);
