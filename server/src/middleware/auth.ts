import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'my-super-secret-key-2024-wardrobe';

// Extend Express Request to carry userId
declare global {
    namespace Express {
        interface Request {
            userId?: string;
            userName?: string;
        }
    }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized: No token provided' });
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; name: string };
        req.userId = decoded.userId;
        req.userName = decoded.name;
        next();
    } catch {
        res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    }
}

export function signToken(userId: string, name: string): string {
    return jwt.sign({ userId, name }, JWT_SECRET, { expiresIn: '30d' });
}
