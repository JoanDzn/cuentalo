import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    googleId: { type: String, unique: true, sparse: true }, // sparse allows multiple nulls
    email: { type: String, required: true, unique: true },
    password: { type: String, select: false }, // Don't return password by default
    name: { type: String },
    picture: { type: String },
    role: { type: String, default: 'user' },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
});

// Prevent model recompilation error in serverless environment
export const User = mongoose.models.User || mongoose.model('User', UserSchema);
