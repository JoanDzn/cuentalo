
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

// POST /api/ai/analyze-image
router.post('/analyze-image', async (req, res) => {
    try {
        await aiController.analyzeImage(req, res);
    } catch (error) {
        console.error("Route Error /api/ai/analyze-image:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Output list of available models for debugging
router.get('/models', async (req, res) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return res.status(500).json({ error: "No API Key" });

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.models) {
            res.json(data.models.map(m => m.name.replace('models/', '')));
        } else {
            res.status(500).json(data);
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.get('/test', (req, res) => {
    res.json({
        status: "ok",
        version: "2.0",
        time: new Date(),
        env: {
            hasKey1: !!process.env.GEMINI_API_KEY,
            hasKey2: !!process.env.GEMINI_API_KEY_2,
            apiUrl: process.env.VITE_API_URL
        }
    });
});

export default router;
