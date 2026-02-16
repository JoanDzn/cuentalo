import { ExpenseAnalysis } from "../types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyAdjpA8Aq-jauu5idCNNQiSDTwrCZcH8S4";

/**
 * Procesa el comando usando los modelos más actuales (gemini-2.5-flash) detectados.
 */
export const parseExpenseVoiceCommand = async (transcript: string): Promise<ExpenseAnalysis> => {
  const currentDate = new Date().toISOString().split('T')[0];

  // Según el listado exhaustivo (Feb 2026), estos son los mejores modelos disponibles
  const MODEL_CANDIDATES = [
    { name: "gemini-2.5-flash", ver: "v1beta" },
    { name: "gemini-flash-latest", ver: "v1beta" },
    { name: "gemini-2.0-flash-lite", ver: "v1beta" },
    { name: "gemini-pro-latest", ver: "v1beta" }
  ];

  const prompt = `
    Extract financial data from: "${transcript}". Date: ${currentDate}.
    Return strictly JSON with fields: amount(number), currency("USD"|"VES"), type("expense"|"income"), category, description, date, rate_type("bcv"|"euro"|"usdt"|null), is_invalid(boolean).
    
    Rules:
    - Default currency: USD.
    - If "Bs", "Bolos", "Bolivares" -> currency: "VES", rate_type: "bcv".
  `;

  let lastError: any;

  for (const model of MODEL_CANDIDATES) {
    try {
      console.log(`Attempting Gemini: ${model.name}`);

      const response = await fetch(
        `https://generativelanguage.googleapis.com/${model.ver}/models/${model.name}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: "application/json"
            }
          })
        }
      );

      if (response.status === 404) continue;

      if (response.status === 429) {
        const errData = await response.json();
        const waitSecs = errData.error?.message?.match(/(\d+\.\d+)s/)?.[1] || "algunos";
        throw new Error(`CUOTA EXCEDIDA: Por favor espera ${waitSecs} segundos e intenta de nuevo.`);
      }

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || `Error ${response.status}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) throw new Error("IA no devolvió texto.");
      return JSON.parse(text) as ExpenseAnalysis;

    } catch (error: any) {
      console.error(`Failure with ${model.name}:`, error.message);
      lastError = error;
      // Si es un error de cuota, lanzamos el error para que el usuario lo vea y espere
      if (error.message.includes("CUOTA")) throw error;
    }
  }

  throw new Error(lastError?.message || "No se pudo conectar con la IA después de varios intentos.");
};