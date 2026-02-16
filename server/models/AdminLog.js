import mongoose from 'mongoose';

const AdminLogSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['LOGIN', 'AUDIO_ERROR', 'AI_RESPONSE', 'DB_CORRECTION', 'SYSTEM_ACTION', 'PASSWORD_RESET']
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    details: { type: mongoose.Schema.Types.Mixed }, // Flexible payload
    device: { type: String },
    ip: { type: String },
    createdAt: { type: Date, default: Date.now }
});

export const AdminLog = mongoose.models.AdminLog || mongoose.model('AdminLog', AdminLogSchema);
