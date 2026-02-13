import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { cookies } from "next/headers";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const recipe = await db.recipe.findUnique({
        where: { id: parseInt(id) },
    });

    if (!recipe) {
        return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    return NextResponse.json(recipe);
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

    if (!session.user?.isLoggedIn) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, description, ingredients, instructions, imageUrl, category } = body;

    try {
        const recipe = await db.recipe.update({
            where: { id: parseInt(id) },
            data: {
                title,
                description,
                ingredients,
                instructions,
                imageUrl,
                category,
            },
        });
        return NextResponse.json(recipe);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update recipe" }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

    if (!session.user?.isLoggedIn) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    try {
        await db.recipe.delete({
            where: { id: parseInt(id) },
        });
        return NextResponse.json({ ok: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete recipe" }, { status: 500 });
    }
}
