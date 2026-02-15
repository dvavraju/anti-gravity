import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface ItemAnalysis {
    name: string;
    category: 'top' | 'bottom' | 'shoes';
    subCategory: string;
    color: string;
    occasion: string;
}

// Helper to convert base64/buffer to inline usage
function fileToGenerativePart(base64Data: string, mimeType: string) {
    return {
        inlineData: {
            data: base64Data.split(',')[1], // Remove "data:image/jpeg;base64," prefix
            mimeType
        },
    };
}

export async function analyzeClothingItem(
    imageUrl: string,
    userDescription?: string,
    wardrobeContext?: any[]  // User's existing items for personalized learning
): Promise<ItemAnalysis> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        // Build context from user's wardrobe
        const styleContext = wardrobeContext && wardrobeContext.length > 0
            ? `\n\nUser's Style Preferences (learn from these):\n${wardrobeContext.map(item =>
                `- ${item.name}: ${item.category}, ${item.color}, worn for ${item.occasion}`
            ).join('\n')}`
            : '';

        const prompt = `
    Analyze the clothing item in this image.
    User description: ${userDescription || 'None'}
    ${styleContext}
    
    Based on the user's existing wardrobe and style preferences above, classify this new item.
    Pay attention to how they categorize similar colors and styles.
    
    Return ONLY a valid JSON object matching this structure (no markdown, no backticks):
    { 
      "name": "Creative Name", 
      "category": "top" | "bottom" | "shoes", 
      "subCategory": "specific type like hoodie, jeans, etc", 
      "color": "primary color", 
      "occasion": "formal" | "casual" | "sport" | "family" | "informal" 
    }
    `;

        const imagePart = fileToGenerativePart(imageUrl, "image/jpeg");

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown if present
        const jsonStr = text.replace(/```json\n?|\n?```/g, '').trim();
        return JSON.parse(jsonStr) as ItemAnalysis;
    } catch (error) {
        console.error("Gemini Analysis Error:", error);

        // Fallback: Use wardrobe context for smart defaults
        if (wardrobeContext && wardrobeContext.length > 0) {
            // Find most common occasion in user's wardrobe
            const occasionCounts: Record<string, number> = {};
            wardrobeContext.forEach(item => {
                occasionCounts[item.occasion] = (occasionCounts[item.occasion] || 0) + 1;
            });
            const mostCommonOccasion = Object.entries(occasionCounts)
                .sort(([, a], [, b]) => b - a)[0]?.[0] || 'casual';

            return {
                name: "New Clothing Item",
                category: "top",
                subCategory: "shirt",
                color: "blue",
                occasion: mostCommonOccasion as any // Use user's most common occasion
            };
        }

        // Final fallback
        return {
            name: "New Clothing Item",
            category: "top",
            subCategory: "shirt",
            color: "blue",
            occasion: "casual"
        };
    }
}


export async function analyzeWardrobe(items: any[]): Promise<Record<string, number>> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `
    Analyze this wardrobe list and estimate how many UNIQUE viable outfits (top + bottom + shoes) can be created for each occasion.
    
    Wardrobe Items:
    ${items.map(i => `- ${i.name} (${i.category}, ${i.sub_category}, ${i.color}, ${i.occasion})`).join('\n')}
    
    Return ONLY a valid JSON object where keys are occasions (formal, casual, family, sport, informal) and values are the number of outfits. 
    Example: { "formal": 5, "casual": 12 }
    Do not use markdown formatting.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonStr = text.replace(/```json\n?|\n?```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Gemini Wardrobe Analysis Error:", error);

        // Fallback: Count actual outfit combinations per occasion
        const occasions = ['formal', 'casual', 'family', 'sport', 'informal'];
        const counts: Record<string, number> = {};

        for (const occasion of occasions) {
            const occasionItems = items.filter(i => i.occasion === occasion);
            const tops = occasionItems.filter(i => i.category === 'top');
            const bottoms = occasionItems.filter(i => i.category === 'bottom');
            const shoes = occasionItems.filter(i => i.category === 'shoes');

            // Count possible combinations (top × bottom × shoes)
            counts[occasion] = tops.length * bottoms.length * shoes.length;
        }

        return counts;
    }
}

export interface PairingSuggestions {
    tops: any[];
    bottoms: any[];
    shoes: any[];
}

export async function suggestPairings(newItem: ItemAnalysis, existingItems: any[]): Promise<PairingSuggestions> {
    try {
        // Try AI-powered pairing first
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `
        A user just uploaded this new item:
        - Name: ${newItem.name}
        - Category: ${newItem.category}
        - Color: ${newItem.color}
        - Occasion: ${newItem.occasion}
        
        Here are their existing wardrobe items:
        ${existingItems.map(i => `- ${i.name} (${i.category}, ${i.color}, ${i.occasion})`).join('\n')}
        
        Suggest which existing items would pair well with the new item based on:
        1. Color coordination
        2. Style compatibility
        3. Occasion matching
        
        Return ONLY a JSON object with arrays of item names:
        { "tops": ["item1", "item2"], "bottoms": ["item3"], "shoes": ["item4"] }
        
        Only suggest items from different categories than the new item.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonStr = text.replace(/```json\n?|\n?```/g, '').trim();
        const suggestions = JSON.parse(jsonStr);

        // Map names back to full items
        return {
            tops: existingItems.filter(i => suggestions.tops?.includes(i.name)),
            bottoms: existingItems.filter(i => suggestions.bottoms?.includes(i.name)),
            shoes: existingItems.filter(i => suggestions.shoes?.includes(i.name))
        };
    } catch (error) {
        console.error("Gemini Pairing Error, using fallback logic:", error);

        // Fallback: logic-based pairing
        const matchingOccasion = existingItems.filter(i => i.occasion === newItem.occasion);

        // Color coordination rules (simple)
        const colorPairs: Record<string, string[]> = {
            'white': ['blue', 'black', 'navy', 'grey', 'brown', 'beige'],
            'black': ['white', 'grey', 'blue', 'red'],
            'blue': ['white', 'beige', 'brown', 'grey'],
            'navy': ['white', 'beige', 'grey'],
            'grey': ['white', 'black', 'blue', 'navy'],
            'brown': ['white', 'beige', 'blue'],
            'beige': ['blue', 'brown', 'white', 'navy']
        };

        const compatibleColors = colorPairs[newItem.color.toLowerCase()] || [];

        const result: PairingSuggestions = { tops: [], bottoms: [], shoes: [] };

        // Suggest items from different categories
        if (newItem.category !== 'top') {
            result.tops = matchingOccasion
                .filter(i => i.category === 'top' && compatibleColors.includes(i.color?.toLowerCase()))
                .slice(0, 2);
        }

        if (newItem.category !== 'bottom') {
            result.bottoms = matchingOccasion
                .filter(i => i.category === 'bottom' && compatibleColors.includes(i.color?.toLowerCase()))
                .slice(0, 2);
        }

        if (newItem.category !== 'shoes') {
            result.shoes = matchingOccasion
                .filter(i => i.category === 'shoes' && compatibleColors.includes(i.color?.toLowerCase()))
                .slice(0, 2);
        }

        return result;
    }
}
