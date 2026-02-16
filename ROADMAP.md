# 🚀 Hoja de Ruta y Recomendaciones Futuras - Cuéntalo

Este documento detalla las áreas de mejora, nuevas funcionalidades sugeridas y deuda técnica a abordar para llevar la aplicación "Cuéntalo" al nivel de **Robustez 100% (Enterprise Ready)**.

---

## 🏗️ 1. Cimientos y Backend (Robustez Técnica) 🛠️

### **Validación Robusta (Zod / Joi)** ✅ IMPLEMENTADO
*   **Estado:** Finalizado con `Zod`. Los datos están blindados antes de entrar a la DB.

### **Caching de Alto Rendimiento** ✅ IMPLEMENTADO
*   **Solución:** Caché en memoria con `node-cache`. Las tasas de cambio son instantáneas.

### **Testing Automatizado (CI/CD)** ✅ OSB/IMPLEMENTADO
*   **Unit Tests:** Vitest para lógica financiera.
*   **E2E Tests:** Playwright para flujos de usuario.
*   **Próximo Paso:** Integrar con GitHub Actions para que los tests corran antes de cada despliegue.

### **Observabilidad y Monitoreo** 🔴 PENDIENTE (ALTA PRIORIDAD)
*   **Objetivo:** Saber qué falla antes que el usuario.
*   **Acción:** Implementar **Sentry** para captura de errores en tiempo real y **Winston/Morgan** para logs persistentes en el servidor.

---

## 🔒 2. Seguridad Nivel Bancario 🛡️

### **Rate Limiting & Sanitización** ✅ IMPLEMENTADO
*   **Estado:** Protegido contra ataques de fuerza bruta e inyecciones NoSQL.

### **Gestión de Sesiones (Rotation)** ✅ IMPLEMENTADO
*   **Estado:** Refresh Tokens rotativos activos. Máxima protección contra robo de identidad.

### **Autenticación de Dos Factores (2FA)** 🔴 PENDIENTE
*   **Idea:** Solicitar código por Email o App de Autentificación (TOTP) para acciones críticas como borrar cuenta o exportar datos sensibles.

### **Auditoría de Acciones (Admin Logs)** 🟡 EN PROGRESO
*   **Acción:** Registrar cada vez que un usuario cambia su contraseña o realiza transacciones sospechosas.

---

## 🤖 3. Inteligencia Artificial Avanzada (Gemini) ✨

### **Análisis de Salud Financiera** 🔴 PENDIENTE (MEDIA PRIORIDAD)
*   **Función:** "Modo Consejero". La IA analiza el gasto mensual y sugiere recortes basados en patrones históricos.
*   **Detalle:** "Has gastado un 15% más en café que el mes pasado, ¿quieres revisar tu meta de ahorro?".

### **Categorización Automática Dinámica** 🔴 PENDIENTE
*   **Función:** La IA reconoce comercios por nombre (ej: "Farmatodo" -> "Salud") sin intervención del usuario.

### **Detección de Anomalías** 🔴 PENDIENTE
*   **Función:** Notificar si se registra un gasto inusualmente alto para el perfil del usuario.

---

## 📱 4. Experiencia de Usuario (UX/UI) 💎

### **PWA y Modo Offline** 🔴 PENDIENTE (ALTA PRIORIDAD)
*   **Meta:** La app debe funcionar sin internet. Registrar gastos en el bus/metro y sincronizar al detectar Wi-Fi.

### **Presupuestos y Alertas** 🔴 PENDIENTE
*   **Meta:** Definir techos de gasto por categoría con notificaciones visuales de proximidad.

### **Exportación y Reportes** 🔴 PENDIENTE
*   **Acción:** Generador de PDFs con gráficas mensuales para impresión o contabilidad.

---

## 📈 Resumen de Próximas Prioridades

1.  **CRÍTICO:** **Modo Offline (PWA)** - Vital para una herramienta de uso diario fuera de casa.
2.  **ALTA:** **Observabilidad (Sentry/SaaS)** - Para asegurar estabilidad post-lanzamiento.
3.  **MEDIA:** **Presupuestos por Categoría** - La primera función de "valor agregado" para el usuario.
4.  **MEDIA:** **Análisis de Patrones con IA** - La "magia" que diferencia a Cuéntalo de la competencia.

---
*Ultima actualización: 16 de Febrero, 2026*
