import express from 'express';
import { rateService } from '../services/rateService.js';

const router = express.Router();

// GET /api/rates
router.get('/', async (req, res) => {
    try {
        const rates = await rateService.getRates();
        res.json(rates);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching rates' });
    }
});

export default router;
