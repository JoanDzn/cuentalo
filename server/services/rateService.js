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
            // Use Promise.all for parallel fetching
            const [bcvRes, paraRes, euroRes] = await Promise.all([
                fetch('https://ve.dolarapi.com/v1/dolares/oficial'),
                fetch('https://ve.dolarapi.com/v1/dolares/paralelo'),
                fetch('https://ve.dolarapi.com/v1/euros/oficial')
            ]);

            const bcvData = await bcvRes.json();
            const paraData = await paraRes.json();
            const euroData = await euroRes.json();

            const bcvPrice = bcvData.promedio || 341.74; // Fallback should be updated if possible

            const rates = {
                bcv: bcvPrice,
                euro: euroData.promedio || (bcvPrice * 1.05), // Better fallback
                usdt: paraData.promedio || (bcvPrice * 1.1),
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
