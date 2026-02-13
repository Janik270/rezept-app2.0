import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
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
        const settings = await db.setting.findMany();
        const settingsMap = settings.reduce((acc: any, s: any) => {
            acc[s.key] = s.value;
            return acc;
        }, {});
        return NextResponse.json(settingsMap);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    if (!(await verifyAdmin())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { key, value } = body;

        if (!key) {
            return NextResponse.json({ error: "Key is required" }, { status: 400 });
        }

        const setting = await db.setting.upsert({
            where: { key },
            update: { value },
            create: { key, value },
        });

        return NextResponse.json(setting);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update setting" }, { status: 500 });
    }
}
