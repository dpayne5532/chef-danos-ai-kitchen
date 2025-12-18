import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/health", async (req, res) => {
    const r = await fetch("http://localhost:11434/api/tags");
    const data = await r.json();
    res.json({
        status: "ok",
        models: (data.models || []).map(m => m.name)
    });
});

function buildPrompt({ ingredients, dietaryRestrictions, tastePreferences, mealType }) {
    return `
You are a professional chef and cooking instructor.

Create a complete ${mealType} recipe that a beginner can successfully cook without guessing.

Ingredients available:
${ingredients}

Dietary restrictions:
${dietaryRestrictions || "None"}

Taste preferences:
${tastePreferences || "None"}

MANDATORY REQUIREMENTS:
- Explicit cooking method for every component (pan, oven, grill, etc.)
- Heat level (low, medium, medium-high, high)
- Exact cook times per step
- Visual doneness cues (color, texture)
- Internal temperature for meats when applicable
- When to flip, stir, rest, or adjust heat
- Do NOT assume prior cooking knowledge

FORMAT:
1. Recipe title
2. Prep time, cook time, servings
3. Ingredients with quantities
4. Step by step cooking instructions with heat and timing
5. Final doneness check
6. Tips and variations
`.trim();
}


app.post("/recipe", async (req, res) => {
    const ingredients = String(req.body.ingredients || "").trim();
    const dietaryRestrictions = String(req.body.dietaryRestrictions || "").trim();
    const tastePreferences = String(req.body.tastePreferences || "").trim();
    const mealType = String(req.body.mealType || "Dinner").trim();
    const model = String(req.body.model || "gemma2:2b").trim();

    if (!ingredients) {
        return res.status(400).json({ error: "Ingredients is required." });
    }

    const prompt = buildPrompt({ ingredients, dietaryRestrictions, tastePreferences, mealType });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 180000);

    try {
        const r = await fetch("http://localhost:11434/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model,
                prompt,
                stream: false,
                options: {
                    temperature: 0.7,
                    num_predict: 500
                }
            })
        });


        if (!r.ok) {
            const txt = await r.text();
            return res.status(500).json({ error: "Ollama request failed", details: txt });
        }

        const data = await r.json();
        return res.json({ recipe: data.response || "" });
    } catch (err) {
        return res.status(500).json({ error: "AI request failed or timed out" });
    } finally {
        clearTimeout(timeout);
    }
});

app.listen(3000, () => {
    console.log("Recipe AI running at http://localhost:3000");
});
