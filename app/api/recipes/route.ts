import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { cookies } from "next/headers";

export async function GET() {
    const recipes = await db.recipe.findMany({
        orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(recipes);
}

export async function POST(request: NextRequest) {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

    if (!session.user?.isLoggedIn) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    let { title, description, ingredients, instructions, imageUrl, category } = body;

    // Ensure ingredients and instructions are strings (they might be arrays if coming from AI scan)
    if (Array.isArray(ingredients)) {
        ingredients = ingredients.join('\n');
    }
    if (Array.isArray(instructions)) {
        instructions = instructions.join('\n');
    }

    try {
        const recipe = await db.recipe.create({
            data: {
                title,
                description,
                ingredients: ingredients || '',
                instructions: instructions || '',
                imageUrl,
                category: category || 'Other',
            },
        });
        return NextResponse.json(recipe);
    } catch (error) {
        console.error("Recipe creation error:", error);
        return NextResponse.json({ error: "Failed to create recipe" }, { status: 500 });
    }
}
