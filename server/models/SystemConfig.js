import mongoose from 'mongoose';

const SystemConfigSchema = new mongoose.Schema({
    maintenanceMode: { type: Boolean, default: false },
    appVersion: { type: String, default: 'v0.7.3' },
    systemMessage: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export const SystemConfig = mongoose.models.SystemConfig || mongoose.model('SystemConfig', SystemConfigSchema);
