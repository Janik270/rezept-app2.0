import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { cookies } from 'next/headers';
import { generateRecipe, generateRecipeImage } from '@/lib/openai';

export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
        if (!session.user?.isLoggedIn) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { country, dishType } = body;

        if (!country) {
            return NextResponse.json({ error: 'Country is required' }, { status: 400 });
        }

        // Generate recipe using OpenAI
        const recipe = await generateRecipe({ country, dishType });

        // No automatic image generation - images should come from original source
        const imageUrl = '';

        return NextResponse.json({
            ...recipe,
            imageUrl,
            country,
            dishType: dishType || null,
        });
    } catch (error: any) {
        console.error('Recipe generation error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate recipe' },
            { status: 500 }
        );
    }
}
