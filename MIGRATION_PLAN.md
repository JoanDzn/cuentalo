# Plan de Migración y Arquitectura v1.0

## 1. Arquitectura de Datos (MongoDB)
Hemos migrado de un almacenamiento local volátil a una base de datos MongoDB robusta.

### Colecciones:
- **Users**: Información de perfil y autenticación (Google OAuth + Password).
- **Transactions**: Ingresos y gastos.
  - Campos clave: `userId`, `amount`, `currency`, `rateType` (para Venezuela), `isDeleted` (Soft Delete).
  - Índices: `{ userId: 1, updatedAt: 1 }` para sincronización eficiente.
- **Missions**: Metas financieras.
- **RefreshTokens**: Gestión segura de sesiones.

## 2. Autenticación (JWT + Refresh Flow)
Implementamos el estándar de industria para seguridad de sesiones:
- **Access Token (Valid 15m)**: Se usa para peticiones API. Se almacena en memoria del cliente (no localStorage).
- **Refresh Token (Valid 30d)**: Se almacena en HttpOnly Cookie (recomendado) o almacenamiento seguro. Permite obtener nuevos Access Tokens sin loguearse de nuevo.

### Flujo:
1. Login -> Recibe `accessToken` y `refreshToken`.
2. Request a API -> Header `Authorization: Bearer <accessToken>`.
3. Si 401 -> Usar `refreshToken` en endpoint `/api/auth/refresh` para obtener nuevo `accessToken`.
4. Reintentar Request.

## 3. Estrategia Offline / Sync (Venezuela)
Para conexiones inestables:

### Fase 1 (Actual):
- Estructura de DB lista con campos `updatedAt` y `isDeleted`.
- API preparada para recibir parámetros `lastSync`.

### Fase 2 (Futura - Client Side):
- Implementar `SyncService` en frontend.
- Usar `IndexedDB` (vía `dexie.js` o similar) en lugar de localStorage.
- Cola de peticiones: Si no hay internet, guardar petición en cola. Al volver, procesar cola.

## 4. Micrófono y Voz
El componente `VoiceInput` ha sido refactorizado:
- **Prioridad**: Web Speech API (Nativo, rápido).
- **Fallback**: MediaRecorder. Graba audio en blob.
- **Futuro**: Enviar Blob a nuevo endpoint `/api/voice/transcribe` que use Gemini 1.5 Flash Audio capabilities.

## Pasos para Completar Migración:
1. Asegurar que las variables de entorno (`MONGODB_URI`, `JWT_SECRET`) están en Vercel.
2. Actualizar el frontend (`dbService.ts`) para dejar de usar localStorage y empezar a consumir la API `/api/transactions`.
3. Desplegar backend y frontend.
