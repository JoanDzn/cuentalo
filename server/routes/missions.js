import express from 'express';
import { Mission } from '../models/Mission.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
    try {
        let missions = await Mission.find({ userId: req.user._id, isDeleted: false });

        // Check if we need to seed (empty list OR broken data from previous schema)
        // If the first mission is missing 'targetProgress' (NaN issue), we treat it as invalid and re-seed.
        const isInvalid = missions.length > 0 && missions[0].targetProgress === undefined;

        if (missions.length === 0 || isInvalid) {

            // Clean up broken data if necessary
            if (isInvalid) {
                await Mission.deleteMany({ userId: req.user._id, code: { $in: ['emergency-fund', 'track-expenses', 'smart-shopper'] } });
            }

            const defaultMissions = [
                {
                    userId: req.user._id,
                    code: 'emergency-fund',
                    title: 'Fondo de Emergencia',
                    description: 'Ahorra $1,000 para imprevistos',
                    targetAmount: 1000,
                    currentProgress: 0,
                    targetProgress: 1000,
                    status: 'active',
                    type: 'amount',
                    icon: 'piggybank',
                    tip: 'Guarda al menos el 10% de tus ingresos mensuales.'
                },
                {
                    userId: req.user._id,
                    code: 'track-expenses',
                    title: 'Hábito de Registro',
                    description: 'Registra 10 transacciones nuevas',
                    targetAmount: 0,
                    currentProgress: 0,
                    targetProgress: 10,
                    status: 'active',
                    type: 'habit',
                    icon: 'calendar',
                    tip: 'Registrar gastos diariamente te ayuda a identificar fugas de dinero.'
                },
                {
                    userId: req.user._id,
                    code: 'smart-shopper',
                    title: 'Compra Inteligente',
                    description: 'Evita gastos hormiga por 7 días',
                    targetAmount: 0,
                    currentProgress: 0,
                    targetProgress: 7,
                    status: 'locked',
                    type: 'days',
                    icon: 'trending-up',
                    tip: 'Pregúntate "¿realmente lo necesito?" antes de cada compra pequeña.'
                }
            ];
            missions = await Mission.insertMany(defaultMissions);
        }

        res.json(missions);
    } catch (error) {
        console.error("Error fetching missions:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.post('/', protect, async (req, res) => {
    try {
        const { title, targetAmount, description, deadline } = req.body;
        const mission = new Mission({
            userId: req.user._id,
            title,
            targetAmount,
            description,
            deadline
        });
        const createdMission = await mission.save();
        res.status(201).json(createdMission);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/:id', protect, async (req, res) => {
    try {
        const mission = await Mission.findById(req.params.id);
        if (!mission) return res.status(404).json({ message: 'Mission not found' });
        if (mission.userId.toString() !== req.user._id.toString()) return res.status(401).json({ message: 'Not authorized' });

        Object.assign(mission, req.body);
        mission.updatedAt = Date.now();
        const updated = await mission.save();
        res.json(updated);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

export default router;
