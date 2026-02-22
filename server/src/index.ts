import express, { Request, Response } from 'express';
import cors from 'cors';
import { initDB, getDB } from './db/index';
import { requireAuth } from './middleware/auth';
import authRoutes from './routes/auth';

const app = express();
const port = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files from client/dist
const path = require('path');
app.use(express.static(path.join(__dirname, '../../client/dist')));

// Initialize Database
initDB().catch(console.error);

// ─── Auth Routes (public) ────────────────────────────────────────────────────
app.use('/auth', authRoutes);

// ─── Helper: map DB row to camelCase ─────────────────────────────────────────
function mapRow(row: any) {
    return {
        id: row.id,
        name: row.name,
        category: row.category,
        subCategory: row.sub_category,
        color: row.color,
        imageUrl: row.image_url,
        occasion: row.occasion,
        wearCount: row.wear_count,
        lastWornDate: row.last_worn_date,
        createdAt: row.created_at,
    };
}

// ─── Wardrobe CRUD (protected) ────────────────────────────────────────────────

// GET /wardrobe - List all items for current user
app.get('/wardrobe', requireAuth, (req: Request, res: Response) => {
    const db = getDB();
    db.all(
        'SELECT * FROM wardrobe_items WHERE user_id = ? ORDER BY created_at DESC',
        [req.userId],
        (err, rows: any[]) => {
            if (err) { res.status(500).json({ error: err.message }); return; }
            res.json({ data: rows.map(mapRow) });
        }
    );
});

// POST /wardrobe - Create new item
app.post('/wardrobe', requireAuth, (req: Request, res: Response) => {
    const { name, category, color, imageUrl, occasion } = req.body;

    if (!name || !category) {
        res.status(400).json({ error: 'Name and Category are required' });
        return;
    }

    const db = getDB();
    const id = Date.now().toString();

    const sql = `INSERT INTO wardrobe_items (id, user_id, name, category, color, image_url, occasion) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const params = [id, req.userId, name, category, color, imageUrl, occasion];

    db.run(sql, params, function (err) {
        if (err) { res.status(500).json({ error: err.message }); return; }
        res.status(201).json({
            data: { id, name, category, color, imageUrl, occasion, wear_count: 0 }
        });
    });
});

// PUT /wardrobe/:id - Update item (only owner can update)
app.put('/wardrobe/:id', requireAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, category, subCategory, color, occasion } = req.body;

    const db = getDB();
    db.run(
        `UPDATE wardrobe_items SET name = ?, category = ?, sub_category = ?, color = ?, occasion = ?
         WHERE id = ? AND user_id = ?`,
        [name, category, subCategory, color, occasion, id, req.userId],
        function (err) {
            if (err) { res.status(500).json({ error: err.message }); return; }
            if (this.changes === 0) { res.status(404).json({ error: 'Item not found' }); return; }
            res.json({ success: true, id });
        }
    );
});

// DELETE /wardrobe/:id - Delete item (only owner)
app.delete('/wardrobe/:id', requireAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    const db = getDB();

    db.run('DELETE FROM wardrobe_items WHERE id = ? AND user_id = ?', [id, req.userId], function (err) {
        if (err) { res.status(500).json({ error: err.message }); return; }
        res.json({ message: 'Item deleted', id });
    });
});

// ─── Wear Logging ─────────────────────────────────────────────────────────────

// POST /wardrobe/:id/wear
app.post('/wardrobe/:id/wear', requireAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    const db = getDB();
    const today = new Date().toISOString().slice(0, 10);

    db.run(
        `UPDATE wardrobe_items SET wear_count = wear_count + 1, last_worn_date = ? WHERE id = ? AND user_id = ?`,
        [today, id, req.userId],
        function (err) {
            if (err) { res.status(500).json({ error: err.message }); return; }
            if (this.changes === 0) { res.status(404).json({ error: 'Item not found' }); return; }
            db.get('SELECT * FROM wardrobe_items WHERE id = ?', [id], (err2, row: any) => {
                if (err2) { res.status(500).json({ error: err2.message }); return; }
                res.json({ data: mapRow(row) });
            });
        }
    );
});

// POST /wardrobe/:id/unwear
app.post('/wardrobe/:id/unwear', requireAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    const db = getDB();

    db.run(
        `UPDATE wardrobe_items SET wear_count = MAX(0, wear_count - 1) WHERE id = ? AND user_id = ?`,
        [id, req.userId],
        function (err) {
            if (err) { res.status(500).json({ error: err.message }); return; }
            res.json({ message: 'Wear undone', id });
        }
    );
});

// ─── Smart Recommendations ────────────────────────────────────────────────────

function weightedRandom(items: any[]): any {
    const now = Date.now();
    const ONE_DAY = 86400000;

    const weighted = items.map(item => {
        const lastWorn = item.last_worn_date ? new Date(item.last_worn_date).getTime() : 0;
        const daysSinceWorn = lastWorn ? (now - lastWorn) / ONE_DAY : 30;
        const weight = Math.max(1, daysSinceWorn) / (1 + item.wear_count * 0.1);
        return { item, weight };
    });

    const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);
    let random = Math.random() * totalWeight;

    for (const w of weighted) {
        random -= w.weight;
        if (random <= 0) return w.item;
    }
    return weighted[weighted.length - 1].item;
}

// GET /recommendations
app.get('/recommendations', requireAuth, (req: Request, res: Response) => {
    const db = getDB();
    const { occasion } = req.query;

    let sql = 'SELECT * FROM wardrobe_items WHERE user_id = ?';
    const params: any[] = [req.userId];

    if (occasion) {
        sql += ' AND occasion = ?';
        params.push(occasion);
    }

    db.all(sql, params, (err, rows: any[]) => {
        if (err) { res.status(500).json({ error: err.message }); return; }

        const tops = rows.filter(item => item.category === 'top');
        const bottoms = rows.filter(item => item.category === 'bottom');
        const shoes = rows.filter(item => item.category === 'shoes');

        if (tops.length === 0 || bottoms.length === 0 || shoes.length === 0) {
            res.status(400).json({
                error: 'Not enough items. Need at least 1 top, 1 bottom, and 1 pair of shoes.',
                missing: { tops: tops.length === 0, bottoms: bottoms.length === 0, shoes: shoes.length === 0 }
            });
            return;
        }

        res.json({
            data: {
                id: Date.now().toString(),
                items: [mapRow(weightedRandom(tops)), mapRow(weightedRandom(bottoms)), mapRow(weightedRandom(shoes))],
                createdAt: new Date().toISOString()
            }
        });
    });
});

// ─── Gemini Integration ───────────────────────────────────────────────────────

import { analyzeClothingItem, analyzeWardrobe, suggestPairings } from './services/gemini';
import { seedDatabase } from './scripts/seed-demo';

// POST /api/debug/seed
app.post('/api/debug/seed', requireAuth, async (req: Request, res: Response) => {
    try {
        await seedDatabase(req.userId!);
        res.json({ message: 'Database seeded with demo data!' });
    } catch (error) {
        console.error("Seeding failed:", error);
        res.status(500).json({ error: 'Failed to seed database' });
    }
});

// POST /api/analyze-item
app.post('/api/analyze-item', requireAuth, async (req: Request, res: Response) => {
    const { imageUrl, description } = req.body;

    if (!imageUrl) {
        res.status(400).json({ error: 'Image URL required' });
        return;
    }

    try {
        const db = getDB();
        const wardrobe = await new Promise<any[]>((resolve, reject) => {
            db.all('SELECT * FROM wardrobe_items WHERE user_id = ?', [req.userId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });

        const analysis = await analyzeClothingItem(imageUrl, description, wardrobe);
        res.json({ data: analysis });
    } catch (error) {
        console.error("Analysis failed:", error);
        res.status(500).json({ error: 'Failed to analyze item' });
    }
});

// GET /api/wardrobe-analysis
app.get('/api/wardrobe-analysis', requireAuth, (req: Request, res: Response) => {
    const db = getDB();

    db.all('SELECT * FROM wardrobe_items WHERE user_id = ?', [req.userId], async (err, rows: any[]) => {
        if (err) { res.status(500).json({ error: err.message }); return; }

        try {
            const counts = await analyzeWardrobe(rows);
            res.json({ data: counts });
        } catch (error) {
            console.error("Wardrobe analysis failed:", error);
            res.status(500).json({ error: 'Failed to analyze wardrobe' });
        }
    });
});

// POST /api/suggest-pairings
app.post('/api/suggest-pairings', requireAuth, async (req: Request, res: Response) => {
    const { newItem } = req.body;

    if (!newItem) {
        res.status(400).json({ error: 'New item data is required' });
        return;
    }

    const db = getDB();

    db.all('SELECT * FROM wardrobe_items WHERE user_id = ?', [req.userId], async (err, rows: any[]) => {
        if (err) { res.status(500).json({ error: err.message }); return; }

        try {
            const mappedRows = rows.map(mapRow);
            const suggestions = await suggestPairings(newItem, mappedRows);
            res.json({ data: suggestions });
        } catch (error) {
            console.error("Pairing suggestion failed:", error);
            res.status(500).json({ error: 'Failed to suggest pairings' });
        }
    });
});

// ─── Catch-all for client-side routing ───────────────────────────────────────
app.get(/.*/, (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
});

// Start Server
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
});
