import { GoogleGenAI, Type } from "@google/genai";
import { ExpenseAnalysis } from "../types";

const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("CRITICAL: GEMINI_API_KEY is missing in .env.local");
}

const ai = new GoogleGenAI({ apiKey: apiKey });

export const parseExpenseVoiceCommand = async (transcript: string): Promise<ExpenseAnalysis> => {
  if (!apiKey) {
    throw new Error("Missing API Key. Please check your .env.local file.");
  }

  const currentDate = new Date().toISOString().split('T')[0];

  const systemInstruction = `
    You are 'cuentalo', a smart financial assistant for Venezuela. Extract transaction data from voice.
    Current Date: ${currentDate}.
    
    Rules:
    1. Extract the numeric amount.
    2. DETECT CURRENCY: 
       - If user says "bolívares", "bolos", "bs", "soberanos" -> 'VES'.
       - If user says "dólares", "verdes", "usd", "$" or no currency specified -> 'USD'.
    3. DETECT EXCHANGE RATE TYPE (rate_type):
       - If user says "a tasa bcv", "tasa oficial" or "dolar" -> 'bcv'
       - If user says "a tasa euro" or "euro" -> 'euro'
       - If user says "a tasa binance", "usdt" or "cripto" -> 'usdt'
       - If no rate mentioned, default to null (undefined) for USD, or 'bcv' for VES (unless context implies otherwise).
    4. Infer type: 'expense' (spending, paying) or 'income' (earning, receiving, salary).
    5. Infer category (Food, Transport, Salary, Ahorro, etc.).
       - SPECIAL RULE FOR SAVINGS: If user says "ahorrar", "guardar", "reserva", "fondo", "chancho", or "alcancia", set category to 'Ahorro' and type to 'expense' (since it leaves the daily wallet).
    6. Create a short description.
    7. Default date to today if not specified.
    8. VALIDATION: If the command is NOT a financial transaction (e.g. "5 harinas", "hola", "clima"), or you cannot find a price/amount, set 'is_invalid' to true.
    
    SPECIAL HANDLING FOR INCOME (Ingresos):
    - If a user says "Me pagaron 65 dólares a tasa euro" (Income, USD, rate_type='euro'), strictly capture these fields. This implies an arbitration/conversion logic will be applied by the app.
    - If a user says "Recibí 100 dólares" (no rate), rate_type should be 'bcv' or null.
    
    Examples:
    - "Pagué 2500bs una hamburguesa a tasa euro" -> amount: 2500, currency: 'VES', rate_type: 'euro', type: 'expense'
    - "Anota 1000bs de gasolina a tasa usdt" -> amount: 1000, currency: 'VES', rate_type: 'usdt', type: 'expense'
    - "Gasté 50 dólares en taxi" -> amount: 50, currency: 'USD', rate_type: 'bcv', type: 'expense'
    - "Me pagaron 65 dólares a tasa euro" -> amount: 65, currency: 'USD', rate_type: 'euro', type: 'income'
    - "Cobré 100 dólares" -> amount: 100, currency: 'USD', rate_type: 'bcv', type: 'income'
    - "Guardé 30 dólares para el viaje" -> amount: 30, currency: 'USD', category: 'Ahorro', type: 'expense', description: 'Ahorro para viaje'
    
    Output strictly JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: transcript,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER },
            currency: { type: Type.STRING, enum: ["USD", "VES"] },
            category: { type: Type.STRING },
            description: { type: Type.STRING },
            date: { type: Type.STRING },
            type: { type: Type.STRING, enum: ["expense", "income"] },
            rate_type: { type: Type.STRING, enum: ["bcv", "euro", "usdt"] },
            is_invalid: { type: Type.BOOLEAN }
          },
          required: ["amount", "currency", "category", "description", "date", "type", "rate_type", "is_invalid"]
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from AI");

    const parsed = JSON.parse(jsonText) as any;

    return parsed as ExpenseAnalysis;

  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    throw error;
  }
};