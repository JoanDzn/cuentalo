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
    3. Infer type: 'expense' (spending, paying) or 'income' (earning, receiving, salary).
    4. Infer category (Food, Transport, Salary, etc.).
    5. Create a short description.
    6. Default date to today if not specified.
    
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
            type: { type: Type.STRING, enum: ["expense", "income"] }
          },
          required: ["amount", "currency", "category", "description", "date", "type"]
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from AI");

    return JSON.parse(jsonText) as ExpenseAnalysis;

  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    throw error;
  }
};