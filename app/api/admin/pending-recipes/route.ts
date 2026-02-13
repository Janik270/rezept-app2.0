import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        // Check authentication
        const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
        if (!session.user?.isLoggedIn) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is admin
        if (session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Fetch all pending recipes
        const pendingRecipes = await db.generatedRecipe.findMany({
            where: { status: 'PENDING' },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(pendingRecipes);
    } catch (error: any) {
        console.error('Error fetching pending recipes:', error);
        return NextResponse.json(
            { error: 'Failed to fetch pending recipes' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
        if (!session.user?.isLoggedIn) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { title, description, ingredients, instructions, imageUrl, category, country, dishType } = body;

        // Create pending recipe
        const generatedRecipe = await db.generatedRecipe.create({
            data: {
                title,
                description,
                ingredients,
                instructions,
                imageUrl: imageUrl || null,
                category: category || 'Other',
                country,
                dishType: dishType || null,
                userId: session.user.id,
                status: 'PENDING',
            },
        });

        return NextResponse.json(generatedRecipe);
    } catch (error: any) {
        console.error('Error creating pending recipe:', error);
        return NextResponse.json(
            { error: 'Failed to create pending recipe' },
            { status: 500 }
        );
    }
}
