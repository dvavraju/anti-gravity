export type Category = 'top' | 'bottom' | 'shoes' | 'accessory' | string;

export interface WardrobeItem {
    id: string;
    name: string;
    category: Category;
    subCategory?: string;
    imageUrl?: string;
    color?: string;
    occasion?: string;
    lastWornDate?: string;
    wearCount: number;
}

export interface Outfit {
    id: string;
    items: WardrobeItem[];
    createdAt: string;
}
