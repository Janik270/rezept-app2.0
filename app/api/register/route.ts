import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { username, email, password } = body;

        if (!username || !email || !password) {
            return NextResponse.json(
                { error: "Username, email and password are required" },
                { status: 400 }
            );
        }

        // Check user count - first two users become admins
        const userCount = await db.user.count();
        const isAdminUser = userCount < 2; // First two users are admins

        console.log("Registration attempt:", { username, email, userCount, isAdminUser });

        const existingUser = await db.user.findFirst({
            where: {
                OR: [
                    { username },
                    { email }
                ]
            },
        });

        if (existingUser) {
            const error = existingUser.username === username ? "Username already exists" : "Email already exists";
            return NextResponse.json(
                { error },
                { status: 409 }
            );
        }

        // Note: Storing passwords in plain text to match existing login implementation.
        // In a real production app, this should be hashed.
        await db.user.create({
            data: {
                username,
                email,
                password,
                role: isAdminUser ? "ADMIN" : "USER", // First two users become ADMIN, others are USER
            },
        });

        return NextResponse.json({ ok: true });
    } catch (error: any) {
        console.error("Registration error details:", {
            message: error.message,
            stack: error.stack,
            code: error.code
        });
        return NextResponse.json(
            {
                error: "Dienstfehler: Konnte User nicht erstellen.",
                details: error.message
            },
            { status: 500 }
        );
    }
}
