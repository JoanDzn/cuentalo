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
        // Add Authorization if needed, though voice commands might be public or protected?
        // Usually protected. Let's add auth header if token exists.
        ...(localStorage.getItem('jwt_token') ? { 'Authorization': `Bearer ${localStorage.getItem('jwt_token')}` } : {})
      },
      body: JSON.stringify({ transcript })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Error procesando comando");
    }

    const data = await response.json();
    return data as ExpenseAnalysis;

  } catch (error: any) {
    console.error("AI Service Error:", error);
    throw new Error(error.message || "No se pudo conectar con el servidor de IA.");
  }
};