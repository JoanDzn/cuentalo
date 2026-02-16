import { RateType, RateData } from '../types';

// Cache for rates to avoid excessive API calls
let ratesCache: RateData | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetches all exchange rates from DolarApi.com and other sources
 */
/**
 * Fetches all exchange rates from the backend cache
 */
const fetchAllRates = async (): Promise<RateData> => {
    try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const res = await fetch(`${apiUrl}/api/rates`);
        if (!res.ok) throw new Error('Failed to fetch backend rates');
        const data = await res.json();

        return {
            bcv: data.bcv,
            euro: data.euro,
            usdt: data.usdt,
        };
    } catch (error) {
        console.error('Error fetching exchange rates from backend:', error);
        // Fallback rates based on actual context (Feb 2026)
        return {
            bcv: 341.74,
            euro: 395.0,
            usdt: 500.0,
        };
    }
};

/**
 * Gets all current exchange rates (with caching)
 */
export const getAllRates = async (): Promise<RateData> => {
    const now = Date.now();

    // Return cached rates if still valid
    if (ratesCache && (now - lastFetchTime) < CACHE_DURATION) {
        return ratesCache;
    }

    // Fetch fresh rates
    ratesCache = await fetchAllRates();
    lastFetchTime = now;

    return ratesCache;
};

/**
 * Gets the exchange rate value for a specific rate type
 */
export const getRateValue = async (rateType: RateType): Promise<number> => {
    if (!rateType) {
        // Default to BCV if no rate type specified
        const rates = await getAllRates();
        return rates.bcv;
    }

    const rates = await getAllRates();
    return rates[rateType];
};

/**
 * React hook for accessing exchange rates
 */
export const useExchangeRates = () => {
    const [rates, setRates] = React.useState<RateData | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const loadRates = async () => {
            setLoading(true);
            const freshRates = await getAllRates();
            setRates(freshRates);
            setLoading(false);
        };

        loadRates();

        // Refresh rates every 5 minutes
        const interval = setInterval(loadRates, CACHE_DURATION);

        return () => clearInterval(interval);
    }, []);

    return { rates, loading };
};
// For non-React usage
import React from 'react';

