export interface User {
  id: string;
  email: string;
  name: string;
  photoURL?: string;
  createdAt: string;
  role?: 'user' | 'ADMIN';
}

export const authService = {
  // ... (previous methods)
  // Need to update login methods to store token and remove local DB dependency

  listeners: new Set<(user: User | null) => void>(),
  currentUser: null as User | null,

  async signInWithEmail(email: string, password: string): Promise<User> {
    const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, '');
    const API_URL = `${BASE_URL}/api`;
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    localStorage.setItem('jwt_token', data.accessToken);
    // Store refresh token in HTTPOnly cookie ideally, or localStorage if necessary
    if (data.refreshToken) localStorage.setItem('refresh_token', data.refreshToken);

    const user = { ...data.user, createdAt: new Date().toISOString() };
    this.currentUser = user;
    this.notifyListeners(user);
    return user;
  },

  async signUpWithEmail(email: string, password: string, name: string): Promise<User> {
    const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, '');
    const API_URL = `${BASE_URL}/api`;
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    localStorage.setItem('jwt_token', data.accessToken);
    if (data.refreshToken) localStorage.setItem('refresh_token', data.refreshToken);

    const user = { ...data.user, createdAt: new Date().toISOString() };
    this.currentUser = user;
    this.notifyListeners(user);
    return user;
  },

  async signInWithGoogle(token: string, redirectUri?: string): Promise<User> {
    const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, '');
    const API_URL = `${BASE_URL}/api`;
    const res = await fetch(`${API_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, redirectUri })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    localStorage.setItem('jwt_token', data.accessToken);
    if (data.refreshToken) localStorage.setItem('refresh_token', data.refreshToken);

    const user = { ...data.user, createdAt: new Date().toISOString() };
    this.currentUser = user;
    this.notifyListeners(user);
    return user;
  },

  async signOut(): Promise<void> {
    this.currentUser = null;
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('cuentalo_session');
    this.notifyListeners(null);
  },

  onAuthStateChange(callback: (user: User | null) => void): () => void {
    this.listeners.add(callback);
    // Restore session from localStorage if token exists
    const token = localStorage.getItem('jwt_token');
    const storedSession = localStorage.getItem('cuentalo_session');

    if (token && storedSession && !this.currentUser) {
      try {
        this.currentUser = JSON.parse(storedSession);
      } catch (e) {
        this.currentUser = null;
      }
    }

    callback(this.currentUser);
    return () => { this.listeners.delete(callback); };
  },

  notifyListeners(user: User | null) {
    if (user) localStorage.setItem('cuentalo_session', JSON.stringify(user));
    else localStorage.removeItem('cuentalo_session');
    this.listeners.forEach(cb => cb(user));
  },

  async updateUserProfile(updates: Partial<User>): Promise<void> {
    // Implement profile update API call
  },

  async refreshUser(): Promise<User | null> {
    const token = localStorage.getItem('jwt_token');
    if (!token) return null;

    const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, '') + '/api';

    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        // Update local state and storage
        const user = { ...data, createdAt: data.createdAt || new Date().toISOString() };
        this.currentUser = user;
        this.notifyListeners(user);
        return user;
      }
    } catch (e) {
      console.error("Failed to refresh user:", e);
    }
    return this.currentUser;
  }
};
