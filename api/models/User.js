import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    googleId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    name: { type: String },
    picture: { type: String },
    role: { type: String, default: 'user' },
    createdAt: { type: Date, default: Date.now },
});

// Prevent model recompilation error in serverless environment
export const User = mongoose.models.User || mongoose.model('User', UserSchema);
