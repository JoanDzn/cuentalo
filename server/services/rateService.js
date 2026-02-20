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

            const bcvPrice = bcvData.promedio || 396.37; // Updated fallback

            const rates = {
                bcv: bcvPrice,
                euro: euroData.promedio || 470.28,
                usdt: paraData.promedio || 538.00, // Using Parallel as proxy for USDT
                updatedAt: new Date()
            };

            rateCache.set('exchange_rates', rates);
            return rates;
        } catch (error) {
            console.error('Error fetching exchange rates in backend:', error);
            // Return defaults if API is down
            return {
                bcv: 396.37,
                euro: 470.28,
                usdt: 538.00,
                updatedAt: new Date(),
                isFallback: true
            };
        }
    }
};
