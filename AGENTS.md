# 🧠 AGENTS.md — Cuéntalo
> **Documento de referencia completo para agentes de IA, LLMs y desarrolladores.**
> Este archivo describe la arquitectura, tecnologías, flujos de datos, convenciones y roadmap del proyecto **Cuéntalo**.

---

## 📋 Tabla de Contenidos

1. [Descripción General](#-descripción-general)
2. [Stack Tecnológico](#-stack-tecnológico)
3. [Arquitectura del Sistema](#-arquitectura-del-sistema)
4. [Estructura de Carpetas](#-estructura-de-carpetas)
5. [Backend (Express + Node.js)](#-backend-express--nodejs)
6. [Frontend (React + TypeScript)](#-frontend-react--typescript)
7. [Base de Datos (MongoDB)](#-base-de-datos-mongodb)
8. [Autenticación y Seguridad](#-autenticación-y-seguridad)
9. [Inteligencia Artificial (Gemini)](#-inteligencia-artificial-gemini)
10. [Tasas de Cambio (Venezuela)](#-tasas-de-cambio-venezuela)
11. [Testing](#-testing)
12. [Despliegue](#-despliegue)
13. [Variables de Entorno](#-variables-de-entorno)
14. [API Endpoints](#-api-endpoints)
15. [Modelos de Datos (TypeScript)](#-modelos-de-datos-typescript)
16. [Convenciones y Reglas](#-convenciones-y-reglas)
17. [Roadmap](#-roadmap)

---

## 🌐 Descripción General

**Cuéntalo** es una aplicación web de gestión de finanzas personales diseñada específicamente para el contexto venezolano. Permite registrar ingresos y gastos mediante **comandos de voz en español** o **captura de imágenes de recibos**, con soporte nativo para múltiples monedas (USD, VES) y conversión automática usando tasas oficiales (BCV, paralelo, euro).

### Características principales:
- 🎤 **Entrada por voz** — Registro de transacciones con comandos naturales en español
- 📷 **Análisis de imágenes** — Escaneo de recibos/comprobantes con IA multimodal
- 💱 **Multi-moneda** — USD y VES con tasas BCV, paralelo (USDT) y euro en tiempo real
- 🤖 **IA con Gemini** — Parseo inteligente y categorización automática
- 🔐 **Auth empresarial** — JWT + Refresh Tokens rotativos + Google OAuth 2.0
- 🎯 **Misiones de ahorro** — Sistema gamificado de metas financieras
- 📊 **Dashboard interactivo** — Visualizaciones con Recharts
- 🔁 **Transacciones recurrentes** — Suscripciones y gastos periódicos
- 🌓 **Modo oscuro/claro** — UI adaptable con Framer Motion
- 👑 **Panel de administración** — Gestión de usuarios, logs y configuración del sistema

---

## 🛠️ Stack Tecnológico

### Frontend
| Tecnología | Versión | Rol |
|---|---|---|
| **React** | ^19.2.3 | Framework UI principal |
| **TypeScript** | ~5.8.2 | Tipado estático |
| **Vite** | ^6.2.0 | Build tool + Dev server (puerto 3000) |
| **React Router DOM** | ^7.12.0 | Enrutamiento cliente (SPA) |
| **Framer Motion** | ^12.26.2 | Animaciones y transiciones |
| **Recharts** | ^3.7.0 | Gráficas de gastos/ingresos |
| **Lucide React** | ^0.575.0 | Iconografía |
| **@react-oauth/google** | ^0.13.4 | Google OAuth 2.0 en cliente |
| **Web Speech API** | Nativo | Reconocimiento de voz (input principal) |
| **MediaRecorder API** | Nativo | Fallback de grabación de voz |

### Backend
| Tecnología | Versión | Rol |
|---|---|---|
| **Node.js** | LTS | Runtime del servidor |
| **Express** | ^5.2.1 | Framework HTTP |
| **Mongoose** | ^9.1.4 | ODM para MongoDB |
| **JWT (jsonwebtoken)** | ^9.0.3 | Tokens de acceso y refresco |
| **bcryptjs** | ^3.0.3 | Hash de contraseñas |
| **Helmet** | ^8.1.0 | Headers de seguridad HTTP |
| **express-rate-limit** | ^8.2.1 | Rate limiting por IP |
| **express-mongo-sanitize** | ^2.2.0 | Protección contra inyección NoSQL |
| **node-cache** | ^5.1.2 | Caching en memoria (tasas de cambio) |
| **Nodemailer** | ^8.0.1 | Envío de correos (recovery, 2FA) |
| **Zod** | ^4.3.6 | Validación de esquemas de datos |
| **Speakeasy** | ^2.0.0 | TOTP para 2FA |
| **QRCode** | ^1.5.4 | Generación QR para 2FA |
| **dotenv** | ^17.2.3 | Manejo de variables de entorno |
| **google-auth-library** | ^10.5.0 | Verificación de tokens Google en servidor |
| **concurrently** | ^9.2.1 | Ejecutar cliente y servidor en paralelo |

### Base de Datos
| Tecnología | Rol |
|---|---|
| **MongoDB Atlas** | Base de datos cloud principal |
| **Mongoose ODM** | Modelado de datos y queries |

### Testing
| Tecnología | Versión | Rol |
|---|---|---|
| **Vitest** | ^4.0.18 | Unit tests (lógica financiera) |
| **Playwright** | ^1.58.2 | E2E tests (flujos de usuario completos) |

### Despliegue
| Tecnología | Rol |
|---|---|
| **Vercel** | Plataforma de despliegue (frontend + serverless) |
| **MongoDB Atlas** | Base de datos en la nube |

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTE                              │
│                    React + TypeScript                        │
│                    (Vite, puerto 3000)                       │
│                                                             │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  Dashboard │  │  VoiceInput  │  │  Admin Panel     │   │
│  │  Recharts  │  │  Web Speech  │  │  Users/Logs      │   │
│  │  Framer    │  │  Camera/Imgs │  │  Settings        │   │
│  └────────────┘  └──────────────┘  └──────────────────┘   │
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │              services/ (API clients)               │    │
│  │  authService.ts │ dbService.ts │ geminiService.ts  │    │
│  │  exchangeRateService.ts                            │    │
│  └────────────────────────────────────────────────────┘    │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST (Bearer Token)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                     BACKEND                                 │
│              Express.js (Node.js ESM)                       │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  /auth   │  │  /trans  │  │   /ai    │  │  /rates  │  │
│  │  JWT+    │  │  CRUD    │  │  Gemini  │  │  BCV+    │  │
│  │  OAuth   │  │  Soft    │  │  Parse   │  │  Cache   │  │
│  │  Refresh │  │  Delete  │  │  Image   │  │  10min   │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │ /missions│  │/recurring│  │  /admin  │                 │
│  │  Gamif.  │  │  Recur.  │  │  Audit   │                 │
│  │  CRUD    │  │  Trans.  │  │  Logs    │                 │
│  └──────────┘  └──────────┘  └──────────┘                 │
│                                                             │
│  Middleware: auth.js │ adminAuth.js │ validate.js           │
└──────────────────────┬──────────────────────────────────────┘
                       │ Mongoose ODM
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  MongoDB Atlas                               │
│                                                             │
│  Users │ Transactions │ Missions │ RefreshTokens │          │
│  RecurringTransactions │ AdminLogs │ SystemConfig │         │
└─────────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│            Servicios Externos                                │
│  Google Gemini API  │  ve.dolarapi.com  │  Google OAuth     │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Estructura de Carpetas

```
cuentalo/
├── 📄 AGENTS.md              ← Este archivo (contexto para IA y devs)
├── 📄 README.md              ← Guía rápida de instalación
├── 📄 ROADMAP.md             ← Funcionalidades pendientes y prioridades
├── 📄 MIGRATION_PLAN.md      ← Plan de arquitectura local → MongoDB
├── 📄 PLAN_RECUPERACION_PASSWORD.md ← Flujo de reset de contraseña
│
├── 🖥️  server/               ← Backend Express (Node.js ESM)
│   ├── app.js                ← Express app, middlewares, rutas
│   ├── db.js                 ← Conexión a MongoDB Atlas
│   ├── controllers/
│   │   ├── aiController.js   ← Lógica Gemini (texto + imagen)
│   │   └── authController.js ← Login, register, OAuth, refresh
│   ├── routes/
│   │   ├── auth.js           ← /api/auth/*
│   │   ├── transactions.js   ← /api/transactions/*
│   │   ├── ai.js             ← /api/ai/*
│   │   ├── rates.js          ← /api/rates
│   │   ├── missions.js       ← /api/missions/*
│   │   ├── recurring.js      ← /api/recurring/*
│   │   └── admin.js          ← /api/admin/*
│   ├── models/
│   │   ├── User.js           ← Schema usuario
│   │   ├── Transaction.js    ← Schema transacción
│   │   ├── Mission.js        ← Schema misión de ahorro
│   │   ├── RefreshToken.js   ← Schema refresh token
│   │   ├── RecurringTransaction.js
│   │   ├── AdminLog.js       ← Auditoría de acciones
│   │   └── SystemConfig.js   ← Configuración global del sistema
│   ├── middleware/
│   │   ├── auth.js           ← Verificación JWT (protege rutas)
│   │   ├── adminAuth.js      ← Verificación de rol admin
│   │   └── validate.js       ← Validación Zod middleware
│   ├── services/
│   │   ├── rateService.js    ← Fetch + cache tasas de cambio
│   │   ├── transactionService.js ← Lógica de negocio transacciones
│   │   ├── mailService.js    ← Nodemailer (recovery, 2FA)
│   │   └── auditService.js   ← Registro de acciones administrativas
│   └── schemas/              ← Schemas Zod para validación
│
├── 🎨  components/           ← Componentes React reutilizables
│   ├── Dashboard.tsx         ← Componente principal del dashboard
│   ├── VoiceInput.tsx        ← Input de voz + cámara + galería
│   ├── AuthScreen.tsx        ← Login / Registro
│   ├── LandingPage.tsx       ← Página de inicio pública
│   ├── ProfileDrawer.tsx     ← Drawer de perfil de usuario
│   ├── CurrencyConverterModal.tsx ← Conversor de divisas
│   ├── TransactionListModal.tsx   ← Lista completa de movimientos
│   ├── SavingsMissions.tsx   ← Misiones y metas de ahorro
│   ├── SavingsModal.tsx      ← Modal para gestión de misiones
│   ├── SubscriptionsModal.tsx ← Gestión de suscripciones recurrentes
│   ├── OnboardingTour.tsx    ← Tour guiado para nuevos usuarios
│   ├── ExpenseChart.tsx      ← Gráfica de gastos (Recharts)
│   ├── EditModal.tsx         ← Edición de transacciones
│   ├── AnimatedBackground.tsx ← Fondo animado
│   ├── ProtectedRoute.tsx    ← HOC para rutas protegidas
│   └── PublicRoute.tsx       ← HOC para rutas públicas
│
├── 📄  pages/                ← Páginas de la aplicación
│   ├── DashboardPage.tsx     ← Página principal autenticada
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   └── admin/                ← Panel de administración
│       ├── Layout.tsx        ← Sidebar admin
│       ├── Dashboard.tsx     ← Métricas globales
│       ├── Users.tsx         ← Gestión de usuarios
│       ├── Settings.tsx      ← Config del sistema
│       ├── Logs.tsx          ← Logs del servidor
│       ├── VoiceAudit.tsx    ← Auditoría de entradas de voz
│       └── LoginPage.tsx     ← Login exclusivo de admin
│
├── 🔧  services/             ← Servicios cliente (fetch wrappers)
│   ├── authService.ts        ← Login, register, refresh token
│   ├── dbService.ts          ← CRUD transacciones vía API
│   ├── exchangeRateService.ts ← Fetch tasas desde /api/rates
│   └── geminiService.ts      ← Llamadas a /api/ai/*
│
├── 🪝  hooks/                ← Custom React Hooks
│   └── useAuth.ts            ← Estado de autenticación global
│
├── 🗂️  types.ts              ← Interfaces y tipos TypeScript globales
├── 📜  App.tsx               ← Router principal (React Router v7)
├── 📜  index.tsx             ← Entry point de React
├── 📜  index.css             ← Estilos globales (Vanilla CSS)
├── 📜  index.html            ← HTML template (Vite)
│
├── 🧪  tests/
│   └── auth.e2e.test.ts      ← Tests E2E con Playwright
│
├── ⚙️  vite.config.ts        ← Configuración Vite (puerto 3000, alias @/)
├── ⚙️  tsconfig.json         ← Configuración TypeScript
├── ⚙️  vercel.json           ← Rewrites para despliegue en Vercel
├── 📦  package.json          ← Dependencias y scripts npm
└── 🔑  .env.local            ← Variables de entorno locales (NO commitear)
```

---

## 🔧 Backend (Express + Node.js)

### Configuración del servidor

El backend usa **ES Modules** (`"type": "module"` en `package.json`). El entry point es `server.js` (raíz), que importa `server/app.js`.

```bash
# Inicia servidor con hot-reload
npm run server   # node --watch server.js
```

### Middlewares globales (en orden de aplicación)

1. **CORS** — Habilitado para todos los orígenes en desarrollo
2. **express.json** — Límite de `20mb` (para imágenes en base64)
3. **express.urlencoded** — Límite `20mb`
4. **Debug logger** — Loguea `[timestamp] METHOD /path` 
5. **Helmet** *(comentado, disponible)* — Headers de seguridad HTTP
6. **mongoSanitize** *(comentado, disponible)* — Anti-inyección NoSQL
7. **rateLimit** *(comentado, disponible)* — 100 req / 15min por IP

### Rutas registradas

| Prefijo | Archivo | Descripción |
|---|---|---|
| `/api/auth` | `routes/auth.js` | Registro, login, OAuth, refresh, password reset |
| `/api/transactions` | `routes/transactions.js` | CRUD de transacciones |
| `/api/ai` | `routes/ai.js` | Parse de voz e imágenes con Gemini |
| `/api/rates` | `routes/rates.js` | Tasas de cambio (BCV, USDT, EUR) |
| `/api/missions` | `routes/missions.js` | Misiones de ahorro |
| `/api/recurring` | `routes/recurring.js` | Transacciones recurrentes |
| `/api/admin` | `routes/admin.js` | Panel admin: usuarios, logs, config |
| `/api/health` | inline | Health check: `{ status: 'ok' }` |

---

## 🎨 Frontend (React + TypeScript)

### Arquitectura cliente

La app es una **SPA (Single Page Application)** con React Router v7. El enrutamiento se define en `App.tsx`:

```
/              → LandingPage (público)
/login         → AuthScreen (público)
/register      → AuthScreen (público)
/dashboard     → DashboardPage (protegido: ProtectedRoute)
/admin/*       → Admin Panel (protegido: adminAuth)
```

### Estado y servicios

- **No hay store global (Redux/Zustand)** — Se usa estado local con `useState` + `useEffect` + props drilling controlado.
- **`useAuth` hook** — Centraliza el estado de autenticación (token, usuario, isLoading).
- **`services/`** — Wrappers de `fetch` que incluyen el Bearer token automáticamente y manejan el refresh de tokens.

### Flujo de entrada de datos (VoiceInput)

```
Usuario habla → Web Speech API → transcript (string)
                                      ↓
                              POST /api/ai/parse
                                      ↓
                              Gemini API (backend)
                                      ↓
                     { amount, currency, category, description, date, type }
                                      ↓
                              POST /api/transactions
                                      ↓
                              Actualización UI en tiempo real
```

### Flujo de entrada por imagen

```
Usuario captura/sube foto → base64 (FileReader)
                                      ↓
                              POST /api/ai/image
                               (body: { image: base64 })
                                      ↓
                              Gemini Vision (backend)
                                      ↓
                     { amount, currency, category, description }
                                      ↓
                              Formulario pre-completado
```

---

## 🗄️ Base de Datos (MongoDB)

### Colecciones y esquemas

#### `Users`
```js
{
  name: String,
  email: String (unique),
  password: String (hashed bcrypt),
  googleId: String (OAuth),
  role: String ('user' | 'admin'),
  primaryCurrency: String ('USD' | 'VES'),
  createdAt: Date
}
```

#### `Transactions`
```js
{
  userId: ObjectId (ref: User),
  description: String,
  amount: Number,          // Siempre almacenado en USD
  currency: String,        // Moneda original del usuario
  originalAmount: Number,  // Cantidad en moneda original
  rateType: String,        // 'bcv' | 'euro' | 'usdt' | null
  rateValue: Number,       // Tasa usada al momento del registro
  category: String,
  type: String,            // 'expense' | 'income'
  date: String,            // YYYY-MM-DD
  isDeleted: Boolean,      // Soft delete
  createdAt: Date,
  updatedAt: Date          // Para sincronización incremental
}
```
> **Índice:** `{ userId: 1, updatedAt: 1 }` — Para sincronización eficiente por delta.

#### `Missions`
```js
{
  userId: ObjectId (ref: User),
  code: String,
  title: String,
  description: String,
  tip: String,
  targetAmount: Number,
  currentProgress: Number,
  targetProgress: Number,  // 0-100
  status: String,          // 'locked' | 'active' | 'completed'
  type: String             // 'days' | 'amount' | 'habit'
}
```

#### `RefreshTokens`
```js
{
  token: String (hashed),
  userId: ObjectId,
  expiresAt: Date          // TTL index para auto-limpieza
}
```

#### `RecurringTransactions`
```js
{
  userId: ObjectId,
  name: String,
  amount: Number,
  day: Number,             // Día del mes (1-31)
  type: String,
  category: String
}
```

#### `AdminLogs`
```js
{
  action: String,
  performedBy: ObjectId,
  targetUser: ObjectId,
  details: String,
  createdAt: Date
}
```

#### `SystemConfig`
```js
{
  key: String (unique),
  value: Mixed
}
```

---

## 🔐 Autenticación y Seguridad

### Flujo JWT (estándar de industria)

```
1. POST /api/auth/login (email + password)
   → 200 { accessToken (15min), refreshToken (30d) }

2. Cada request protegida:
   → Header: Authorization: Bearer <accessToken>
   → Middleware auth.js verifica y decodifica

3. Si 401 (token expirado):
   → POST /api/auth/refresh { refreshToken }
   → 200 { accessToken nuevo, refreshToken rotado }
   → Reintentar request original

4. POST /api/auth/logout
   → Invalida refreshToken en DB
```

### Google OAuth 2.0
```
Frontend (@react-oauth/google) → Google → id_token
→ POST /api/auth/google { credential: id_token }
→ Backend verifica con google-auth-library
→ Crea/encuentra usuario en DB
→ Retorna accessToken + refreshToken
```

### Seguridad implementada
- ✅ **bcrypt** — Hash de contraseñas con salt
- ✅ **Refresh Token Rotation** — Cada uso invalida el token anterior
- ✅ **Zod validation** — Todos los inputs del servidor validados
- ✅ **express-mongo-sanitize** — Disponible (actualmente en comentario)
- ✅ **express-rate-limit** — Disponible (actualmente en comentario)
- ✅ **helmet** — Disponible (actualmente en comentario)
- ✅ **Admin middleware** — Rutas admin separadas con verificación de rol
- 🔴 **2FA (TOTP)** — `speakeasy` instalado, implementación pendiente

---

## 🤖 Inteligencia Artificial (Gemini)

### Modelo y fallback

El `aiController.js` implementa un sistema de **fallback automático entre modelos**:

```js
// Orden de prioridad para texto (voz)
TEXT_MODELS = [
  { name: "gemini-2.5-flash", ver: "v1beta" },
  { name: "gemini-2.0-flash", ver: "v1beta" },
  { name: "gemini-1.5-flash-8b", ver: "v1beta" },
  { name: "gemini-flash-latest", ver: "v1beta" },
]

// Orden de prioridad para imágenes (multimodal)
IMAGE_MODELS = [
  { name: "gemini-2.5-flash", ver: "v1beta" },
  { name: "gemini-2.0-flash", ver: "v1beta" },
  { name: "gemini-flash-latest", ver: "v1beta" },
]
```

### Estrategia de resiliencia
- **Timeout**: 8 segundos por intento de modelo
- **Multi-key**: Soporta `GEMINI_API_KEY` y `GEMINI_API_KEY_2` en paralelo
- **Rate limit (429)**: Espera 500ms y prueba siguiente key
- **Model 404**: Salta al siguiente modelo automáticamente
- **Logging**: Escribe en `logs/ai_debug.log` (solo desarrollo)

### Endpoints de IA

**`POST /api/ai/parse`** — Parseo de texto/voz
```json
// Request
{ "transcript": "gasté 50 dólares en el mercado" }

// Response
{
  "amount": 50,
  "currency": "USD",
  "type": "expense",
  "category": "Alimentos",
  "description": "Compras en el mercado",
  "date": "2025-02-27",
  "rate_type": null,
  "is_invalid": false
}
```

**`POST /api/ai/image`** — Análisis de imágenes
```json
// Request
{ "image": "data:image/jpeg;base64,..." }

// Response (igual estructura)
```

### Categorías disponibles (español)
`"Alimentos"` | `"Transporte"` | `"Ocio"` | `"Hogar"` | `"Salud"` | `"Sueldo"` | `"Ventas"` | `"Otros"`

---

## 💱 Tasas de Cambio (Venezuela)

### Fuente de datos
**`ve.dolarapi.com`** — API pública venezolana de tasas

### Tasas disponibles
| Clave | Fuente | Descripción |
|---|---|---|
| `bcv` | `/v1/dolares/oficial` | Tasa oficial del Banco Central de Venezuela |
| `usdt` | `/v1/dolares/paralelo` | Tasa paralela (usado como proxy USDT) |
| `euro` | `/v1/euros/oficial` | Euro oficial BCV |

### Cache
```js
// rateService.js
TTL = 600 segundos (10 minutos)
// node-cache en memoria
// Si DolarAPI está caído → valores de fallback hardcodeados
```

### Valores de fallback (hardcodeados)
```js
{ bcv: 396.37, euro: 470.28, usdt: 538.00 }
```

> ⚠️ **Actualizar los fallbacks** cuando haya devaluaciones significativas.

---

## 🧪 Testing

### Unit Tests — Vitest
```bash
npm run test          # vitest run (una sola pasada)
```
- Ubicación: `tests/`
- Enfocados en lógica financiera (cálculos de conversión, validaciones)

### E2E Tests — Playwright
```bash
npm run test:e2e      # playwright test
```
- Archivo: `tests/auth.e2e.test.ts`
- Flujos cubiertos: login, registro, creación de transacciones

### Próximo paso (pendiente)
- Integrar tests con **GitHub Actions** — CI/CD automático en cada push

---

## 🚀 Despliegue

### Desarrollo local
```bash
# Instalar dependencias
npm install

# Iniciar todo (frontend + backend concurrentemente)
npm run dev
# Frontend: http://localhost:3000 (Vite)
# Backend: http://localhost:3001 (node --watch)
```

### Producción — Vercel
```bash
npm run build      # Genera /dist
```

El `vercel.json` configura rewrites:
```json
{
  "/api/(*)" → "/api/index.js"  (serverless function)
  "/(.*)"    → "/index.html"    (SPA fallback)
}
```

> **Nota:** Las variables de entorno deben configurarse en el dashboard de Vercel.

---

## 🔑 Variables de Entorno

Crear `.env.local` en la raíz del proyecto:

```env
# ─── Base de datos ───────────────────────────────────
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/cuentalo

# ─── Autenticación ───────────────────────────────────
JWT_SECRET=un_secreto_muy_largo_y_seguro
JWT_REFRESH_SECRET=otro_secreto_diferente_largo

# ─── Google OAuth ────────────────────────────────────
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx

# ─── Gemini AI ───────────────────────────────────────
GEMINI_API_KEY=AIzaSy...          # Key principal
GEMINI_API_KEY_2=AIzaSy...        # Key de fallback (opcional)

# ─── Email (Nodemailer) ──────────────────────────────
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=correo@gmail.com
MAIL_PASS=app_password_16_chars

# ─── Admin ───────────────────────────────────────────
ADMIN_SECRET=clave_para_crear_primer_admin

# ─── Entorno ─────────────────────────────────────────
NODE_ENV=development              # o 'production'
```

> 🔒 **NUNCA commitear `.env.local` al repositorio.** Está en `.gitignore`.

---

## 📡 API Endpoints

### Auth — `/api/auth`
| Método | Endpoint | Body | Descripción |
|---|---|---|---|
| POST | `/register` | `{ name, email, password }` | Registro de usuario |
| POST | `/login` | `{ email, password }` | Login con JWT |
| POST | `/google` | `{ credential }` | Login con Google OAuth |
| POST | `/refresh` | `{ refreshToken }` | Renovar access token |
| POST | `/logout` | `{ refreshToken }` | Cerrar sesión |
| POST | `/forgot-password` | `{ email }` | Enviar email de recuperación |
| POST | `/reset-password` | `{ token, password }` | Cambiar contraseña |

### Transactions — `/api/transactions` 🔒
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/` | Obtener todas las transacciones del usuario |
| POST | `/` | Crear nueva transacción |
| PUT | `/:id` | Editar transacción |
| DELETE | `/:id` | Soft delete de transacción |

### AI — `/api/ai` 🔒
| Método | Endpoint | Body | Descripción |
|---|---|---|---|
| POST | `/parse` | `{ transcript }` | Parsear texto/voz con Gemini |
| POST | `/image` | `{ image }` | Analizar imagen de recibo |

### Rates — `/api/rates`
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/` | Obtener tasas BCV, USDT, EUR (con cache de 10min) |

### Missions — `/api/missions` 🔒
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/` | Obtener misiones del usuario |
| POST | `/` | Crear misión |
| PUT | `/:id` | Actualizar progreso |

### Recurring — `/api/recurring` 🔒
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/` | Listar transacciones recurrentes |
| POST | `/` | Crear recurrente |
| DELETE | `/:id` | Eliminar recurrente |

### Admin — `/api/admin` 🔒👑
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/users` | Listar todos los usuarios |
| PUT | `/users/:id` | Modificar usuario |
| DELETE | `/users/:id` | Eliminar usuario |
| GET | `/logs` | Obtener logs de auditoría |
| GET | `/config` | Configuración del sistema |

🔒 = Requiere `Authorization: Bearer <accessToken>`  
👑 = Requiere rol `admin`

---

## 📐 Modelos de Datos (TypeScript)

Definidos en `types.ts`:

```typescript
type TransactionType = 'expense' | 'income';
type Currency = 'USD' | 'VES';
type RateType = 'bcv' | 'euro' | 'usdt' | null;

interface Transaction {
  id: string;
  description: string;
  amount: number;        // Almacenado en USD
  category: string;
  date: string;          // YYYY-MM-DD
  type: TransactionType;
  originalAmount?: number;
  originalCurrency?: Currency;
  rateType?: RateType;
  rateValue?: number;    // Tasa al momento del registro
  createdAt?: string;
}

enum AppState {
  IDLE = 'IDLE',
  LISTENING = 'LISTENING',
  TYPING = 'TYPING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

interface SavingsMission {
  id: string;
  code?: string;
  title: string;
  description: string;
  tip: string;
  targetAmount?: number;
  currentProgress: number;
  targetProgress: number;     // 0-100
  status: 'locked' | 'active' | 'completed';
  type: 'days' | 'amount' | 'habit';
  icon: string;
}

interface RecurringTransaction {
  id: string;
  name: string;
  amount: number;
  day: number;           // 1-31
  type: TransactionType;
  category?: string;
}
```

---

## 📏 Convenciones y Reglas

### Código
- **Backend**: JavaScript ES Modules (`.js`), `import/export` native
- **Frontend**: TypeScript estricto (`.tsx`/`.ts`)
- **Alias**: `@/` mapea a la raíz del proyecto (configurado en `vite.config.ts`)
- **Separación**: Lógica de negocio en `services/`, controladores HTTP en `controllers/`

### Naming
- **Componentes**: PascalCase (`VoiceInput.tsx`)
- **Servicios**: camelCase + sufijo Service (`rateService.js`)
- **Rutas**: kebab-case como string (`/api/forgot-password`)
- **Variables de entorno**: UPPER_SNAKE_CASE

### Seguridad
- **API Keys** nunca en el frontend/cliente. Solo en servidor.
- **Vite** no expone variables de entorno al cliente (ver `vite.config.ts` — secciones comentadas)
- **Contraseñas** siempre hasheadas con bcrypt antes de DB
- **Soft Delete**: Las transacciones nunca se eliminan físicamente (`isDeleted: true`)

### Moneda
- **Todas las transacciones se almacenan en USD** en la base de datos
- La conversión se hace en el backend usando la tasa del momento
- El `rateType` y `rateValue` se guardan para trazabilidad histórica

---

## 🗺️ Roadmap

### ✅ Implementado
- [x] Autenticación completa (JWT + Refresh + Google OAuth)
- [x] Validación de datos con Zod
- [x] Caching de tasas de cambio (node-cache, 10min TTL)
- [x] Rate limiting y sanitización NoSQL (disponibles)
- [x] Testing: Vitest (unit) + Playwright (E2E)
- [x] Dashboard con gráficas (Recharts)
- [x] Panel de administración completo
- [x] Misiones de ahorro gamificadas
- [x] Transacciones recurrentes
- [x] Análisis de imágenes con Gemini Vision
- [x] Onboarding tour para nuevos usuarios
- [x] Selección de moneda primaria en onboarding

### 🔴 Pendiente (Alta Prioridad)
- [ ] **PWA / Modo Offline** — Registro sin internet + sync con IndexedDB
- [ ] **Observabilidad** — Sentry (errores) + Winston/Morgan (logs persistentes)
- [ ] **CI/CD** — GitHub Actions para correr tests en cada PR

### 🟡 Pendiente (Media Prioridad)
- [ ] **Presupuestos por categoría** — Alertas de techo de gasto
- [ ] **Análisis de patrones con IA** — "Modo Consejero" Gemini
- [ ] **Exportación PDF** — Reportes mensuales para contabilidad
- [ ] **2FA (TOTP)** — `speakeasy` ya instalado, pendiente UI

### 🔵 Pendiente (Baja Prioridad)
- [ ] **Categorización dinámica** — Gemini reconoce comercios por nombre
- [ ] **Detección de anomalías** — Alertas de gastos inusuales
- [ ] **Auditoría de acciones** — Logs de cambios de contraseña y acciones críticas

---

*Última actualización: Febrero 2026 | Versión del proyecto: 0.0.0*
