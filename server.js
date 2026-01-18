import app from './api/app.js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Backend Server running on http://localhost:${PORT}`);
});
