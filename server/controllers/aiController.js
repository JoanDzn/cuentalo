
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Models ordered by preference — each has its own rate limit quota
const TEXT_MODELS = [
    { name: "gemini-2.0-flash", ver: "v1beta" },
    { name: "gemini-1.5-flash-latest", ver: "v1beta" },
    { name: "gemini-1.5-flash-8b-latest", ver: "v1beta" },
];

const IMAGE_MODELS = [
    { name: "gemini-2.0-flash", ver: "v1beta" },
    { name: "gemini-1.5-flash-latest", ver: "v1beta" },
    { name: "gemini-1.5-flash-8b-latest", ver: "v1beta" },
];

// Safe JSON parse from a Response — never throws
async function safeJson(response) {
    try {
        const text = await response.text();
        if (!text || text.trim() === '') return {};
        return JSON.parse(text);
    } catch {
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

// Try all available API keys for a given model+body.
// Returns { data, text } on success, throws on all-keys-rate-limited or real errors.
async function tryModelWithKeys(model, apiKeys, body) {
    let lastStatus = null;

    for (const apiKey of apiKeys) {
        try {
            const response = await callGemini(apiKey, model, body);

            if (response.status === 404) {
                throw { skip: true, message: `Model ${model.name} not found` };
            }

            if (response.status === 429) {
                lastStatus = 429;
                console.warn(`[AI] ${model.name} rate limited (key ...${apiKey.slice(-6)}), trying next key...`);
                await sleep(500); // small pause before next key
                continue;
            }

            if (!response.ok) {
                const errData = await safeJson(response);
                throw new Error(errData?.error?.message || `Error ${response.status}`);
            }

            const data = await safeJson(response);
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) throw new Error("IA no devolvió texto.");

            let parsed;
            try {
                parsed = JSON.parse(text);
            } catch {
                throw new Error("IA devolvió formato inválido.");
            }

            return parsed;

        } catch (err) {
            if (err?.skip) throw err;
            if (!err.message?.includes('rate limited')) throw err;
        }
    }

    // All keys rate-limited for this model
    if (lastStatus === 429) {
        throw { rateLimit: true, message: "rate limited" };
    }

    throw new Error("Unknown error");
}

// ─────────────────────────────────────────────────────────────────────────────

export const aiController = {
    async parseExpense(req, res) {
        try {
            const { transcript } = req.body;
            if (!transcript) return res.status(400).json({ message: "Transcript required" });

            const currentDate = new Date().toISOString().split('T')[0];

            // Collect all available API keys
            const apiKeys = [
                process.env.GEMINI_API_KEY,
                process.env.GEMINI_API_KEY_2,
            ].filter(Boolean);

            if (apiKeys.length === 0) return res.status(500).json({ message: "Missing AI Keys" });

            const prompt = `
                Extrae datos financieros de: "${transcript}". Fecha: ${currentDate}. Contexto: Venezuela.
                IMPORTANTE: category y description en ESPAÑOL.
                Return strictly JSON: amount(number), currency("USD"|"VES"), type("expense"|"income"),
                category, description, date, rate_type("bcv"|"euro"|"usdt"|null), is_invalid(boolean).
                Rules:
                - Default currency: USD.
                - Categorías: "Alimentos","Transporte","Salud","Hogar","Ocio","Sueldo","Ventas","Transferencia","Ahorro".
                - "Bs"/"Bolos"/"Bolivares" -> VES + bcv.
                - "ahorre"/"guarde" -> expense + Ahorro.
                - "salary"/"sueldo"/"ingreso" -> income.
            `;

            const body = {
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json" }
            };

            let allRateLimited = 0;
            let lastError;

            for (const model of TEXT_MODELS) {
                try {
                    console.log(`[AI] Trying ${model.name} with ${apiKeys.length} key(s)`);
                    const parsed = await tryModelWithKeys(model, apiKeys, body);
                    return res.json(parsed);
                } catch (err) {
                    if (err?.skip) { console.warn(`[AI] Skipping ${model.name}`); continue; }
                    if (err?.rateLimit) {
                        allRateLimited++;
                        lastError = new Error("La IA está muy solicitada, intenta en unos segundos.");
                        await sleep(1000);
                        continue;
                    }
                    lastError = new Error(err.message);
                    console.error(`[AI] ${model.name} error:`, err.message);
                }
            }

            if (allRateLimited === TEXT_MODELS.length) {
                return res.status(429).json({ message: "La IA está muy solicitada en este momento. Espera unos segundos e intenta de nuevo." });
            }

            throw new Error(lastError?.message || "No se pudo conectar con la IA.");

        } catch (error) {
            console.error("[AI] Error:", error);
            res.status(500).json({ message: error.message || "Error procesando el comando de voz" });
        }
    },

    async analyzeImage(req, res) {
        try {
            const { image } = req.body;
            if (!image) return res.status(400).json({ message: "Image required" });

            const currentDate = new Date().toISOString().split('T')[0];

            const apiKeys = [
                process.env.GEMINI_API_KEY,
                process.env.GEMINI_API_KEY_2,
            ].filter(Boolean);

            if (apiKeys.length === 0) return res.status(500).json({ message: "Missing AI Keys" });

            const cleanBase64 = image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

            const prompt = `
                Analiza este recibo o documento financiero. Fecha: ${currentDate}. Contexto: Venezuela.
                IMPORTANTE: category y description en ESPAÑOL.
                JSON estricto: amount(number), currency("USD"|"VES"), type("expense"|"income"),
                category, description, date(YYYY-MM-DD|null), rate_type("bcv"|"euro"|"usdt"|null).
                Si ambiguo -> expense. "Bs"/"Bolívares" -> VES. "$" -> USD.
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

            let allRateLimited = 0;
            let lastError;

            for (const model of IMAGE_MODELS) {
                try {
                    console.log(`[AI-Image] Trying ${model.name} with ${apiKeys.length} key(s)`);
                    const parsed = await tryModelWithKeys(model, apiKeys, body);
                    return res.json(parsed);
                } catch (err) {
                    if (err?.skip) { console.warn(`[AI-Image] Skipping ${model.name}`); continue; }
                    if (err?.rateLimit) {
                        allRateLimited++;
                        lastError = new Error("La IA está muy solicitada, intenta en unos segundos.");
                        await sleep(1000);
                        continue;
                    }
                    lastError = new Error(err.message);
                    console.error(`[AI-Image] ${model.name} error:`, err.message);
                }
            }

            if (allRateLimited === IMAGE_MODELS.length) {
                return res.status(429).json({ message: "La IA está muy solicitada en este momento. Espera unos segundos e intenta de nuevo." });
            }

            throw new Error(lastError?.message || "No se pudo analizar la imagen.");

        } catch (error) {
            console.error("[AI-Image] Error:", error);
            res.status(500).json({ message: error.message || "Error analyzing image" });
        }
    }
};
