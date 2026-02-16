import NodeCache from 'node-cache';

// Cache for 10 minutes (600 seconds)
const rateCache = new NodeCache({ stdTTL: 600 });

const FETCH_INTERVAL = 10 * 60 * 1000; // 10 minutes

export const rateService = {
    async getRates() {
        const cachedRates = rateCache.get('exchange_rates');
        if (cachedRates) {
            console.log("Serving rates from backend cache");
            return cachedRates;
        }

        try {
            console.log("Fetching fresh rates from DolarApi...");
            const bcvRes = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
            const bcvData = await bcvRes.json();

            const paraRes = await fetch('https://ve.dolarapi.com/v1/dolares/paralelo');
            const paraData = await paraRes.json();

            const bcvPrice = bcvData.promedio || 341.74;

            const rates = {
                bcv: bcvPrice,
                euro: Number((bcvPrice * 1.156).toFixed(2)),
                usdt: paraData.promedio || 500.0,
                updatedAt: new Date()
            };

            rateCache.set('exchange_rates', rates);
            return rates;
        } catch (error) {
            console.error('Error fetching exchange rates in backend:', error);
            // Return defaults if API is down
            return {
                bcv: 341.74,
                euro: 395.0,
                usdt: 500.0,
                updatedAt: new Date(),
                isFallback: true
            };
        }
    }
};
