import { z } from 'zod';

export const transactionSchema = z.object({
    amount: z.number().positive("El monto debe ser positivo"),
    description: z.string().min(1, "La descripción es requerida").max(100, "La descripción es muy larga").trim(),
    category: z.string().min(1, "La categoría es requerida"),
    date: z.string().optional(),
    type: z.enum(['expense', 'income'], "El tipo debe ser 'expense' o 'income'"),
    originalAmount: z.number().positive().optional(),
    originalCurrency: z.enum(['USD', 'VES']).optional(),
    rateType: z.enum(['bcv', 'euro', 'usdt']).nullable().optional(),
    rateValue: z.number().positive().optional()
});
