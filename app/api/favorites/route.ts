import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

// Toggle favorite (add or remove)
export async function POST(request: NextRequest) {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

    if (!session.user?.isLoggedIn) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { recipeId } = await request.json();

        if (!recipeId) {
            return NextResponse.json({ error: "Recipe ID is required" }, { status: 400 });
        }

        // Check if favorite already exists
        const existingFavorite = await db.favorite.findUnique({
            where: {
                userId_recipeId: {
                    userId: session.user.id,
                    recipeId: parseInt(recipeId),
                },
            },
        });

        if (existingFavorite) {
            // Remove favorite
            await db.favorite.delete({
                where: {
                    id: existingFavorite.id,
                },
            });
            return NextResponse.json({ isFavorite: false });
        } else {
            // Add favorite
            await db.favorite.create({
                data: {
                    userId: session.user.id,
                    recipeId: parseInt(recipeId),
                },
            });
            return NextResponse.json({ isFavorite: true });
        }
    } catch (error) {
        console.error("Error toggling favorite:", error);
        return NextResponse.json({ error: "Failed to toggle favorite" }, { status: 500 });
    }
}

// Get user's favorites
export async function GET() {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

    if (!session.user?.isLoggedIn) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const favorites = await db.favorite.findMany({
            where: {
                userId: session.user.id,
            },
            include: {
                recipe: true,
            },
        });

        const recipes = favorites.map(fav => fav.recipe);
        return NextResponse.json(recipes);
    } catch (error) {
        console.error("Error fetching favorites:", error);
        return NextResponse.json({ error: "Failed to fetch favorites" }, { status: 500 });
    }
}
