
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";

export async function POST(request: NextRequest) {
    try {
        const { url } = await request.json();

        if (!url || !url.includes("chefkoch.de")) {
            return NextResponse.json(
                { error: "Bitte geben Sie eine gültige Chefkoch.de URL ein." },
                { status: 400 }
            );
        }

        const response = await axios.get(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
        });

        const html = response.data;
        const $ = cheerio.load(html);

        // 1. Title
        const title = $("h1").first().text().trim();

        // 2. Description
        const description = $("p.recipe-text").text().trim() || "";

        // 3. Image
        let imageUrl = $('meta[property="og:image"]').attr("content") || "";

        // 4. Ingredients
        let ingredientsText = "";
        $(".ingredients tr").each((_, element) => {
            const amount = $(element).find("td.td-left span").text().trim(); // Menge
            const name = $(element).find("td.td-right span").text().trim();   // Zutat
            // Only add if we have at least a name (amount can be empty for "salt")
            if (name) {
                // Format: "200 g Mehl" or just "Salz"
                const line = amount ? `${amount} ${name}` : name;
                ingredientsText += line + "\n";
            }
        });

        // 5. Instructions
        // Chefkoch puts instructions in a specific block often with class "instructions" or "ds-recipe-meta" parent?
        // Usually it is just text or paragraphs inside a container.
        // Common selector: .ds-recipe-meta ~ div  OR  main article ...
        // Let's try to look for the heading "Zubereitung" and get the text after it.

        // More robust approach for modern Chefkoch layout:
        let instructionsText = "";

        // Try standard selector
        // Often it's in a div that contains the text
        const instructionsBlock = $(".ds-recipe-steps").first(); // Newer design
        if (instructionsBlock.length > 0) {
            instructionsText = instructionsBlock.text().trim();
        } else {
            // Fallback: finding the "Zubereitung" header
            $("h2").each((_, el) => {
                if ($(el).text().trim().includes("Zubereitung")) {
                    instructionsText = $(el).next().text().trim();
                }
            });
        }

        // Cleanup whitespace
        ingredientsText = ingredientsText.trim();
        instructionsText = instructionsText.replace(/\s+/g, " ").trim();


        if (!title) {
            return NextResponse.json({ error: "Rezept konnte nicht geladen werden." }, { status: 500 });
        }

        return NextResponse.json({
            title,
            description,
            ingredients: ingredientsText,
            instructions: instructionsText,
            imageUrl,
        });

    } catch (error) {
        console.error("Import error:", error);
        return NextResponse.json(
            { error: "Fehler beim Importieren des Rezeptes." },
            { status: 500 }
        );
    }
}
