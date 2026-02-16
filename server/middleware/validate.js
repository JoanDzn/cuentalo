import { z } from 'zod';

export const validate = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    } catch (e) {
        if (e instanceof z.ZodError) {
            return res.status(400).json({
                message: 'Error de validación',
                errors: e.errors.map(err => ({
                    field: err.path.join('.'),
                    error: err.message
                }))
            });
        }
        res.status(500).json({ message: 'Error interno de validación' });
    }
};
