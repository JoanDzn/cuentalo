
const MODEL_CANDIDATES = [
    { name: "gemini-2.5-flash", ver: "v1beta" },
    { name: "gemini-2.0-flash", ver: "v1beta" },
    { name: "gemini-1.5-flash", ver: "v1beta" },
    { name: "gemini-pro-vision", ver: "v1" }
];

// Cooldown: evita llamar a Gemini mientras estamos penalizados
let rateLimitUntil = 0;

function checkRateLimit() {
    if (Date.now() < rateLimitUntil) {
        const secsLeft = Math.ceil((rateLimitUntil - Date.now()) / 1000);
        throw new Error(`Muchas peticiones, espera ${secsLeft} segundos`);
    }
}

function setRateLimit(seconds) {
    const secs = typeof seconds === 'number' ? seconds : 60;
    rateLimitUntil = Date.now() + secs * 1000;
    console.log(`[AI] Rate limited for ${secs}s`);
}

export const aiController = {
    // Process Voice Command
    async parseExpense(req, res) {
        try {
            const { transcript } = req.body;
            if (!transcript) return res.status(400).json({ message: "Transcript required" });

            const currentDate = new Date().toISOString().split('T')[0];
            const apiKey = process.env.GEMINI_API_KEY;

            if (!apiKey) {
                console.error("GEMINI_API_KEY is missing on server");
                return res.status(500).json({ message: "Server configuration error: Missing AI Key" });
            }

            const prompt = `
                Extrae datos financieros de: "${transcript}". Fecha: ${currentDate}. Contexto: Venezuela.
                IMPORTANTE: Todo el texto generado (category y description) debe estar en ESPAÑOL.
                Return strictly JSON with fields: amount(number), currency("USD"|"VES"), type("expense"|"income"), category, description, date, rate_type("bcv"|"euro"|"usdt"|null), is_invalid(boolean).
                
                Rules:
                - Default currency: USD.
                - Categorías sugeridas: "Alimentos", "Transporte", "Salud", "Hogar", "Ocio", "Sueldo", "Ventas", "Transferencia", "Ahorro".
                - If "Bs", "Bolos", "Bolivares" -> currency: "VES", rate_type: "bcv".
                - If context is "ahorre", "guarde", "save", "saving" -> type: "expense", category: "Ahorro".
                - If context is "salary", "sueldo", "ingreso" -> type: "income".
            `;

            let lastError;

            // Block if still in cooldown - no API call needed
            checkRateLimit();

            for (const model of MODEL_CANDIDATES) {
                try {
                    console.log(`[AI] Attempting Gemini: ${model.name}`);

                    const response = await fetch(
                        `https://generativelanguage.googleapis.com/${model.ver}/models/${model.name}:generateContent?key=${apiKey}`,
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                contents: [{ parts: [{ text: prompt }] }],
                                ...(model.ver !== "v1" ? { generationConfig: { responseMimeType: "application/json" } } : {})
                            })
                        }
                    );

                    if (response.status === 404) continue;

                    if (response.status === 429) {
                        const errData = await response.json();
                        let waitSecs = errData.error?.message?.match(/(\d+\.?\d*)s/)?.[1];
                        waitSecs = waitSecs ? Math.ceil(parseFloat(waitSecs)) : 60;
                        setRateLimit(waitSecs);
                        throw new Error(`Muchas peticiones, espera ${waitSecs} segundos`);
                    }

                    if (!response.ok) {
                        const errData = await response.json();
                        throw new Error(errData.error?.message || `Error ${response.status}`);
                    }

                    const data = await response.json();
                    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

                    if (!text) throw new Error("IA no devolvió texto.");

                    const parsed = JSON.parse(text);
                    return res.json(parsed);

                } catch (error) {
                    console.error(`[AI] Failure with ${model.name}:`, error.message);
                    lastError = error;
                    if (error.message.includes("Muchas peticiones")) throw error;
                }
            }

            throw new Error(lastError?.message || "No se pudo conectar con la IA después de varios intentos.");

        } catch (error) {
            console.error("[AI] Critical Error:", error);
            res.status(500).json({ message: error.message || "Error procesando el comando de voz" });
        }
    },

    // Process Image Analysis
    async analyzeImage(req, res) {
        try {
            const { image } = req.body; // Base64 string
            if (!image) return res.status(400).json({ message: "Image required" });

            const currentDate = new Date().toISOString().split('T')[0];
            const apiKey = process.env.GEMINI_API_KEY;

            if (!apiKey) return res.status(500).json({ message: "Server AI Key missing" });

            // Remove data:image/...;base64, prefix if present
            const cleanBase64 = image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

            const prompt = `
                Analiza esta imagen de un recibo, factura o documento financiero. Fecha: ${currentDate}. Contexto: Venezuela.
                IMPORTANTE: Todos los campos de texto (category y description) deben estar estrictamente en ESPAÑOL.
                Extrae los siguientes campos y devuelve estrictamente JSON:
                - amount (number)
                - currency ("USD" o "VES")
                - type ("expense" o "income") -> Inferir del contexto.
                - category (string, nombre corto de categoría en ESPAÑOL e.g. "Alimentos", "Transporte", "Salud", "Sueldo", "Compras", "Hogar")
                - description (string, nombre del establecimiento o contenido breve en ESPAÑOL)
                - date (string, formato YYYY-MM-DD si se encuentra, de lo contrario null)
                - rate_type (string, "bcv"|"euro"|"usdt"|null) -> Si la moneda es VES, intenta inferir el tipo o null.
                
                Rules:
                - Si es ambiguo, asume "expense".
                - Si el símbolo es "Bs" o "Bolívares", usa "VES".
                - Si el símbolo es "$", usa "USD".
            `;

            let lastError;
            checkRateLimit();
            for (const model of MODEL_CANDIDATES) {
                try {
                    const response = await fetch(
                        `https://generativelanguage.googleapis.com/${model.ver}/models/${model.name}:generateContent?key=${apiKey}`,
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                contents: [{
                                    parts: [
                                        { text: prompt },
                                        { inline_data: { mime_type: "image/jpeg", data: cleanBase64 } }
                                    ]
                                }],
                                ...(model.ver !== "v1" ? { generationConfig: { responseMimeType: "application/json" } } : {})
                            })
                        }
                    );

                    if (response.status === 404) continue;

                    if (response.status === 429) {
                        const errData = await response.json();
                        let waitSecs = errData.error?.message?.match(/(\d+\.?\d*)s/)?.[1];
                        waitSecs = waitSecs ? Math.ceil(parseFloat(waitSecs)) : 60;
                        setRateLimit(waitSecs);
                        throw new Error(`Muchas peticiones, espera ${waitSecs} segundos`);
                    }

                    if (!response.ok) {
                        const err = await response.json();
                        console.error(`[AI-Image] Error ${model.name}:`, err);
                        continue;
                    }

                    const data = await response.json();
                    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (!text) continue;

                    const parsed = JSON.parse(text);
                    return res.json(parsed);

                } catch (e) {
                    console.error(`[AI-Image] Failed ${model.name}:`, e.message);
                    lastError = e;
                    if (e.message.includes("Muchas peticiones")) throw e;
                }
            }
            throw new Error(lastError?.message || "Could not analyze image with any model.");

        } catch (error) {
            console.error("[AI-Image] Error:", error);
            res.status(500).json({ message: error.message || "Error analyzing image" });
        }
    }
};
