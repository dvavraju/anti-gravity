import sqlite3 from 'sqlite3';
import path from 'path';

const db = new sqlite3.Database(path.join(__dirname, '../../wardrobe.db'));

const formalItems = [
    {
        id: Date.now().toString(),
        name: 'White Dress Shirt',
        category: 'top',
        sub_category: 'dress shirt',
        color: 'white',
        occasion: 'formal',
        image_url: 'https://via.placeholder.com/300x400/FFFFFF/000000?text=White+Dress+Shirt'
    },
    {
        id: (Date.now() + 1).toString(),
        name: 'Light Blue Dress Shirt',
        category: 'top',
        sub_category: 'dress shirt',
        color: 'blue',
        occasion: 'formal',
        image_url: 'https://via.placeholder.com/300x400/ADD8E6/000000?text=Blue+Dress+Shirt'
    },
    {
        id: (Date.now() + 2).toString(),
        name: 'Black Dress Shirt',
        category: 'top',
        sub_category: 'dress shirt',
        color: 'black',
        occasion: 'formal',
        image_url: 'https://via.placeholder.com/300x400/000000/FFFFFF?text=Black+Dress+Shirt'
    },
    {
        id: (Date.now() + 3).toString(),
        name: 'Brown Oxford Shoes',
        category: 'shoes',
        sub_category: 'oxford',
        color: 'brown',
        occasion: 'formal',
        image_url: 'https://via.placeholder.com/300x400/8B4513/FFFFFF?text=Brown+Oxfords'
    },
    {
        id: (Date.now() + 4).toString(),
        name: 'Black Leather Loafers',
        category: 'shoes',
        sub_category: 'loafer',
        color: 'black',
        occasion: 'formal',
        image_url: 'https://via.placeholder.com/300x400/000000/FFFFFF?text=Black+Loafers'
    },
    {
        id: (Date.now() + 5).toString(),
        name: 'Navy Dress Pants',
        category: 'bottom',
        sub_category: 'dress pants',
        color: 'navy',
        occasion: 'formal',
        image_url: 'https://via.placeholder.com/300x400/000080/FFFFFF?text=Navy+Dress+Pants'
    }
];

console.log('📦 Adding formal sample items...\n');

formalItems.forEach((item, index) => {
    db.run(
        `INSERT INTO wardrobe_items (id, name, category, sub_category, color, image_url, occasion, wear_count, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, 0, datetime('now'))`,
        [item.id, item.name, item.category, item.sub_category, item.color, item.image_url, item.occasion],
        (err) => {
            if (err) {
                console.error(`❌ Failed to add ${item.name}:`, err.message);
            } else {
                console.log(`✅ Added: ${item.name} (${item.occasion})`);
            }

            if (index === formalItems.length - 1) {
                console.log('\n✨ All formal items added!');
                db.close();
            }
        }
    );
});
