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

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await verifyAdmin();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { role } = body;

    if (!["USER", "ADMIN"].includes(role)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Prevent admin from demoting themselves (optional safety check)
    if (parseInt(id) === session.user?.id) {
        // return NextResponse.json({ error: "Cannot change your own role" }, { status: 403 });
    }

    try {
        await db.user.update({
            where: { id: parseInt(id) },
            data: { role },
        });
        return NextResponse.json({ ok: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await verifyAdmin();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Prevent admin from deleting themselves
    if (parseInt(id) === session.user?.id) {
        return NextResponse.json({ error: "Cannot delete your own account" }, { status: 403 });
    }

    try {
        await db.user.delete({
            where: { id: parseInt(id) },
        });
        return NextResponse.json({ ok: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
    }
}
