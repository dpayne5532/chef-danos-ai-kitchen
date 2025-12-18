import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function buildPrompt({
  ingredients,
  dietaryRestrictions,
  tastePreferences,
  mealType,
  servings
}) {
  return `
You are a professional chef and cooking instructor.

Create a complete ${mealType} recipe that serves exactly ${servings} people and that a beginner can successfully cook without guessing.

Ingredients available:
${ingredients}

Dietary restrictions:
${dietaryRestrictions || "None"}

Taste preferences:
${tastePreferences || "None"}

MANDATORY REQUIREMENTS:
- Ingredient quantities scaled for ${servings} servings
- Explicit cooking methods
- Heat levels and exact cook times
- Visual doneness cues
- Internal temperatures for meats
- Clear beginner-friendly instructions

FORMAT:
1. Recipe title
2. Prep time, cook time, servings
3. Ingredients with quantities
4. Step by step cooking instructions
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
  const servings = Math.max(1, Math.min(12, Number(req.body.servings || 2)));

  if (!ingredients) {
    return res.status(400).json({ error: "Ingredients is required." });
  }

  const prompt = buildPrompt({
    ingredients,
    dietaryRestrictions,
    tastePreferences,
    mealType,
    servings
  });

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
  } catch {
    return res.status(500).json({ error: "AI request failed or timed out" });
  } finally {
    clearTimeout(timeout);
  }
});

app.listen(3000, () => {
  console.log("Chef Dano’s AI Kitchen running at http://localhost:3000");
});
