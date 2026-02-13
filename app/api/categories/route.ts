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

// GET all categories
export async function GET() {
    try {
        const categories = await db.category.findMany({
            orderBy: { name: "asc" },
        });
        return NextResponse.json(categories);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
    }
}

// POST create new category
export async function POST(request: NextRequest) {
    if (!(await verifyAdmin())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { name } = body;

        if (!name || name.trim() === "") {
            return NextResponse.json({ error: "Category name is required" }, { status: 400 });
        }

        const category = await db.category.create({
            data: { name: name.trim() },
        });

        return NextResponse.json(category);
    } catch (error: any) {
        if (error.code === "P2002") {
            return NextResponse.json({ error: "Category already exists" }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
    }
}

// DELETE category
export async function DELETE(request: NextRequest) {
    if (!(await verifyAdmin())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
        }

        await db.category.delete({
            where: { id: parseInt(id) },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
    }
}
