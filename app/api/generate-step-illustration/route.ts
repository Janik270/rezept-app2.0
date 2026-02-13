import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const { stepDescription, recipeName } = await request.json();

        if (!stepDescription) {
            return NextResponse.json(
                { error: 'Step description is required' },
                { status: 400 }
            );
        }

        // Get API key from settings
        const apiKeySetting = await db.setting.findUnique({
            where: { key: 'openai_api_key' },
        });

        if (!apiKeySetting?.value) {
            // Return a placeholder if no API key is configured
            return NextResponse.json({
                imageUrl: '',
            });
        }

        const apiKey = apiKeySetting.value;

        // Generate simple illustration using DALL-E
        const response = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'dall-e-3',
                prompt: `Create a simple, hand-drawn style illustration for this cooking step: "${stepDescription}". The illustration should be minimalist, clean, and easy to understand, like a cookbook illustration. Focus on the main action or ingredient. Recipe context: ${recipeName}. Style: simple line drawing with minimal colors, educational, clear.`,
                n: 1,
                size: '1024x1024',
                quality: 'standard',
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('DALL-E API error:', error);
            // Return empty URL if generation fails
            return NextResponse.json({
                imageUrl: '',
            });
        }

        const data = await response.json();
        const imageUrl = data.data[0].url;

        return NextResponse.json({
            imageUrl,
        });
    } catch (error) {
        console.error('Error generating step illustration:', error);
        return NextResponse.json(
            { error: 'Failed to generate illustration' },
            { status: 500 }
        );
    }
}
