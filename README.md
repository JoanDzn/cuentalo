# 💸 Cuéntalo

> Aplicación web de gestión de finanzas personales con entrada por voz e IA, diseñada para el contexto venezolano.

📖 **Para documentación completa de arquitectura, tecnologías y endpoints:** [`AGENTS.md`](./AGENTS.md)

---

## ✨ Características

- 🎤 **Entrada por voz** — Registra gastos con comandos en español natural
- 📷 **Escaneo de recibos** — Análisis de imágenes con Gemini Vision
- 💱 **Multi-moneda** — USD y VES con tasas BCV, paralelo y euro en tiempo real
- 🤖 **IA con Gemini** — Categorización y parseo automático
- 🔐 **Auth segura** — JWT + Refresh Tokens rotativos + Google OAuth
- 🎯 **Misiones de ahorro** — Sistema gamificado de metas financieras
- 📊 **Dashboard interactivo** — Gráficas y análisis de tus finanzas
- 👑 **Panel de administración** — Gestión de usuarios y sistema

---

## 🚀 Inicio Rápido

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz:

```env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/cuentalo
JWT_SECRET=tu_secreto_jwt
JWT_REFRESH_SECRET=tu_secreto_refresh
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GEMINI_API_KEY=AIzaSy...
MAIL_USER=correo@gmail.com
MAIL_PASS=tu_app_password
```

> Ver [`AGENTS.md#variables-de-entorno`](./AGENTS.md#-variables-de-entorno) para la lista completa.

### 3. Ejecutar en desarrollo

```bash
npm run dev
```

Esto inicia simultáneamente:
- 🖥️ **Frontend** (Vite) → `http://localhost:3000`
- 🔧 **Backend** (Express) → con `node --watch`

---

## 🛠️ Scripts disponibles

```bash
npm run dev        # Frontend + Backend concurrentemente
npm run client     # Solo Vite (frontend)
npm run server     # Solo Express (backend, con hot-reload)
npm run build      # Build de producción
npm run preview    # Preview del build
npm run test       # Unit tests con Vitest
npm run test:e2e   # Tests E2E con Playwright
```

---

## 🏗️ Stack

| Capa | Tecnología |
|---|---|
| **Frontend** | React 19 + TypeScript + Vite |
| **Estilos** | Vanilla CSS + Framer Motion |
| **Backend** | Express 5 + Node.js (ESM) |
| **Base de datos** | MongoDB Atlas + Mongoose |
| **IA** | Google Gemini 2.5 Flash |
| **Auth** | JWT + Google OAuth 2.0 |
| **Deploy** | Vercel |

---

## 📚 Documentación

| Documento | Descripción |
|---|---|
| [`AGENTS.md`](./AGENTS.md) | Arquitectura completa, endpoints, modelos, convenciones |
| [`ROADMAP.md`](./ROADMAP.md) | Funcionalidades pendientes y prioridades |
| [`MIGRATION_PLAN.md`](./MIGRATION_PLAN.md) | Plan de migración local → MongoDB |

---

*Versión 0.0.0 — Última actualización: Febrero 2026*
