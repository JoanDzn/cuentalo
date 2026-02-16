
import express from 'express';
import { aiController } from '../controllers/aiController.js';

const router = express.Router();

// POST /api/ai/parse
router.post('/parse', async (req, res) => {
    try {
        await aiController.parseExpense(req, res);
    } catch (error) {
        console.error("Route Error /api/ai/parse:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;
