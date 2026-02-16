import nodemailer from 'nodemailer';

/**
 * Servicio centralizado para el envío de correos electrónicos
 */
const getTransporter = () => {
    // En entornos de producción, se usaría un servicio como SendGrid o AWS SES
    // Para desarrollo, Gmail con App Passwords es la opción estándar
    return nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

export const mailService = {
    /**
     * Envía un correo con el enlace de recuperación de contraseña
     */
    async sendRecoveryEmail(email, token, name) {
        const frontendUrl = process.env.VITE_FRONTEND_URL || 'http://localhost:5173';
        const resetUrl = `${frontendUrl}/auth/reset-password/${token}`;

        const mailOptions = {
            from: `"Cuéntalo Seguridad" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Recupera tu acceso a Cuéntalo',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="color: white; margin: 0; font-size: 28px;">Cuéntalo</h1>
                    </div>
                    <div style="padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px; background: white;">
                        <h2 style="color: #111827; margin-top: 0;">Hola, ${name || 'Usuario'}</h2>
                        <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">
                            Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. 
                            Si no fuiste tú, puedes ignorar este mensaje de forma segura.
                        </p>
                        <div style="text-align: center; margin: 35px 0;">
                            <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);">
                                Restablecer Contraseña ahora
                            </a>
                        </div>
                        <p style="font-size: 14px; color: #6b7280; margin-bottom: 0;">
                            Este enlace expirará en 1 hora por motivos de seguridad. 
                        </p>
                        <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 25px 0;">
                        <p style="font-size: 12px; color: #9ca3af; text-align: center;">
                            © 2026 Cuéntalo - Gestión Financiera Inteligente
                        </p>
                    </div>
                </div>
            `
        };

        try {
            const info = await getTransporter().sendMail(mailOptions);
            console.log('Recovery email sent:', info.messageId);
            return true;
        } catch (error) {
            console.error('Nodemailer Error:', error);
            throw new Error('No se pudo enviar el correo de recuperación.');
        }
    }
};
