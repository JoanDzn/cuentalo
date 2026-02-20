
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Models ordered by priority — using standard names
const TEXT_MODELS = [
    { name: "gemini-2.5-flash", ver: "v1beta" },
    { name: "gemini-1.5-flash-8b", ver: "v1beta" },
    { name: "gemini-1.5-flash", ver: "v1beta" },
    { name: "gemini-2.0-flash", ver: "v1beta" },
    { name: "gemini-1.5-pro", ver: "v1beta" },
];

const IMAGE_MODELS = [
    { name: "gemini-1.5-flash-8b", ver: "v1beta" },
    { name: "gemini-1.5-flash", ver: "v1beta" },
    { name: "gemini-2.0-flash", ver: "v1beta" },
    { name: "gemini-1.5-pro", ver: "v1beta" },
];

// Safe JSON parse from a Response — never throws, logs error details
async function safeJson(response) {
    const text = await response.text();
    try {
        if (!text || text.trim() === '') return {};
        return JSON.parse(text);
    } catch (e) {
        console.warn(`[AI] Failed to parse JSON. Raw body: ${text.substring(0, 200)}`);
        return {};
    }
}

// Try a single model+key combination
async function callGemini(apiKey, model, body) {
    const url = `https://generativelanguage.googleapis.com/${model.ver}/models/${model.name}:generateContent?key=${apiKey}`;
    return fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });
}

async function tryModelWithKeys(model, apiKeys, body) {
    let lastStatus = null;
    let lastErrorMessage = "";

    for (const apiKey of apiKeys) {
        try {
            const response = await callGemini(apiKey, model, body);
            lastStatus = response.status;

            if (response.status === 404) {
                console.warn(`[AI] Model ${model.name} returned 404`);
                throw { skip: true };
            }

            if (response.status === 429) {
                const errData = await safeJson(response);
                lastErrorMessage = errData?.error?.message || "Rate limit reached";
                console.warn(`[AI] ${model.name} 429 (Key ...${apiKey.slice(-5)}): ${lastErrorMessage}`);
                await sleep(1000); // Wait 1s between keys to avoid burst limits
                continue;
            }

            if (!response.ok) {
                const errData = await safeJson(response);
                const msg = errData?.error?.message || `HTTP ${response.status}`;
                console.error(`[AI] ${model.name} Error: ${msg}`);
                throw new Error(msg);
            }

            const data = await safeJson(response);
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) throw new Error("La IA no devolvió ninguna respuesta (candidatos vacíos).");

            return JSON.parse(text);

        } catch (err) {
            if (err?.skip) throw err;
            if (lastStatus === 429) continue;
            throw err;
        }
    }

    if (lastStatus === 429) {
        throw { rateLimit: true, message: lastErrorMessage };
    }

    throw new Error("No se pudo obtener respuesta de ningún modelo con las llaves proporcionadas.");
}

export const aiController = {
    async parseExpense(req, res) {
        try {
            const { transcript } = req.body;
            if (!transcript) return res.status(400).json({ message: "No se proporcionó texto para analizar." });

            const currentDate = new Date().toISOString().split('T')[0];
            const apiKeys = [process.env.GEMINI_API_KEY, process.env.GEMINI_API_KEY_2].filter(Boolean);

            if (apiKeys.length === 0) return res.status(500).json({ message: "No hay llaves de API configuradas en el servidor." });

            const prompt = `
                Analiza: "${transcript}". Fecha hoy: ${currentDate}. Contexto: Venezuela. 
                Extrae datos en JSON estricto con:
                - amount (number)
                - currency ("USD" o "VES")
                - type ("expense" o "income")
                - category (En ESPAÑOL: "Alimentos", "Transporte", "Ocio", "Hogar", "Salud", "Sueldo", "Ventas", "Otros")
                - description (En ESPAÑOL)
                - date (YYYY-MM-DD)
                - rate_type ("bcv", "euro", "usdt" o null)
                - is_invalid (boolean, true si no es un gasto o ingreso)

                REGLAS:
                - Si dice "Bolívares", "Bs", "Bolos" -> VES + bcv.
                - Por defecto USD.
                - Categoría "Ahorro" si menciona ahorrar o guardar.
            `;

            const body = {
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json" }
            };

            let lastError;
            let totalModelsTried = 0;

            for (const model of TEXT_MODELS) {
                try {
                    totalModelsTried++;
                    const parsed = await tryModelWithKeys(model, apiKeys, body);
                    return res.json(parsed);
                } catch (err) {
                    if (err?.skip) continue;
                    lastError = err;
                    if (err?.rateLimit) continue;
                    // If it's a real error (not rate limit or 404), maybe try next model anyway
                    console.error(`[AI] Skipping ${model.name} due to unexpected error: ${err.message}`);
                }
            }

            if (lastError?.rateLimit) {
                return res.status(429).json({ message: "Límite de solicitudes alcanzado en todos los modelos. Por favor espera 1 minuto." });
            }

            throw new Error(lastError?.message || "No se pudo procesar la solicitud.");

        } catch (error) {
            console.error("[AI] Error Crítico:", error);
            res.status(500).json({ message: error.message });
        }
    },

    async analyzeImage(req, res) {
        try {
            const { image } = req.body;
            if (!image) return res.status(400).json({ message: "No se proporcionó imagen." });

            const currentDate = new Date().toISOString().split('T')[0];
            const apiKeys = [process.env.GEMINI_API_KEY, process.env.GEMINI_API_KEY_2].filter(Boolean);
            if (apiKeys.length === 0) return res.status(500).json({ message: "Laves de API faltantes." });

            const cleanBase64 = image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

            const prompt = `
                Analiza esta imagen financiera (recibo/pago). Fecha: ${currentDate}. Contexto: Venezuela. 
                Extrae datos en JSON estricto con:
                - amount (number)
                - currency ("USD" o "VES")
                - type ("expense" o "income")
                - category (En ESPAÑOL)
                - description (En ESPAÑOL)
                - date (YYYY-MM-DD o null)
                - rate_type ("bcv", "euro", "usdt" o null)

                REGLAS:
                - "Bolívares"/"Bs" -> VES.
                - "$" -> USD.
            `;

            const body = {
                contents: [{
                    parts: [
                        { text: prompt },
                        { inline_data: { mime_type: "image/jpeg", data: cleanBase64 } }
                    ]
                }],
                generationConfig: { responseMimeType: "application/json" }
            };

            let lastError;
            for (const model of IMAGE_MODELS) {
                try {
                    const parsed = await tryModelWithKeys(model, apiKeys, body);
                    return res.json(parsed);
                } catch (err) {
                    if (err?.skip) continue;
                    lastError = err;
                    if (err?.rateLimit) continue;
                }
            }

            if (lastError?.rateLimit) {
                return res.status(429).json({ message: "Límite de IA alcanzado. Reintenta en 1 minuto." });
            }
            throw new Error(lastError?.message || "Error al analizar imagen.");

        } catch (error) {
            console.error("[AI-Image] Error Crítico:", error);
            res.status(500).json({ message: error.message });
        }
    }
};
