import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

// Check if recipes are favorited by the user
export async function POST(request: NextRequest) {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

    if (!session.user?.isLoggedIn) {
        return NextResponse.json({});
    }

    try {
        const { recipeIds } = await request.json();

        if (!Array.isArray(recipeIds)) {
            return NextResponse.json({});
        }

        const favorites = await db.favorite.findMany({
            where: {
                userId: session.user.id,
                recipeId: {
                    in: recipeIds.map((id: any) => parseInt(id)),
                },
            },
        });

        // Return object with recipeId as key and true as value
        const favoriteMap: Record<number, boolean> = {};
        favorites.forEach(fav => {
            favoriteMap[fav.recipeId] = true;
        });

        return NextResponse.json(favoriteMap);
    } catch (error) {
        console.error("Error checking favorites:", error);
        return NextResponse.json({});
    }
}
