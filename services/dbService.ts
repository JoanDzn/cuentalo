/**
 * Database Service
 * Manages user data storage using localStorage
 * Each user has their own isolated data space
 */

import { Transaction, SavingsMission, FinancialHealthTest } from '../types';
import { User } from './authService';

export interface UserData {
  transactions: Transaction[];
  savingsMissions: SavingsMission[];
  financialHealthTest?: FinancialHealthTest;
  settings?: {
    theme?: 'light' | 'dark';
    preferredCurrency?: 'USD' | 'VES';
  };
}

export interface UserAccount {
  id: string;
  email: string;
  password: string; // In production, this should be hashed
  name: string;
  createdAt: string;
  photoURL?: string;
}

class DatabaseService {
  private readonly USERS_KEY = 'cuentalo_users';
  private readonly USER_DATA_PREFIX = 'cuentalo_user_data_';

  /**
   * Initialize database with demo user
   */
  initialize(): void {
    const users = this.getAllUsers();

    // Create demo user if it doesn't exist
    let demoUser = users.find(u => u.email === 'admin@gmail.com');
    if (!demoUser) {
      const demoAccount: UserAccount = {
        id: 'demo-admin-001',
        email: 'admin@gmail.com',
        password: '123456', // In production, hash this
        name: 'Admin Demo',
        createdAt: new Date().toISOString(),
      };
      users.push(demoAccount);
      this.saveAllUsers(users);

      // Initialize empty data for demo user
      this.initializeUserData(demoAccount.id);
      demoUser = demoAccount;
    }

    // Always ensure admin has seed data if empty (for demo purposes)
    const adminData = this.getUserData(demoUser.id);
    if (adminData.transactions.length === 0) {
      const seedTransactions: Transaction[] = [
        {
          id: 'seed-1',
          description: 'Mercado semanal',
          amount: 45.5,
          category: 'Comida',
          date: new Date().toISOString(),
          type: 'expense',
        },
        {
          id: 'seed-2',
          description: 'Sueldo quincenal',
          amount: 350.0,
          category: 'Salario',
          date: new Date(Date.now() - 86400000 * 2).toISOString(),
          type: 'income',
        },
        {
          id: 'seed-3',
          description: 'Pago de alquiler',
          amount: 120.0,
          category: 'Hogar',
          date: new Date(Date.now() - 86400000 * 5).toISOString(),
          type: 'expense',
        },
      ];
      this.updateUserTransactions(demoUser.id, seedTransactions);
    }
  }

  /**
   * Get all registered users
   */
  getAllUsers(): UserAccount[] {
    try {
      const stored = localStorage.getItem(this.USERS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Save all users
   */
  private saveAllUsers(users: UserAccount[]): void {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  /**
   * Find user by email
   */
  findUserByEmail(email: string): UserAccount | null {
    const users = this.getAllUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  /**
   * Find user by ID
   */
  findUserById(id: string): UserAccount | null {
    const users = this.getAllUsers();
    return users.find(u => u.id === id) || null;
  }

  /**
   * Create new user account
   */
  createUser(email: string, password: string, name: string, photoURL?: string): UserAccount {
    const users = this.getAllUsers();

    // Check if user already exists
    if (this.findUserByEmail(email)) {
      throw new Error('El correo electrónico ya está registrado');
    }

    const newUser: UserAccount = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      email: email.toLowerCase(),
      password, // In production, hash this
      name,
      createdAt: new Date().toISOString(),
      photoURL,
    };

    users.push(newUser);
    this.saveAllUsers(users);

    // Initialize empty data for new user
    this.initializeUserData(newUser.id);

    return newUser;
  }

  /**
   * Verify user credentials
   */
  verifyCredentials(email: string, password: string): UserAccount | null {
    const user = this.findUserByEmail(email);
    if (!user) {
      return null;
    }

    // In production, compare hashed passwords
    if (user.password !== password) {
      return null;
    }

    return user;
  }

  /**
   * Initialize empty user data
   */
  private initializeUserData(userId: string): void {
    const emptyData: UserData = {
      transactions: [],
      savingsMissions: [],
      settings: {
        theme: 'dark',
        preferredCurrency: 'USD',
      },
    };
    this.saveUserData(userId, emptyData);
  }

  /**
   * Get user data
   */
  getUserData(userId: string): UserData {
    try {
      const key = `${this.USER_DATA_PREFIX}${userId}`;
      const stored = localStorage.getItem(key);

      if (!stored) {
        // Initialize if doesn't exist
        this.initializeUserData(userId);
        return this.getUserData(userId);
      }

      const data = JSON.parse(stored);

      // Ensure all required fields exist
      return {
        transactions: data.transactions || [],
        savingsMissions: data.savingsMissions || [],
        financialHealthTest: data.financialHealthTest,
        settings: {
          theme: data.settings?.theme || 'dark',
          preferredCurrency: data.settings?.preferredCurrency || 'USD',
        },
      };
    } catch {
      // Return empty data on error
      this.initializeUserData(userId);
      return this.getUserData(userId);
    }
  }

  /**
   * Save user data
   */
  saveUserData(userId: string, data: UserData): void {
    const key = `${this.USER_DATA_PREFIX}${userId}`;
    localStorage.setItem(key, JSON.stringify(data));
  }

  /**
   * Update user transactions
   */
  updateUserTransactions(userId: string, transactions: Transaction[]): void {
    const userData = this.getUserData(userId);
    userData.transactions = transactions;
    this.saveUserData(userId, userData);
  }

  /**
   * Add transaction to user
   */
  addUserTransaction(userId: string, transaction: Transaction): void {
    const userData = this.getUserData(userId);
    userData.transactions = [transaction, ...userData.transactions];
    this.saveUserData(userId, userData);
  }

  /**
   * Update user transaction
   */
  updateUserTransaction(userId: string, transactionId: string, updates: Partial<Transaction>): void {
    const userData = this.getUserData(userId);
    userData.transactions = userData.transactions.map(t =>
      t.id === transactionId ? { ...t, ...updates } : t
    );
    this.saveUserData(userId, userData);
  }

  /**
   * Delete user transaction
   */
  deleteUserTransaction(userId: string, transactionId: string): void {
    const userData = this.getUserData(userId);
    userData.transactions = userData.transactions.filter(t => t.id !== transactionId);
    this.saveUserData(userId, userData);
  }

  /**
   * Update user settings
   */
  updateUserSettings(userId: string, settings: Partial<UserData['settings']>): void {
    const userData = this.getUserData(userId);
    userData.settings = { ...userData.settings, ...settings };
    this.saveUserData(userId, userData);
  }

  /**
   * Clear all data (for testing)
   */
  clearAllData(): void {
    const users = this.getAllUsers();
    users.forEach(user => {
      const key = `${this.USER_DATA_PREFIX}${user.id}`;
      localStorage.removeItem(key);
    });
    localStorage.removeItem(this.USERS_KEY);
  }
}

// Export singleton instance
export const dbService = new DatabaseService();

// Initialize on import
dbService.initialize();
