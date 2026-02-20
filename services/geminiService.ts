
import { ExpenseAnalysis } from "../types";

// Backend API URL
const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, '');
const API_URL = `${BASE_URL}/api`;

export const parseExpenseVoiceCommand = async (transcript: string): Promise<ExpenseAnalysis> => {
  try {
    const response = await fetch(`${API_URL}/ai/parse`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(localStorage.getItem('jwt_token') ? { 'Authorization': `Bearer ${localStorage.getItem('jwt_token')}` } : {})
      },
      body: JSON.stringify({ transcript })
    });

    if (response.status === 429) {
      throw new Error("La IA está muy solicitada, espera unos segundos e intenta de nuevo.");
    }

    if (!response.ok) {
      let errMsg = "Error procesando comando";
      try { const err = await response.json(); errMsg = err.message || errMsg; } catch { }
      throw new Error(errMsg);
    }

    const data = await response.json();
    return data as ExpenseAnalysis;

  } catch (error: any) {
    console.error("AI Service Error:", error);
    throw new Error(error.message || "No se pudo conectar con el servidor de IA.");
  }
};

export const analyzeReceiptImage = async (imageBase64: string): Promise<ExpenseAnalysis> => {
  try {
    const response = await fetch(`${API_URL}/ai/analyze-image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(localStorage.getItem('jwt_token') ? { 'Authorization': `Bearer ${localStorage.getItem('jwt_token')}` } : {})
      },
      body: JSON.stringify({ image: imageBase64 })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Error analizando imagen");
    }

    const data = await response.json();
    return data as ExpenseAnalysis;

  } catch (error: any) {
    console.error("AI Image Analysis Error:", error);
    throw new Error(error.message || "No se pudo analizar la imagen.");
  }
};