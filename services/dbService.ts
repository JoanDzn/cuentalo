/**
 * API Service (Persistent Database)
 * Replaces old localStorage with real API calls to backend
 */

import { Transaction, SavingsMission, RecurringTransaction, UserSettings } from '../types';
import { authService } from './authService';

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, '');
const API_URL = `${BASE_URL}/api`;

interface UserData {
  transactions: Transaction[];
  savingsMissions: SavingsMission[];
  recurringTransactions: RecurringTransaction[];
  settings?: UserSettings;
}

const getHeaders = () => {
  const token = localStorage.getItem('jwt_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Start Helper: Authenticated Fetch with Retry
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  // First attempt
  let response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers
    }
  });

  // If 401, try refreshing token
  if (response.status === 401) {
    console.warn("Access token expired, attempting refresh...");
    const newToken = await authService.refreshAccessToken();

    if (newToken) {
      // Retry with new token
      console.log("Token refreshed, retrying request...");
      response = await fetch(url, {
        ...options,
        headers: {
          ...getHeaders(), // New token will be picked up here
          ...options.headers
        }
      });
    } else {
      console.warn("Refresh failed or no refresh token available.");
      // Let the caller handle the persistent 401 (likely logout)
    }
  }

  return response;
};
// End Helper

// Check if token exists
const hasToken = () => !!localStorage.getItem('jwt_token');

export const dbService = {

  // --- Transactions ---



  async getUserData(userId: string): Promise<UserData> {
    if (!hasToken()) return { transactions: [], savingsMissions: [], recurringTransactions: [] };

    try {
      // Parallel Fetch
      const [txRes, missionRes] = await Promise.all([
        fetchWithAuth(`${API_URL}/transactions`),
        fetchWithAuth(`${API_URL}/missions`)
      ]);

      if (txRes.status === 401 || missionRes.status === 401) {
        console.warn("Session expired, redirecting to login...");
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('cuentalo_session');
        window.location.href = '/auth';
        return { transactions: [], savingsMissions: [], recurringTransactions: [] };
      }

      if (!txRes.ok || !missionRes.ok) throw new Error('Failed to fetch data');

      const transactionsRaw = await txRes.json();
      const missionsRaw = await missionRes.json();

      // Map _id to id
      const transactions: Transaction[] = transactionsRaw.map((t: any) => ({ ...t, id: t._id }));
      const missions: SavingsMission[] = missionsRaw.map((m: any) => ({ ...m, id: m._id }));

      // Recurring could be stored in User Settings or separate endpoint (TODO)
      const recurring: RecurringTransaction[] = [];

      return {
        transactions,
        savingsMissions: missions,
        recurringTransactions: recurring,
        // settings: { theme: 'dark' } // REMOVED: Was overriding local storage
      };
    } catch (error) {
      console.error("Error fetching user data:", error);
      return { transactions: [], savingsMissions: [], recurringTransactions: [] };
    }
  },

  async addUserTransaction(userId: string, transaction: Transaction): Promise<Transaction> {
    const res = await fetchWithAuth(`${API_URL}/transactions`, {
      method: 'POST',
      body: JSON.stringify(transaction)
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      console.error("Server Synchronization Error:", errBody);
      throw new Error(errBody.message || 'Failed to add transaction');
    }
    const data = await res.json();
    return { ...data, id: data._id };
  },

  async updateUserTransaction(userId: string, transactionId: string, updates: Partial<Transaction>): Promise<Transaction> {
    const res = await fetchWithAuth(`${API_URL}/transactions/${transactionId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update transaction');
    const data = await res.json();
    return { ...data, id: data._id };
  },

  async deleteUserTransaction(userId: string, transactionId: string): Promise<void> {
    const res = await fetchWithAuth(`${API_URL}/transactions/${transactionId}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete transaction');
  },

  // --- Bulk Update (Deprecated but compatible) ---
  updateUserTransactions(userId: string, transactions: Transaction[]): void {
    console.warn("Bulk update is deprecated. Use individual API calls.");
  },

  // --- Missions ---

  async addMission(userId: string, mission: SavingsMission): Promise<SavingsMission> {
    const res = await fetchWithAuth(`${API_URL}/missions`, {
      method: 'POST',
      body: JSON.stringify(mission)
    });
    if (!res.ok) throw new Error('Failed to add mission');
    const data = await res.json();
    return { ...data, id: data._id };
  },

  async updateMission(userId: string, mission: SavingsMission): Promise<SavingsMission> {
    // Check if we have a real ID (from Mongo) or a client-side ID
    // If client-side ID (e.g. 'emergency-fund'), we might need to handle it.
    // However, usually we should use _id for updates. 
    // If the mission comes from getUserData, it has _id mapped to id.

    // For specific hardcoded missions (like 'emergency-fund'), they might not have _id yet if not saved.
    // But addMission creates them.

    const res = await fetchWithAuth(`${API_URL}/missions/${mission.id}`, {
      method: 'PUT',
      body: JSON.stringify(mission)
    });
    // If 404/500, caller might try addMission
    if (!res.ok) throw new Error('Failed to update mission');
    const data = await res.json();
    return { ...data, id: data._id };
  },

  async updateUserRecurringTransactions(userId: string, recurring: RecurringTransaction[]): Promise<void> {
    // TODO: Implement endpoint
  },

  async updateUserSettings(userId: string, settings: any): Promise<void> {
    // TODO: Implement endpoint
  }
};
