import { getDB } from '../db/index';

// Categories from OccasionGrid
const CATEGORIES = ['formal', 'casual', 'family', 'sport', 'informal'];

// Reliable images from Unsplash (using specific photo IDs to ensure they exist and look good)
const IMAGES = {
    formal: {
        top: [
            'https://images.unsplash.com/photo-1621072118058-10c160e23e8e?auto=format&fit=crop&w=400&q=80', // White Shirt
            'https://images.unsplash.com/photo-1594938298603-c8148c472f56?auto=format&fit=crop&w=400&q=80', // Blazer
            'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=400&q=80', // Blue Shirt
        ],
        bottom: [
            'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=400&q=80', // Trousers
            'https://images.unsplash.com/photo-1594938374189-d62ee55e6172?auto=format&fit=crop&w=400&q=80', // Grey Pants
            'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=400&q=80', // Black Slacks
        ],
        shoes: [
            'https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&w=400&q=80', // Leather Shoes
            'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=400&q=80', // Oxfords
            'https://images.unsplash.com/photo-1478186111890-c81206cec9d5?auto=format&fit=crop&w=400&q=80', // Dress Shoes
        ]
    },
    casual: {
        top: [
            'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&q=80', // T-Shirt
            'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=400&q=80', // Black Tee
            'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=400&q=80', // Hoodie
        ],
        bottom: [
            'https://images.unsplash.com/photo-1542272617-08f086302291?auto=format&fit=crop&w=400&q=80', // Jeans
            'https://images.unsplash.com/photo-1584370848010-d7cc637703ef?auto=format&fit=crop&w=400&q=80', // Chinos
            'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=400&q=80', // Denim
        ],
        shoes: [
            'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=400&q=80', // Sneakers
            'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=400&q=80', // Vans
            'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=400&q=80', // Converse
        ]
    },
    sport: {
        top: [
            'https://images.unsplash.com/photo-1518459031867-a89b944bffe4?auto=format&fit=crop&w=400&q=80', // Gym Shirt
            'https://images.unsplash.com/photo-1571945153262-8546553c8731?auto=format&fit=crop&w=400&q=80', // Tank
            'https://images.unsplash.com/photo-1519058082700-08a0b56da9b4?auto=format&fit=crop&w=400&q=80', // Jersey
        ],
        bottom: [
            'https://images.unsplash.com/photo-1517438476312-10d79c077509?auto=format&fit=crop&w=400&q=80', // Shorts
            'https://images.unsplash.com/photo-1629857999719-2166946654e5?auto=format&fit=crop&w=400&q=80', // Leggings/Joggers
            'https://images.unsplash.com/photo-1629858000301-831e5055b850?auto=format&fit=crop&w=400&q=80', // Track Pants
        ],
        shoes: [
            'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80', // Red Nike
            'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=400&q=80', // Green Shoe
            'https://images.unsplash.com/photo-1605348532760-6753d5c43329?auto=format&fit=crop&w=400&q=80', // Blue Running
        ]
    },
    family: { // Cozy / Nice Casual
        top: [
            'https://images.unsplash.com/photo-1620799140408-ed5341cd2431?auto=format&fit=crop&w=400&q=80', // Knit Sweater
            'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=400&q=80', // White Cloth
            'https://images.unsplash.com/photo-1621072118058-10c160e23e8e?auto=format&fit=crop&w=400&q=80', // Polo
        ],
        bottom: [
            'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=400&q=80', // Shorts
            'https://images.unsplash.com/photo-1542272617-08f086302291?auto=format&fit=crop&w=400&q=80', // Jeans
            'https://images.unsplash.com/photo-1584370848010-d7cc637703ef?auto=format&fit=crop&w=400&q=80', // Beige Pants
        ],
        shoes: [
            'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=400&q=80', // Boots
            'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=400&q=80', // Casual Sneaker
            'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=400&q=80', // Loafers
        ]
    },
    informal: { // Streetwear / Relaxed
        top: [
            'https://images.unsplash.com/photo-1503342394128-c104d54dba01?auto=format&fit=crop&w=400&q=80', // Graphic Tee
            'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=400&q=80', // Hoodie
            'https://images.unsplash.com/photo-1554568218-0f1715e72254?auto=format&fit=crop&w=400&q=80', // Oversized Tee
        ],
        bottom: [
            'https://images.unsplash.com/photo-1555689502-c4b22b7abc53?auto=format&fit=crop&w=400&q=80', // Ripped Jeans
            'https://images.unsplash.com/photo-1582552938357-32b906df40cb?auto=format&fit=crop&w=400&q=80', // Cargo Pants
            'https://images.unsplash.com/photo-1517438476312-10d79c077509?auto=format&fit=crop&w=400&q=80', // Sweat Shorts
        ],
        shoes: [
            'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=400&q=80', // Air Jordans style
            'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?auto=format&fit=crop&w=400&q=80', // White Nikes
            'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=400&q=80', // High tops
        ]
    }
};

const ITEMS_PER_CATEGORY = 3; // 3 tops, 3 bottoms, 3 shoes = 9 items per cat

export async function seedDatabase(userId: string) {
    const db = getDB();

    // 1. Clear existing items for this user
    console.log('Clearing existing wardrobe items for user...');
    await new Promise<void>((resolve, reject) => {
        db.run('DELETE FROM wardrobe_items WHERE user_id = ?', [userId], (err) => {
            if (err) reject(err);
            else resolve();
        });
    });

    console.log('Seeding new demo items...');

    const stmt = db.prepare('INSERT INTO wardrobe_items (id, user_id, name, category, sub_category, color, image_url, occasion, wear_count, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');

    const now = new Date().toISOString();

    for (const category of CATEGORIES) {
        // @ts-ignore
        const currentCatImages = IMAGES[category] || IMAGES['casual']; // fallback

        // Add 3 Tops
        for (let i = 0; i < ITEMS_PER_CATEGORY; i++) {
            const id = `demo_${category}_top_${i + 1}_${userId}`;
            const name = `${category.charAt(0).toUpperCase() + category.slice(1)} Top ${i + 1}`;
            const img = currentCatImages.top[i % 3];
            stmt.run(id, userId, name, 'top', 'shirt', 'mixed', img, category, 0, now);
        }

        // Add 3 Bottoms
        for (let i = 0; i < ITEMS_PER_CATEGORY; i++) {
            const id = `demo_${category}_bottom_${i + 1}_${userId}`;
            const name = `${category.charAt(0).toUpperCase() + category.slice(1)} Bottom ${i + 1}`;
            const img = currentCatImages.bottom[i % 3];
            stmt.run(id, userId, name, 'bottom', 'pants', 'mixed', img, category, 0, now);
        }

        // Add 3 Shoes
        for (let i = 0; i < ITEMS_PER_CATEGORY; i++) {
            const id = `demo_${category}_shoe_${i + 1}_${userId}`;
            const name = `${category.charAt(0).toUpperCase() + category.slice(1)} Shoes ${i + 1}`;
            const img = currentCatImages.shoes[i % 3];
            stmt.run(id, userId, name, 'shoes', 'footwear', 'mixed', img, category, 0, now);
        }
    }

    stmt.finalize();
    console.log('✅ Seeding complete!');
    return true;
}
