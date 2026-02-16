import { describe, it, expect } from 'vitest';
import { normalizeToUSD } from '../utils/financeUtils';
import { RateData } from '../types';

const mockRates: RateData = {
    bcv: 36.5,
    euro: 40.0,
    usdt: 38.0
};

describe('financeUtils - normalizeToUSD', () => {
    it('should normalize VES to USD correctly using BCV rate', () => {
        const amount = 365; // 365 Bs / 36.5 = 10 USD
        const result = normalizeToUSD(amount, 'VES', 'bcv', mockRates);
        expect(result.finalAmount).toBe(10);
        expect(result.rateValue).toBe(36.5);
    });

    it('should handle USD arbitrage correctly (USD at Euro rate)', () => {
        // 100 USD @ 40 (EuroRate) = 4000 Bs. 
        // 4000 Bs / 36.5 (BCV) = 109.59 USD
        const amount = 100;
        const result = normalizeToUSD(amount, 'USD', 'euro', mockRates);
        expect(result.finalAmount).toBe(109.59);
        expect(result.rateValue).toBe(40.0);
    });

    it('should return original amount for plain USD transactions', () => {
        const amount = 50;
        const result = normalizeToUSD(amount, 'USD', null, mockRates);
        expect(result.finalAmount).toBe(50);
    });
});
