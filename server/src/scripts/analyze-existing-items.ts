import { GoogleGenerativeAI } from "@google/generative-ai";
import sqlite3 from 'sqlite3';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface DbItem {
    id: string;
    name: string;
    category: string;
    sub_category: string | null;
    color: string | null;
    occasion: string | null;
}

async function analyzeItem(item: DbItem): Promise<string> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        const prompt = `
        Analyze this clothing item and determine the most appropriate occasion.
        
        Item Details:
        - Name: ${item.name}
        - Category: ${item.category}
        - Sub-category: ${item.sub_category || 'unknown'}
        - Color: ${item.color || 'unknown'}
        
        Return ONLY one word from: formal, casual, sport, family, informal
        
        Guidelines:
        - formal: dress shirts, oxfords, chinos, dress shoes, blazers
        - casual: t-shirts, jeans, sneakers, hoodies
        - sport: joggers, athletic wear, running shoes
        - family: comfortable but presentable items
        - informal: very relaxed items like cargo pants, basic tees
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim().toLowerCase();

        // Validate response
        const validOccasions = ['formal', 'casual', 'sport', 'family', 'informal'];
        if (validOccasions.includes(text)) {
            return text;
        }

        // Default fallback based on category
        if (item.name.toLowerCase().includes('oxford') || item.name.toLowerCase().includes('chino')) {
            return 'formal';
        }
        return 'casual';

    } catch (error) {
        console.error(`Error analyzing ${item.name}:`, error);
        return 'casual'; // Default fallback
    }
}

async function main() {
    const dbPath = path.join(__dirname, '../../wardrobe.db');
    const db = new sqlite3.Database(dbPath);

    console.log('🔍 Fetching items without occasions...\n');

    db.all('SELECT * FROM wardrobe_items WHERE occasion IS NULL OR occasion = ""', [], async (err, rows: DbItem[]) => {
        if (err) {
            console.error('Database error:', err);
            db.close();
            return;
        }

        console.log(`Found ${rows.length} items to analyze\n`);

        for (const item of rows) {
            console.log(`Analyzing: ${item.name}...`);
            const occasion = await analyzeItem(item);

            // Update database
            await new Promise<void>((resolve, reject) => {
                db.run(
                    'UPDATE wardrobe_items SET occasion = ? WHERE id = ?',
                    [occasion, item.id],
                    (err) => {
                        if (err) {
                            console.error(`  ❌ Failed to update ${item.name}`);
                            reject(err);
                        } else {
                            console.log(`  ✅ Set to: ${occasion}\n`);
                            resolve();
                        }
                    }
                );
            });
        }

        console.log('✨ All items analyzed and updated!');
        db.close();
    });
}

main().catch(console.error);
