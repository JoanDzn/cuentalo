/**
 * Authentication Service
 * Uses database service for user management
 */

import { dbService } from './dbService';

export interface User {
  id: string;
  email: string;
  name: string;
  photoURL?: string;
  createdAt: string;
}

export interface AuthService {
  signInWithEmail: (email: string, password: string) => Promise<User>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<User>;
  signInWithGoogle: () => Promise<User>;
  signOut: () => Promise<void>;
  getCurrentUser: () => Promise<User | null>;
  onAuthStateChange: (callback: (user: User | null) => void) => () => void;
}

class DatabaseAuthService implements AuthService {
  private currentUser: User | null = null;
  private listeners: Set<(user: User | null) => void> = new Set();
  private readonly SESSION_KEY = 'cuentalo_session';

  constructor() {
    const stored = localStorage.getItem(this.SESSION_KEY);
    if (stored) {
      try {
        this.currentUser = JSON.parse(stored);
      } catch (e) {
        localStorage.removeItem(this.SESSION_KEY);
      }
    }
  }

  async signInWithEmail(email: string, password: string): Promise<User> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Verify credentials against database
    const account = dbService.verifyCredentials(email, password);

    if (!account) {
      throw new Error('Correo electrónico o contraseña incorrectos');
    }

    // Convert to User format
    const user: User = {
      id: account.id,
      email: account.email,
      name: account.name,
      photoURL: account.photoURL,
      createdAt: account.createdAt,
    };

    this.currentUser = user;
    this.notifyListeners(user);
    return user;
  }

  async signUpWithEmail(email: string, password: string, name: string): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 500));

    // Create user in database
    const account = dbService.createUser(email, password, name);

    // Convert to User format
    const user: User = {
      id: account.id,
      email: account.email,
      name: account.name,
      photoURL: account.photoURL,
      createdAt: account.createdAt,
    };

    this.currentUser = user;
    this.notifyListeners(user);
    return user;
  }

  async signInWithGoogle(): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 800));

    // For Google sign-in, create or find user
    // For now, we'll create a temporary user
    // In production, integrate with Google OAuth
    const email = 'user@gmail.com';
    let account = dbService.findUserByEmail(email);

    if (!account) {
      account = dbService.createUser(email, '', 'Usuario Google', 'https://via.placeholder.com/150');
    }

    const user: User = {
      id: account.id,
      email: account.email,
      name: account.name,
      photoURL: account.photoURL,
      createdAt: account.createdAt,
    };

    this.currentUser = user;
    this.notifyListeners(user);
    return user;
  }

  async signOut(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    this.currentUser = null;
    localStorage.removeItem(this.SESSION_KEY);
    this.notifyListeners(null);
  }

  async getCurrentUser(): Promise<User | null> {
    return this.currentUser;
  }

  onAuthStateChange(callback: (user: User | null) => void): () => void {
    this.listeners.add(callback);
    // Immediately call with current user
    callback(this.currentUser);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(user: User | null) {
    if (user) {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.SESSION_KEY);
    }
    this.listeners.forEach(callback => callback(user));
  }
}

// Export singleton instance
export const authService: AuthService = new DatabaseAuthService();

/**
 * FIREBASE INTEGRATION EXAMPLE:
 * 
 * import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, 
 *          signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
 * 
 * class FirebaseAuthService implements AuthService {
 *   private auth = getAuth();
 *   private provider = new GoogleAuthProvider();
 * 
 *   async signInWithEmail(email: string, password: string): Promise<User> {
 *     const result = await signInWithEmailAndPassword(this.auth, email, password);
 *     return this.mapFirebaseUser(result.user);
 *   }
 * 
 *   async signUpWithEmail(email: string, password: string, name: string): Promise<User> {
 *     const result = await createUserWithEmailAndPassword(this.auth, email, password);
 *     await updateProfile(result.user, { displayName: name });
 *     return this.mapFirebaseUser(result.user);
 *   }
 * 
 *   async signInWithGoogle(): Promise<User> {
 *     const result = await signInWithPopup(this.auth, this.provider);
 *     return this.mapFirebaseUser(result.user);
 *   }
 * 
 *   async signOut(): Promise<void> {
 *     await signOut(this.auth);
 *   }
 * 
 *   async getCurrentUser(): Promise<User | null> {
 *     return this.auth.currentUser ? this.mapFirebaseUser(this.auth.currentUser) : null;
 *   }
 * 
 *   onAuthStateChange(callback: (user: User | null) => void): () => void {
 *     return onAuthStateChanged(this.auth, (firebaseUser) => {
 *       callback(firebaseUser ? this.mapFirebaseUser(firebaseUser) : null);
 *     });
 *   }
 * 
 *   private mapFirebaseUser(user: any): User {
 *     return {
 *       id: user.uid,
 *       email: user.email || '',
 *       name: user.displayName || user.email?.split('@')[0] || 'Usuario',
 *       photoURL: user.photoURL || undefined,
 *       createdAt: user.metadata.creationTime || new Date().toISOString(),
 *     };
 *   }
 * }
 */
