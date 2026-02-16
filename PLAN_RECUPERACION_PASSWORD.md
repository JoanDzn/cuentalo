# 📋 Plan de Implementación: Sistema de Recuperación de Contraseña

Este documento detalla los pasos técnicos y de diseño necesarios para implementar un flujo de recuperación de contraseña seguro y profesional en la plataforma **Cuéntalo**.

---

## 🏗️ 1. Arquitectura del Sistema
El sistema se basará en el uso de **Tokens Criptográficos de Un Solo Uso** con expiración temporal, siguiendo las mejores prácticas de seguridad de OWASP.

### Fases del Flujo:
1.  **Solicitud**: El usuario introduce su correo. El servidor genera un token aleatorio, lo hashea y lo guarda con una fecha de expiración.
2.  **Notificación**: Se envía un correo electrónico al usuario con una URL única que contiene el token original.
3.  **Validación**: El usuario hace clic en el enlace, el frontend extrae el token y lo envía al backend para verificar su validez y tiempo.
4.  **Actualización**: Si es válido, el backend permite guardar la nueva contraseña hasheada y revoca el token.

---

## 🛠️ 2. Requerimientos Técnicos

### Backend (Node.js/Express)
*   **Modelo de Usuario**: Añadir `resetPasswordToken` (String) y `resetPasswordExpire` (Date).
*   **Endpoints**:
    *   `POST /api/auth/forgot-password`: Genera el token y envía el correo.
    *   `POST /api/auth/reset-password/:token`: Valida el token y actualiza la contraseña.
*   **Librerías**: `nodemailer` (envío de correos), `crypto` (generación de tokens seguros).

### Frontend (React/Vite)
*   **Página "Olvidé mi contraseña"**: Formulario simple con validación de email.
*   **Página "Restablecer"**: Formulario con campos de "Nueva Contraseña" y "Confirmar", accesible mediante la ruta dinámica `/auth/reset-password/:token`.

---

## 🔒 3. Consideraciones de Seguridad
*   **Anti-Enumeración**: El servidor siempre debe responder "Si el correo está registrado, recibirás un mensaje", sin confirmar si el email existe o no.
*   **Hash del Token**: Nunca guardar el token original en la base de datos (guardar solo su versión hasheada con SHA-256).
*   **Vencimiento Corto**: Los tokens deben expirar en máximo 1 hora.
*   **Protección por Auditoría**: Registrar cada solicitud fallida o exitosa en la tabla de logs.

---

## 🤖 4. Prompt Robust para Implementación
*Copia y pega este prompt en el chat cuando estés listo para empezar la codificación:*

> "Actúa como un Senior FullStack Engineer. Vamos a implementar un sistema de recuperación de contraseña profesional para mi app MERN. 
> 
> **Requerimientos:**
> 1. Crea un servicio de correo usando Nodemailer con soporte para variables de entorno (EMAIL_USER, EMAIL_PASS).
> 2. Modifica el modelo de Mongoose para incluir campos de reset con expiración.
> 3. Implementa dos rutas en el backend: una para generar el token criptográfico y enviar el email con una plantilla HTML moderna, y otra para validar el token y actualizar la clave usando bcrypt.
> 4. Asegura que el sistema tenga protección contra enumeración de usuarios.
> 5. Crea los componentes de React para el frontend: `ForgotPasswordPage` y `ResetPasswordPage` con validaciones de formulario y feedback visual de carga.
> 6. Integra todo con el sistema de logs (AdminLog) para auditar cada solicitud. 
> 
> Usa un diseño premium acorde a la estética actual de la aplicación (vibrante y fluido)."

---

## 📅 Próximos Pasos
1.  Configurar una cuenta de correo (Gmail App Password sugerido).
2.  Definir la URL base de producción en el `.env`.
3.  Ejecutar la implementación siguiendo el prompt superior.
