import sqlite3 from 'sqlite3';

// Enable verbose mode for debugging
sqlite3.verbose();

let db: sqlite3.Database;

export const initDB = (): Promise<void> => {
    return new Promise((resolve, reject) => {
       const dbPath = process.env.DB_PATH || './wardrobe.db';
console.log(`Using database at: ${dbPath}`);
db = new sqlite3.Database(dbPath, (err) => {

            if (err) {
                console.error('Error opening database:', err.message);
                reject(err);
            } else {
                console.log('Connected to the SQLite database.');
                createTables();
                resolve();
            }
        });
    });
};

export const getDB = (): sqlite3.Database => {
    if (!db) {
        throw new Error('Database not initialized!');
    }
    return db;
};

const createTables = () => {
    const wardrobeTable = `
    CREATE TABLE IF NOT EXISTS wardrobe_items (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL CHECK(category IN ('top', 'bottom', 'shoes', 'accessory')),
        sub_category TEXT,
        color TEXT,
        image_url TEXT,
        occasion TEXT,
        wear_count INTEGER DEFAULT 0,
        last_worn_date TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    `;

    db.run(wardrobeTable, (err) => {
        if (err) {
            console.error('Error creating wardrobe_items table:', err.message);
        } else {
            console.log('Table "wardrobe_items" ready.');
            // Run migration to add occasion column if it doesn't exist
            migrateOccasionColumn();
        }
    });
};

const migrateOccasionColumn = () => {
    // Check if occasion column exists
    db.all("PRAGMA table_info(wardrobe_items)", [], (err, columns: any[]) => {
        if (err) {
            console.error('Error checking table schema:', err.message);
            return;
        }

        const hasOccasion = columns.some(col => col.name === 'occasion');

        if (!hasOccasion) {
            console.log('Adding occasion column to wardrobe_items...');
            db.run('ALTER TABLE wardrobe_items ADD COLUMN occasion TEXT', (err) => {
                if (err) {
                    console.error('Error adding occasion column:', err.message);
                } else {
                    console.log('Successfully added occasion column.');
                }
            });
        }
    });
};
