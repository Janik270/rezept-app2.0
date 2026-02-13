import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

async function verifyAdmin() {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    if (!session.user || !session.user.isLoggedIn || session.user.role !== "ADMIN") {
        return null;
    }
    return session;
}

export async function GET(request: NextRequest) {
    if (!(await verifyAdmin())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const users = await db.user.findMany({
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
            },
            orderBy: { id: "asc" },
        });
        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}
