import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

    if (!session.user?.isLoggedIn) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Get OpenAI API key from settings
        const apiKeySetting = await db.setting.findUnique({
            where: { key: 'openai_api_key' },
        });

        if (!apiKeySetting?.value) {
            return NextResponse.json(
                { error: "OpenAI API key not configured. Please add it in the admin dashboard." },
                { status: 400 }
            );
        }

        const user = await db.user.findUnique({
            where: { id: session.user.id },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Generate profile image using OpenAI DALL-E
        const prompt = `A professional, friendly avatar for a user named ${user.username}. Modern, colorful, abstract geometric style with warm colors. Simple and clean design suitable for a profile picture.`;

        const response = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKeySetting.value}`,
            },
            body: JSON.stringify({
                model: "dall-e-3",
                prompt: prompt,
                n: 1,
                size: "1024x1024",
                quality: "standard",
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('OpenAI API error:', errorData);
            return NextResponse.json(
                { error: `Failed to generate image: ${errorData.error?.message || 'Unknown error'}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        const imageUrl = data.data[0].url;

        // Update user's profile image URL
        const updatedUser = await db.user.update({
            where: { id: session.user.id },
            data: { profileImageUrl: imageUrl },
        });

        // Update session
        session.user.profileImageUrl = imageUrl;
        await session.save();

        return NextResponse.json({
            success: true,
            imageUrl: imageUrl,
            message: "Profile image generated successfully!"
        });
    } catch (error) {
        console.error('Error generating profile image:', error);
        return NextResponse.json(
            { error: "Failed to generate profile image" },
            { status: 500 }
        );
    }
}
