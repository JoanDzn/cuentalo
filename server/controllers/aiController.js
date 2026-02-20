
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
                Extract financial data from: "${transcript}". Date: ${currentDate}.
                Return strictly JSON with fields: amount(number), currency("USD"|"VES"), type("expense"|"income"), category, description, date, rate_type("bcv"|"euro"|"usdt"|null), is_invalid(boolean).
                
                Rules:
                - Default currency: USD.
                - If "Bs", "Bolos", "Bolivares" -> currency: "VES", rate_type: "bcv".
                - If context is "ahorre", "guarde", "save", "saving" -> type: "expense", category: "Ahorro". This represents moving money OUT of disposable income INTO savings.
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
                Analyze this image of a receipt, invoice, or financial document. Date context: ${currentDate}.
                Extract the following fields and return strictly JSON:
                - amount (number)
                - currency ("USD" or "VES")
                - type ("expense" or "income") -> Infer from context (e.g. "Payment", "Total" usually expense; "Salary", "Transfer received" income)
                - category (string, short category name e.g. "Food", "Transport", "Health", "Salary", "Shopping")
                - description (string, establishment name or brief content)
                - date (string, YYYY-MM-DD format if found, otherwise null)
                - rate_type (string, "bcv"|"euro"|"usdt"|null) -> If currency is VES, try to infer rate type or null.
                
                Rules:
                - If ambiguous, assume "expense".
                - If currency symbol is "Bs" or "Bolivares", use "VES".
                - If currency is "$", use "USD".
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
