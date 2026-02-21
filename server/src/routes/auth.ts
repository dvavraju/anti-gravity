import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { getDB } from '../db/index';
import { signToken, requireAuth } from '../middleware/auth';

const router = Router();

// POST /auth/signup
router.post('/signup', async (req: Request, res: Response) => {
    const { name, password } = req.body;

    if (!name || !password) {
        res.status(400).json({ error: 'Name and password are required' });
        return;
    }

    if (name.trim().length < 2) {
        res.status(400).json({ error: 'Name must be at least 2 characters' });
        return;
    }

    if (password.length < 4) {
        res.status(400).json({ error: 'Password must be at least 4 characters' });
        return;
    }

    const db = getDB();

    // Check if name is already taken
    db.get('SELECT id FROM users WHERE LOWER(name) = LOWER(?)', [name.trim()], async (err, existing: any) => {
        if (err) {
            res.status(500).json({ error: 'Database error' });
            return;
        }

        if (existing) {
            res.status(409).json({ error: 'That name is already taken. Try another.' });
            return;
        }

        try {
            const passwordHash = await bcrypt.hash(password, 10);
            const userId = crypto.randomUUID();

            db.run(
                'INSERT INTO users (id, name, password_hash) VALUES (?, ?, ?)',
                [userId, name.trim(), passwordHash],
                (insertErr) => {
                    if (insertErr) {
                        res.status(500).json({ error: 'Failed to create account' });
                        return;
                    }

                    const token = signToken(userId, name.trim());
                    res.status(201).json({ token, user: { id: userId, name: name.trim() } });
                }
            );
        } catch {
            res.status(500).json({ error: 'Failed to create account' });
        }
    });
});

// POST /auth/login
router.post('/login', (req: Request, res: Response) => {
    const { name, password } = req.body;

    if (!name || !password) {
        res.status(400).json({ error: 'Name and password are required' });
        return;
    }

    const db = getDB();

    db.get('SELECT * FROM users WHERE LOWER(name) = LOWER(?)', [name.trim()], async (err, user: any) => {
        if (err) {
            res.status(500).json({ error: 'Database error' });
            return;
        }

        if (!user) {
            res.status(401).json({ error: 'No account found with that name' });
            return;
        }

        try {
            const valid = await bcrypt.compare(password, user.password_hash);
            if (!valid) {
                res.status(401).json({ error: 'Incorrect password' });
                return;
            }

            const token = signToken(user.id, user.name);
            res.json({ token, user: { id: user.id, name: user.name } });
        } catch {
            res.status(500).json({ error: 'Login failed' });
        }
    });
});

// GET /auth/me — validate current token and return user info
router.get('/me', requireAuth, (req: Request, res: Response) => {
    res.json({ user: { id: req.userId, name: req.userName } });
});

export default router;
