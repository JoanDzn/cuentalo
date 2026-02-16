import { AdminLog } from '../models/AdminLog.js';

export const auditLog = async (type, userId, details, req) => {
    try {
        await AdminLog.create({
            type,
            userId,
            details,
            ip: req.ip,
            device: req.headers['user-agent']
        });
    } catch (e) {
        console.error("Audit Log Creation Failed:", e);
    }
};
