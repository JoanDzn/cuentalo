import app from './api/app.js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import connectDB from './api/db.js';

const PORT = process.env.PORT || 3001;

// Connect to DB before listening
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Backend Server running on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error("Failed to connect to DB", err);
});
