export interface User {
  id: string;
  email: string;
  name: string;
  photoURL?: string;
  createdAt: string;
  role?: 'user' | 'ADMIN';
}

export const authService = {
  listeners: new Set<(user: User | null) => void>(),
  currentUser: null as User | null,
  refreshPromise: null as Promise<string | null> | null,

  async signInWithEmail(email: string, password: string): Promise<User> {
    const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, '');
    console.log("Calling API at:", BASE_URL);
    const API_URL = `${BASE_URL}/api`;
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("Login response parse error:", text);
      throw new Error(`Server returned non-JSON response: ${res.status} ${res.statusText}`);
    }

    if (!res.ok) throw new Error(data.message || 'Error de autenticación');

    localStorage.setItem('jwt_token', data.accessToken);
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
    const token = localStorage.getItem('jwt_token');
    if (!token) throw new Error('No authenticado');

    const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, '');

    // Explicitly allow picture updates via photoURL if passed
    const payload: any = { ...updates };
    if (updates.photoURL) payload.photoURL = updates.photoURL;

    const res = await fetch(`${BASE_URL}/api/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error('Error al actualizar perfil');
    }

    const updatedUser = await res.json();
    // Map backend 'picture' back to 'photoURL' for frontend consistency if needed
    if (updatedUser.picture) updatedUser.photoURL = updatedUser.picture;

    this.currentUser = { ...this.currentUser, ...updatedUser };
    this.notifyListeners(this.currentUser);
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
        const user = { ...data, createdAt: data.createdAt || new Date().toISOString() };
        this.currentUser = user;
        this.notifyListeners(user);
        return user;
      }
    } catch (e) {
      console.error("Failed to refresh user:", e);
    }
    return this.currentUser;
  },

  async requestPasswordReset(email: string): Promise<void> {
    const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, '');
    const res = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al solicitar el enlace');
  },

  async resetPassword(token: string, password: string): Promise<void> {
    const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, '');
    const res = await fetch(`${BASE_URL}/api/auth/reset-password/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al restablecer la contraseña');
  },

  async refreshAccessToken(): Promise<string | null> {
    if (this.refreshPromise) return this.refreshPromise;

    this.refreshPromise = (async () => {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) return null;

      const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, '');
      try {
        const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        });

        if (res.ok) {
          const data = await res.json();
          localStorage.setItem('jwt_token', data.accessToken);
          if (data.refreshToken) {
            localStorage.setItem('refresh_token', data.refreshToken);
          }
          return data.accessToken;
        } else {
          // Refresh failed (expired/invalid), force logout
          console.warn("Refresh token invalid, logging out");
          this.signOut();
          return null;
        }
      } catch (e) {
        console.error("Error refreshing token:", e);
        return null;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }
};
