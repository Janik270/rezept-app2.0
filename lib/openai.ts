import { db } from './db';

interface RecipeGenerationParams {
    country: string;
    dishType?: string;
}

interface GeneratedRecipeData {
    title: string;
    description: string;
    ingredients: string;
    instructions: string;
    category: string;
}

/**
 * Generate a recipe using OpenAI GPT
 */
export async function generateRecipe(params: RecipeGenerationParams): Promise<GeneratedRecipeData> {
    const { country, dishType } = params;

    // Get API key from settings
    const apiKeySetting = await db.setting.findUnique({
        where: { key: 'openai_api_key' },
    });

    if (!apiKeySetting?.value) {
        throw new Error('OpenAI API key not configured. Please add it in the admin dashboard.');
    }

    const apiKey = apiKeySetting.value;

    // Construct prompt in German
    const prompt = dishType
        ? `Generiere ein detailliertes Rezept für ${dishType} aus ${country}. Füge einen kreativen Titel hinzu, eine kurze Beschreibung, eine Liste der Zutaten (eine pro Zeile), und Schritt-für-Schritt-Anweisungen (eine pro Zeile). Formatiere die Antwort als JSON mit den Schlüsseln: title, description, ingredients (Array), instructions (Array), category. Alles auf Deutsch.`
        : `Generiere ein detailliertes Rezept für ein traditionelles Gericht aus ${country}. Füge einen kreativen Titel hinzu, eine kurze Beschreibung, eine Liste der Zutaten (eine pro Zeile), und Schritt-für-Schritt-Anweisungen (eine pro Zeile). Formatiere die Antwort als JSON mit den Schlüsseln: title, description, ingredients (Array), instructions (Array), category. Alles auf Deutsch.`;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'Du bist ein professioneller Koch und Rezeptersteller. Generiere Rezepte nur in gültigem JSON-Format und ausschließlich auf Deutsch.',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            temperature: 0.8,
            response_format: { type: 'json_object' },
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const recipe = JSON.parse(content);

    // Convert arrays to newline-separated strings
    return {
        title: recipe.title,
        description: recipe.description,
        ingredients: Array.isArray(recipe.ingredients)
            ? recipe.ingredients.join('\n')
            : recipe.ingredients,
        instructions: Array.isArray(recipe.instructions)
            ? recipe.instructions.join('\n')
            : recipe.instructions,
        category: recipe.category || 'Other',
    };
}

/**
 * Generate an image for a recipe using DALL-E
 */
export async function generateRecipeImage(recipeName: string): Promise<string> {
    // Get API key from settings
    const apiKeySetting = await db.setting.findUnique({
        where: { key: 'openai_api_key' },
    });

    if (!apiKeySetting?.value) {
        throw new Error('OpenAI API key not configured.');
    }

    const apiKey = apiKeySetting.value;

    // Call DALL-E API
    const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'dall-e-3',
            prompt: `A professional, appetizing food photography shot of ${recipeName}. The dish should be beautifully plated on a clean white plate, with natural lighting, shallow depth of field, and garnished elegantly. Restaurant quality presentation.`,
            n: 1,
            size: '1024x1024',
            quality: 'standard',
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        console.error('DALL-E API error:', error);
        // Return null if image generation fails - recipe can still be created without image
        return '';
    }

    const data = await response.json();
    return data.data[0].url;
}

interface OptimizeRecipeParams {
    title: string;
    ingredients: string;
    instructions: string;
}

interface OptimizedRecipeData {
    optimizedInstructions: string;
    tips: string[];
    estimatedTime: string;
}

/**
 * Optimizes a recipe for better cooking results
 * Analyzes ingredients and instructions to create a clearer, more detailed version
 */
export async function optimizeRecipeForCooking(params: OptimizeRecipeParams): Promise<OptimizedRecipeData> {
    const { title, ingredients, instructions } = params;

    // Get API key from settings
    const apiKeySetting = await db.setting.findUnique({
        where: { key: 'openai_api_key' },
    });

    if (!apiKeySetting?.value) {
        throw new Error('OpenAI API key not configured. Please add it in the admin dashboard.');
    }

    const apiKey = apiKeySetting.value;

    // Construct detailed prompt in German
    const prompt = `Du bist ein erfahrener Koch und Kochlehrer. Analysiere das folgende Rezept und erstelle eine optimierte, verständlichere Version für jemanden, der gerade kocht.

REZEPT: ${title}

ZUTATEN:
${ingredients}

ORIGINAL-ANLEITUNG:
${instructions}

AUFGABE:
1. Schreibe die Kochanleitung neu, sodass sie DEUTLICH verständlicher und präziser ist
2. Füge konkrete Zeitangaben hinzu (z.B. "5 Minuten unter Rühren braten")
3. Füge Temperaturangaben hinzu wo sinnvoll (z.B. "bei mittlerer Hitze")
4. Erkläre wichtige Techniken kurz (z.B. "glasig dünsten bedeutet...")
5. Gib 3-5 praktische Kochtipps für bessere Ergebnisse
6. Schätze die Gesamtzubereitungszeit

Formatiere die Antwort als JSON:
{
  "optimizedInstructions": ["Schritt 1 mit Details und Zeitangabe", "Schritt 2...", ...],
  "tips": ["Tipp 1", "Tipp 2", ...],
  "estimatedTime": "z.B. 45 Minuten"
}

WICHTIG: Die optimierten Schritte sollen VIEL detaillierter und verständlicher sein als das Original!`;

    // Call OpenAI API with GPT-4o for better quality
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: 'Du bist ein professioneller Koch und Kochlehrer. Deine Aufgabe ist es, Rezepte so umzuschreiben, dass sie für Hobbyköche leicht verständlich und nachkochbar sind. Antworte immer in gültigem JSON-Format und ausschließlich auf Deutsch.',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            temperature: 0.7,
            response_format: { type: 'json_object' },
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const result = JSON.parse(content);

    // Convert arrays to newline-separated strings
    return {
        optimizedInstructions: Array.isArray(result.optimizedInstructions)
            ? result.optimizedInstructions.join('\n')
            : result.optimizedInstructions,
        tips: Array.isArray(result.tips) ? result.tips : [],
        estimatedTime: result.estimatedTime || 'Nicht angegeben',
    };
}
