# Guía de Integración de Autenticación

Este documento explica cómo integrar Firebase o Supabase para la autenticación en Cuentalo.

## Estructura Actual

El proyecto usa un servicio de autenticación abstracto (`services/authService.ts`) que actualmente tiene una implementación mock para desarrollo. Para producción, necesitas reemplazar esta implementación con Firebase o Supabase.

## Integración con Firebase

### 1. Instalar Firebase

```bash
npm install firebase
```

### 2. Configurar Firebase

Crea un archivo `services/firebaseConfig.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_STORAGE_BUCKET",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

### 3. Actualizar AuthService

Reemplaza la clase `MockAuthService` en `services/authService.ts` con:

```typescript
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  updateProfile 
} from 'firebase/auth';
import { auth } from './firebaseConfig';

class FirebaseAuthService implements AuthService {
  private provider = new GoogleAuthProvider();

  async signInWithEmail(email: string, password: string): Promise<User> {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return this.mapFirebaseUser(result.user);
  }

  async signUpWithEmail(email: string, password: string, name: string): Promise<User> {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: name });
    return this.mapFirebaseUser(result.user);
  }

  async signInWithGoogle(): Promise<User> {
    const result = await signInWithPopup(auth, this.provider);
    return this.mapFirebaseUser(result.user);
  }

  async signOut(): Promise<void> {
    await signOut(auth);
  }

  async getCurrentUser(): Promise<User | null> {
    return auth.currentUser ? this.mapFirebaseUser(auth.currentUser) : null;
  }

  onAuthStateChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, (firebaseUser) => {
      callback(firebaseUser ? this.mapFirebaseUser(firebaseUser) : null);
    });
  }

  private mapFirebaseUser(user: any): User {
    return {
      id: user.uid,
      email: user.email || '',
      name: user.displayName || user.email?.split('@')[0] || 'Usuario',
      photoURL: user.photoURL || undefined,
      createdAt: user.metadata.creationTime || new Date().toISOString(),
    };
  }
}

export const authService: AuthService = new FirebaseAuthService();
```

## Integración con Supabase

### 1. Instalar Supabase

```bash
npm install @supabase/supabase-js
```

### 2. Configurar Supabase

Crea un archivo `services/supabaseConfig.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'TU_SUPABASE_URL';
const supabaseAnonKey = 'TU_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 3. Actualizar AuthService

Reemplaza la clase `MockAuthService` en `services/authService.ts` con:

```typescript
import { supabase } from './supabaseConfig';

class SupabaseAuthService implements AuthService {
  async signInWithEmail(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    if (!data.user) throw new Error('No user data returned');
    
    return this.mapSupabaseUser(data.user);
  }

  async signUpWithEmail(email: string, password: string, name: string): Promise<User> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });
    
    if (error) throw error;
    if (!data.user) throw new Error('No user data returned');
    
    return this.mapSupabaseUser(data.user);
  }

  async signInWithGoogle(): Promise<User> {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    
    if (error) throw error;
    if (!data.user) throw new Error('No user data returned');
    
    return this.mapSupabaseUser(data.user);
  }

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user ? this.mapSupabaseUser(user) : null;
  }

  onAuthStateChange(callback: (user: User | null) => void): () => void {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ? this.mapSupabaseUser(session.user) : null);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }

  private mapSupabaseUser(user: any): User {
    return {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario',
      photoURL: user.user_metadata?.avatar_url || undefined,
      createdAt: user.created_at || new Date().toISOString(),
    };
  }
}

export const authService: AuthService = new SupabaseAuthService();
```

## Notas Importantes

1. **Variables de Entorno**: Nunca commitees tus credenciales de Firebase/Supabase. Usa variables de entorno:
   - Crea un archivo `.env.local`
   - Agrega tus credenciales allí
   - Agrega `.env.local` a `.gitignore`

2. **Reglas de Seguridad**: Configura las reglas de seguridad en Firebase/Supabase para proteger los datos de los usuarios.

3. **Testing**: La implementación mock actual permite desarrollar sin necesidad de configurar autenticación real. Cambia a la implementación real solo cuando estés listo para producción.
