import { Currency, RateType, RateData } from '../types';

/**
 * Normaliza un monto a USD basado en la tasa BCV
 */
export const normalizeToUSD = (
    amount: number,
    currency: Currency,
    rateType: RateType,
    rates: RateData
): { finalAmount: number; rateValue: number } => {
    if (currency === 'VES') {
        const bcvRate = rates.bcv;
        return {
            finalAmount: Number((amount / bcvRate).toFixed(2)),
            rateValue: bcvRate
        };
    }

    // Arbitraje: USD con tasa especial (euro/usdt)
    if (currency === 'USD' && rateType && rateType !== 'bcv') {
        const specialRate = rates[rateType as keyof RateData] || rates.bcv;
        const vesValue = amount * specialRate;
        const bcvRate = rates.bcv;

        return {
            finalAmount: Number((vesValue / bcvRate).toFixed(2)),
            rateValue: specialRate
        };
    }

    // Default USD strictly
    return {
        finalAmount: amount,
        rateValue: rates.bcv
    };
};
