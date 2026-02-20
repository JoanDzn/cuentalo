
import fs from 'fs';
import path from 'path';

console.log("[AI] Loading aiController.js - Version 2.0");

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Models ordered by priority — using confirmed available names
const TEXT_MODELS = [
    { name: "gemini-2.5-flash", ver: "v1beta" },
    { name: "gemini-2.0-flash", ver: "v1beta" },
    { name: "gemini-1.5-flash-8b", ver: "v1beta" },
    { name: "gemini-flash-latest", ver: "v1beta" },
];

const IMAGE_MODELS = [
    { name: "gemini-2.5-flash", ver: "v1beta" },
    { name: "gemini-2.0-flash", ver: "v1beta" },
    { name: "gemini-flash-latest", ver: "v1beta" },
];

// Safe JSON parse from a Response
async function safeJson(response) {
    try {
        const text = await response.text();
        if (!text || text.trim() === '') return {};
        const clean = text.replace(/```json\n?|\n?```/g, '').trim();
        return JSON.parse(clean);
    } catch (e) {
        return {};
    }
}

// Try a single model+key combination with timeout
async function callGemini(apiKey, model, body, timeoutMs = 8000) {
    const url = `https://generativelanguage.googleapis.com/${model.ver}/models/${model.name}:generateContent?key=${apiKey}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

async function tryModelWithKeys(model, apiKeys, body) {
    let lastStatus = null;
    let lastErrorMessage = "";

    for (const apiKey of apiKeys) {
        try {
            // Set 8s timeout to avoid long hangs
            const response = await callGemini(apiKey, model, body, 8000);
            lastStatus = response.status;

            if (response.status === 404) {
                throw { skip: true, message: "Model not found" };
            }

            if (response.status === 429) {
                const errData = await safeJson(response);
                lastErrorMessage = errData?.error?.message || "Rate limit reached";
                console.warn(`[AI] ${model.name} 429: ${lastErrorMessage}`);
                await sleep(500);
                continue;
            }

            if (!response.ok) {
                const errData = await safeJson(response);
                const msg = errData?.error?.message || `HTTP ${response.status}`;
                throw new Error(msg);
            }

            const data = await safeJson(response);
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) throw new Error("La IA no devolvió ninguna respuesta.");

            const clean = text.replace(/```json\n?|\n?```/g, '').trim();
            return JSON.parse(clean);

        } catch (err) {
            if (err.name === 'AbortError') {
                console.warn(`[AI] ${model.name} timed out after 8s`);
                continue;
            }
            if (err?.skip) throw err;
            if (lastStatus === 429) continue;
            throw err;
        }
    }

    if (lastStatus === 429) {
        throw { rateLimit: true, message: lastErrorMessage };
    }

    throw new Error("No se pudo obtener una respuesta rápida.");
}

export const aiController = {
    async parseExpense(req, res) {
        try {
            const { transcript } = req.body;
            if (!transcript) return res.status(400).json({ message: "No se proporcionó texto." });

            const currentDate = new Date().toISOString().split('T')[0];
            const apiKeys = [process.env.GEMINI_API_KEY, process.env.GEMINI_API_KEY_2].filter(Boolean);

            if (apiKeys.length === 0) return res.status(500).json({ message: "No hay llaves de API." });

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
                - is_invalid (boolean)
            `;

            const body = {
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json" }
            };

            const isVercel = process.env.VERCEL || process.env.NODE_ENV === 'production';
            const log = (msg) => {
                const line = `[${new Date().toISOString()}] [PARSER] ${msg}`;
                console.log(line);
                if (!isVercel) {
                    try {
                        const logFile = path.resolve(process.cwd(), 'logs', 'ai_debug.log');
                        if (!fs.existsSync(path.dirname(logFile))) fs.mkdirSync(path.dirname(logFile), { recursive: true });
                        fs.appendFileSync(logFile, line + '\n');
                    } catch (e) { }
                }
            };

            log(`Transcript: "${transcript}"`);

            let lastError;
            for (const model of TEXT_MODELS) {
                try {
                    log(`Trying: ${model.name}`);
                    const parsed = await tryModelWithKeys(model, apiKeys, body);
                    log(`Success: ${model.name}`);
                    return res.json(parsed);
                } catch (err) {
                    log(`Error ${model.name}: ${err.message}`);
                    if (err?.skip) continue;
                    lastError = err;
                    if (err?.rateLimit) continue;
                }
            }

            if (lastError?.rateLimit) {
                return res.status(429).json({ message: lastError.message });
            }
            throw new Error(lastError?.message || "Error final de IA.");

        } catch (error) {
            console.error("[AI-Parser] Error:", error);
            res.status(500).json({ message: error.message });
        }
    },

    async analyzeImage(req, res) {
        try {
            const { image } = req.body;
            if (!image) return res.status(400).json({ message: "No se proporcionó imagen." });

            const currentDate = new Date().toISOString().split('T')[0];
            const apiKeys = [process.env.GEMINI_API_KEY, process.env.GEMINI_API_KEY_2].filter(Boolean);
            if (apiKeys.length === 0) return res.status(500).json({ message: "No hay llaves de API." });

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

            const isVercel = process.env.VERCEL || process.env.NODE_ENV === 'production';
            const log = (msg) => {
                const line = `[${new Date().toISOString()}] [IMAGE] ${msg}`;
                console.log(line);
                if (!isVercel) {
                    try {
                        const logFile = path.resolve(process.cwd(), 'logs', 'ai_debug.log');
                        if (!fs.existsSync(path.dirname(logFile))) fs.mkdirSync(path.dirname(logFile), { recursive: true });
                        fs.appendFileSync(logFile, line + '\n');
                    } catch (e) { }
                }
            };

            log(`Analyzing image...`);

            let lastError;
            for (const model of IMAGE_MODELS) {
                try {
                    log(`Trying: ${model.name}`);
                    const parsed = await tryModelWithKeys(model, apiKeys, body);
                    log(`Success: ${model.name}`);
                    return res.json(parsed);
                } catch (err) {
                    log(`Error ${model.name}: ${err.message}`);
                    if (err?.skip) continue;
                    lastError = err;
                    if (err?.rateLimit) continue;
                }
            }

            if (lastError?.rateLimit) {
                return res.status(429).json({ message: lastError.message });
            }
            throw new Error(lastError?.message || "Error final de imagen.");

        } catch (error) {
            console.error("[AI-Image] Error:", error);
            res.status(500).json({ message: error.message });
        }
    }
};
