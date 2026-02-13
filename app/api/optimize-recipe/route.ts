import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { cookies } from 'next/headers';
import { optimizeRecipeForCooking } from '@/lib/openai';

export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
        if (!session.user?.isLoggedIn) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { title, ingredients, instructions } = body;

        if (!title || !ingredients || !instructions) {
            return NextResponse.json(
                { error: 'Title, ingredients, and instructions are required' },
                { status: 400 }
            );
        }

        // Optimize recipe using OpenAI
        const optimizedData = await optimizeRecipeForCooking({
            title,
            ingredients,
            instructions,
        });

        return NextResponse.json(optimizedData);
    } catch (error: any) {
        console.error('Recipe optimization error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to optimize recipe' },
            { status: 500 }
        );
    }
}
