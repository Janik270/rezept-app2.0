import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const { id } = await params;
        const body = await request.json();
        const { action } = body;

        if (!action || !['approve', 'reject'].includes(action)) {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        // Find the generated recipe
        const generatedRecipe = await db.generatedRecipe.findUnique({
            where: { id: parseInt(id) },
        });

        if (!generatedRecipe) {
            return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
        }

        if (action === 'approve') {
            // Create a new recipe from the generated recipe
            await db.recipe.create({
                data: {
                    title: generatedRecipe.title,
                    description: generatedRecipe.description,
                    ingredients: generatedRecipe.ingredients,
                    instructions: generatedRecipe.instructions,
                    imageUrl: generatedRecipe.imageUrl,
                    category: generatedRecipe.category,
                },
            });

            // Update status to approved
            await db.generatedRecipe.update({
                where: { id: parseInt(id) },
                data: { status: 'APPROVED' },
            });

            return NextResponse.json({ message: 'Recipe approved and added to collection' });
        } else {
            // Update status to rejected
            await db.generatedRecipe.update({
                where: { id: parseInt(id) },
                data: { status: 'REJECTED' },
            });

            return NextResponse.json({ message: 'Recipe rejected' });
        }
    } catch (error: any) {
        console.error('Error processing recipe approval:', error);
        return NextResponse.json(
            { error: 'Failed to process recipe approval' },
            { status: 500 }
        );
    }
}
