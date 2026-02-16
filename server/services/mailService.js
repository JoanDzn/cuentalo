import nodemailer from 'nodemailer';

// Helper to get transporter
const getTransporter = () => {
    return nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

export const mailService = {
    async sendPasswordResetEmail(email, token) {
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/reset-password/${token}`;

        const mailOptions = {
            from: `"Cuentalo Security" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Recuperación de Contraseña - Cuentalo',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #4f46e5; text-align: center;">Cuentalo</h2>
                    <p>Hola,</p>
                    <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente botón para continuar:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Restablecer Contraseña</a>
                    </div>
                    <p>Este enlace expirará en 1 hora.</p>
                    <p>Si no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #888;">Este es un correo automático, por favor no respondas.</p>
                </div>
            `
        };

        return getTransporter().sendMail(mailOptions);
    },

    async send2FACode(email, code) {
        const mailOptions = {
            from: `"Cuentalo Security" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Tu código de seguridad de Cuentalo',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #4f46e5; text-align: center;">Verificación de Seguridad</h2>
                    <p>Para completar la acción solicitada, usa el siguiente código de 6 dígitos:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4f46e5; background: #f3f4f6; padding: 10px 20px; border-radius: 5px;">${code}</span>
                    </div>
                    <p>Si no fuiste tú quien solicitó este código, alguien podría estar intentando acceder a tu cuenta. Te recomendamos cambiar tu contraseña.</p>
                </div>
            `
        };

        return getTransporter().sendMail(mailOptions);
    }
};
