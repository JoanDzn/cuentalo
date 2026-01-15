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
    1. Extract the numeric amount in its ORIGINAL currency (NO conversion). Ej: "100 bs" -> amount: 100, currency: 'VES'.
    2. DETECT CURRENCY: 
       - If user says "bolívares", "bolos", "bs", "soberanos" -> 'VES'.
       - If user says "dólares", "verdes", "usd", "$" or no currency specified -> 'USD'.
    3. DETECT EXCHANGE RATE TYPE (rate_type):
       - If user says "a tasa bcv" or "tasa oficial" -> 'bcv'
       - If user says "a tasa euro" -> 'euro'
       - If user says "a tasa binance" or "usdt" or "cripto" -> 'usdt'
       - If no rate mentioned -> null
    4. Infer type: 'expense' (spending, paying) or 'income' (earning, receiving, salary).
    5. Infer category (Food, Transport, Salary, etc.).
    6. Create a short description.
    7. Default date to today if not specified.
    8. VALIDATION: If the command is NOT a financial transaction (e.g. "5 harinas", "hola", "clima"), or you cannot find a price/amount, set 'is_invalid' to true.
    
    Examples:
    - "Pagué 2500bs una hamburguesa a tasa euro" -> amount: 2500, is_invalid: false
    - "Anota 1000bs de gasolina a tasa usdt" -> amount: 1000, is_invalid: false
    - "Gasté 50 dólares en taxi" -> amount: 50, is_invalid: false
    - "5 harinas" -> is_invalid: true
    - "Hoy es un día soleado" -> is_invalid: true
    
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
            rate_type: { type: Type.STRING, enum: ["bcv", "euro", "usdt", "null"], nullable: true },
            is_invalid: { type: Type.BOOLEAN }
          },
          required: ["amount", "currency", "category", "description", "date", "type", "is_invalid"]
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from AI");

    const parsed = JSON.parse(jsonText) as any;

    // Convert "null" string to actual null for rate_type
    if (parsed.rate_type === 'null' || !parsed.rate_type) {
      parsed.rate_type = null;
    }

    return parsed as ExpenseAnalysis;

  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    throw error;
  }
};