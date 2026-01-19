import mongoose from 'mongoose';

const cached = { conn: null, promise: null };

if (!global.mongoose) {
    global.mongoose = cached;
} else {
    // If we're reusing the global (e.g. in hot reload), use it
    // but in a clean node process this doesn't matter much.
}

async function connectDB() {
    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI) {
        console.error('❌ MONGODB_URI is not defined in environment variables');
        throw new Error('MONGODB_URI environment variable is missing');
    }

    if (global.mongoose.conn) {
        return global.mongoose.conn;
    }

    if (!global.mongoose.promise) {
        const opts = {
            bufferCommands: false,
        };

        global.mongoose.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            console.log('✅ MongoDB Connected Successfully');
            return mongoose;
        });
    }

    try {
        global.mongoose.conn = await global.mongoose.promise;
    } catch (e) {
        global.mongoose.promise = null;
        console.error('❌ MongoDB Connection Error:', e);
        throw e;
    }

    return global.mongoose.conn;
}

export default connectDB;
