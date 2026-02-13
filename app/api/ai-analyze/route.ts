import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        // Get OpenAI API key from settings
        const apiKeySetting = await db.setting.findUnique({
            where: { key: 'openai_api_key' },
        });

        if (!apiKeySetting?.value) {
            return NextResponse.json(
                { error: "OpenAI API Schlüssel nicht konfiguriert. Bitte im Admin-Dashboard hinzufügen." },
                { status: 400 }
            );
        }

        // Convert file to base64
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64Image = buffer.toString('base64');
        const mimeType = file.type || 'image/jpeg';

        // Prepare the enhanced prompt with focus on quantities and instructions
        const prompt = `Analysiere dieses Bild eines Rezepts SEHR GENAU und extrahiere alle sichtbaren Informationen mit höchster Präzision.

KRITISCHE ANFORDERUNGEN:
1. MENGENANGABEN: Extrahiere EXAKTE Mengenangaben - niemals schätzen oder vereinfachen!
   - Richtig: "200g Mehl", "2 EL Olivenöl", "1 Prise Salz"
   - Falsch: "etwas Mehl", "Olivenöl", "Salz"

2. ZUTATENLISTE: Erfasse ALLE sichtbaren Zutaten vollständig
   - Jede Zutat mit exakter Menge auf einer eigenen Zeile
   - In der Reihenfolge wie im Bild angegeben

3. KOCHANLEITUNG: Extrahiere DETAILLIERTE Schritt-für-Schritt-Anweisungen
   - Jeder Schritt auf einer eigenen Zeile
   - Inkludiere Zeitangaben wenn sichtbar (z.B. "5 Minuten kochen")
   - Inkludiere Temperaturangaben wenn sichtbar (z.B. "bei 180°C backen")
   - Inkludiere wichtige Details (z.B. "unter ständigem Rühren")

4. GENAUIGKEIT: Lies das Bild mehrmals durch und überprüfe deine Extraktion
   - Keine Informationen auslassen
   - Keine Informationen hinzufügen die nicht im Bild sind
   - Bei unleserlichem Text: beste Schätzung basierend auf Kontext

Formatiere die Antwort als JSON:
{
  "title": "Genauer Name des Gerichts wie im Bild",
  "description": "Kurze, ansprechende Beschreibung (max. 150 Zeichen)",
  "ingredients": "Vollständige Zutatenliste mit EXAKTEN Mengen, eine Zutat pro Zeile",
  "instructions": "Detaillierte Schritt-für-Schritt-Anleitung, ein Schritt pro Zeile"
}

Bitte antworte NUR mit dem JSON-Objekt, ohne Markdown-Formatierung oder zusätzlichen Text.`;

        // Call OpenAI API (Vision)
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKeySetting.value}`,
            },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: prompt },
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:${mimeType};base64,${base64Image}`,
                                },
                            },
                        ],
                    },
                ],
                max_tokens: 2000,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('OpenAI API error:', errorData);
            return NextResponse.json(
                { error: `KI-Analyse fehlgeschlagen: ${errorData.error?.message || 'Unbekannter Fehler'}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        const content = data.choices[0].message.content.trim();

        // Remove markdown code blocks if present
        const jsonString = content.replace(/^```json\n?/, '').replace(/\n?```$/, '');

        try {
            const result = JSON.parse(jsonString);
            return NextResponse.json(result);
        } catch (parseError) {
            console.error("Failed to parse AI response:", content);
            return NextResponse.json({
                error: "Die KI hat kein gültiges JSON zurückgegeben.",
                rawResponse: content
            }, { status: 500 });
        }

    } catch (error) {
        console.error("AI Analysis error:", error);
        return NextResponse.json({ error: "Fehler bei der Verbindung zum KI-Dienst." }, { status: 500 });
    }
}
