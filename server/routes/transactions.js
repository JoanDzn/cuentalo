import express from 'express';
import { transactionController } from '../controllers/transactionController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { transactionSchema } from '../schemas/transaction.schema.js';

const router = express.Router();

// GET all transactions (Sync friendly)
router.get('/', protect, transactionController.getAll);

// CREATE Transaction
router.post('/', protect, validate(transactionSchema), transactionController.create);

// UPDATE Transaction
router.put('/:id', protect, validate(transactionSchema.partial()), transactionController.update);

// DELETE Transaction (Soft Delete)
router.delete('/:id', protect, transactionController.delete);

export default router;
