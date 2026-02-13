import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
    const body = await request.json();
    const { username, password } = body;

    const user = await db.user.findFirst({
        where: { username },
    });

    if (!user || user.password !== password) {
        return NextResponse.json(
            { error: "Invalid username or password" },
            { status: 401 }
        );
    }

    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    session.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        profileImageUrl: user.profileImageUrl || undefined,
        isLoggedIn: true,
    };
    await session.save();

    return NextResponse.json({ ok: true });
}
