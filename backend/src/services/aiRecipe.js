import { ENV } from "../config/env.js";
import { getRecipeImage } from "../utils/recipeImages.js";
import { correctFoodSpelling, correctIngredientList } from "../utils/spellCorrect.js";

function parseDishName(query = "", dishName = "") {
  let dish = dishName || query;
  dish = dish
    .replace(/how to (cook|make|prepare|prepare a)\s*/gi, "")
    .replace(/recipe for\s*/gi, "")
    .replace(/make something with\s*/gi, "")
    .replace(/what can i make with\s*/gi, "")
    .replace(/\?/g, "")
    .trim();
  return dish;
}

const RECIPE_RULES = `
Rules you MUST follow:
- User input may have spelling mistakes — infer the correct dish/ingredient names and use proper spelling in output.
- Provide 10 to 15 ingredients. Each ingredient MUST have exact quantity with units (cups, tbsp, tsp, grams, ml, pieces).
- Provide 8 to 12 detailed cooking steps. Each step must be 2-4 sentences explaining WHAT to do, HOW to do it, heat level, and exact timing.
- Steps must be in correct cooking order: prep → cook → finish → serve.
- Write like a professional cooking teacher — clear enough for a complete beginner.
- Never leave ingredients or steps empty or vague.
`;

function buildMockRecipe({ ingredients = [], dish = "" }) {
  const isDish = Boolean(dish);
  const title = isDish
    ? `Authentic ${dish.charAt(0).toUpperCase()}${dish.slice(1)}`
    : `${ingredients[0] || "Chef"} Special Bowl`;
  const list = ingredients.join(", ");

  const dishIngredients = {
    biryani: [
      { name: "Basmati rice", quantity: "2 cups (soaked 30 mins)" },
      { name: "Chicken or vegetables", quantity: "500g" },
      { name: "Onions", quantity: "3 large, thinly sliced" },
      { name: "Yogurt", quantity: "1/2 cup" },
      { name: "Ginger-garlic paste", quantity: "2 tbsp" },
      { name: "Biryani masala", quantity: "2 tbsp" },
      { name: "Ghee", quantity: "4 tbsp" },
      { name: "Saffron milk", quantity: "1/4 cup warm milk + pinch saffron" },
      { name: "Mint & coriander", quantity: "1/2 cup each, chopped" },
      { name: "Salt", quantity: "to taste" },
    ],
    pasta: [
      { name: "Pasta", quantity: "300g" },
      { name: "Olive oil", quantity: "2 tbsp" },
      { name: "Garlic", quantity: "4 cloves, minced" },
      { name: "Heavy cream", quantity: "1 cup" },
      { name: "Parmesan cheese", quantity: "1/2 cup grated" },
      { name: "Salt & black pepper", quantity: "to taste" },
      { name: "Fresh basil", quantity: "for garnish" },
    ],
  };

  const dishSteps = {
    biryani: [
      "Wash and soak basmati rice for 30 minutes. Par-boil rice with whole spices until 70% cooked, then drain.",
      "Marinate chicken/vegetables with yogurt, ginger-garlic paste, biryani masala, and salt for at least 30 minutes.",
      "Heat ghee in a heavy pot. Fry sliced onions until golden brown. Remove half for garnish.",
      "Add marinated ingredients to the pot. Cook on medium heat for 10-12 minutes until partially done.",
      "Layer par-boiled rice over the curry. Top with fried onions, mint, coriander, and saffron milk.",
      "Seal the pot with foil and lid. Cook on low flame (dum) for 20-25 minutes.",
      "Turn off heat and let it rest 10 minutes. Gently mix layers before serving hot with raita.",
    ],
    pasta: [
      "Bring a large pot of salted water to boil. Cook pasta until al dente (8-10 mins). Reserve 1/2 cup pasta water.",
      "Heat olive oil in a pan. Sauté minced garlic until fragrant (30 seconds), do not brown.",
      "Pour in cream and simmer gently for 3-4 minutes until slightly thickened.",
      "Add grated parmesan and stir until melted into a smooth sauce.",
      "Toss drained pasta in the sauce. Add pasta water if needed for silky consistency.",
      "Season with salt and pepper. Garnish with fresh basil and serve immediately.",
    ],
  };

  const dishKey = Object.keys(dishIngredients).find((k) => dish.toLowerCase().includes(k));

  return {
    title,
    ingredients: isDish
      ? dishIngredients[dishKey] || [
          { name: "Main ingredient", quantity: "500g" },
          { name: "Onion", quantity: "2 medium, chopped" },
          { name: "Tomato", quantity: "2 large, chopped" },
          { name: "Ginger-garlic paste", quantity: "1 tbsp" },
          { name: "Turmeric powder", quantity: "1/2 tsp" },
          { name: "Red chili powder", quantity: "1 tsp" },
          { name: "Garam masala", quantity: "1 tsp" },
          { name: "Cooking oil or ghee", quantity: "3 tbsp" },
          { name: "Salt", quantity: "to taste" },
          { name: "Fresh coriander", quantity: "2 tbsp, chopped" },
        ]
      : ingredients.map((name, i) => ({
          name,
          quantity: i === 0 ? "2 cups" : i === 1 ? "1 tbsp" : "as needed",
        })),
    steps: isDish
      ? dishSteps[dishKey] || [
          `Wash, peel, and chop all ingredients needed for ${dish}.`,
          "Heat oil in a pan on medium flame. Add whole spices and let them crackle.",
          "Add onions and sauté until golden. Stir in ginger-garlic paste for 1 minute.",
          "Add tomatoes and dry spices. Cook until oil separates from the masala.",
          `Add the main ingredient for ${dish}. Cook covered on medium-low heat until tender.`,
          "Adjust salt and consistency. Garnish with fresh herbs and serve hot.",
        ]
      : [
          `Prep and wash all ingredients: ${list}.`,
          "Heat a pan with 2 tbsp oil on medium heat. Sauté onions until translucent.",
          `Add ${ingredients[0] || "main ingredient"} and cook for 5-7 minutes, stirring often.`,
          "Season with salt, pepper, and spices. Add remaining ingredients one by one.",
          "Cover and simmer on low heat for 10-15 minutes until everything is cooked through.",
          "Taste and adjust seasoning. Garnish and serve hot.",
        ],
    cookingTime: isDish ? "45 mins" : "25 mins",
    difficulty: isDish ? "Medium" : "Easy",
    calories: isDish ? 420 : 380,
    nutrition: { protein: "18g", carbs: "42g", fat: "12g" },
    tips: isDish
      ? `For best ${dish}, cook on low heat and let flavors develop slowly.`
      : `Great combo with ${ingredients.slice(0, 2).join(" & ")}. Add fresh herbs before serving.`,
    imageSearchTerm: isDish ? dish : ingredients[0] || "food",
    image: getRecipeImage(title, isDish ? dish : ingredients[0]),
  };
}

const SYSTEM_PROMPT = `You are CookVerse AI — an expert chef assistant like ChatGPT for cooking.
You understand misspelled food names (e.g. "biryan" = biryani, "chiken" = chicken, "psta" = pasta).
You always return complete recipes with every ingredient measured and every step explained in detail.
You respond ONLY with valid JSON, no markdown.`;

function buildPrompt({ ingredients, dish, isDishQuery, isCombined, rawQuery }) {
  const jsonSchema = `{
  "title": "string",
  "ingredients": [{"name": "string", "quantity": "string with exact measurement"}],
  "steps": ["detailed step-by-step instruction"],
  "cookingTime": "string like 45 mins",
  "difficulty": "Easy|Medium|Hard",
  "calories": number,
  "nutrition": {"protein": "string", "carbs": "string", "fat": "string"},
  "tips": "string",
  "imageSearchTerm": "2-4 word food photo search term"
}`;

  const typoNote = rawQuery
    ? `\nUser typed: "${rawQuery}" — interpret any spelling errors and use correct food names.\n`
    : "";

  if (isCombined) {
    return `${typoNote}Create a complete recipe for "${dish}" using these ingredients: ${ingredients.join(", ")}.
${RECIPE_RULES}
Return ONLY valid JSON: ${jsonSchema}`;
  }

  if (isDishQuery) {
    return `${typoNote}Write a complete, authentic, restaurant-quality recipe for "${dish}".
${RECIPE_RULES}
Return ONLY valid JSON: ${jsonSchema}`;
  }

  return `${typoNote}Create a creative, delicious recipe using only these ingredients: ${ingredients.join(", ")}.
${RECIPE_RULES}
Return ONLY valid JSON: ${jsonSchema}`;
}

function normalizeRecipe(recipe, dish, ingredients) {
  recipe.ingredients = (recipe.ingredients || [])
    .map((ing) => {
      if (typeof ing === "string") return { name: ing, quantity: "" };
      return { name: ing.name || "", quantity: ing.quantity || "" };
    })
    .filter((ing) => ing.name);

  recipe.steps = (recipe.steps || [])
    .map((s) => (typeof s === "string" ? s.trim() : String(s)))
    .filter(Boolean);

  if (recipe.steps.length < 4) {
    recipe.steps.push("Taste and adjust seasoning before serving.");
  }

  recipe.image = getRecipeImage(recipe.title, recipe.imageSearchTerm || dish || ingredients[0]);
  return recipe;
}

export async function generateRecipe({ ingredients = [], query = "", dishName = "" } = {}) {
  const rawQuery = query || dishName || "";
  const correctedQuery = correctFoodSpelling(rawQuery);
  const cleaned = correctIngredientList(ingredients.map((i) => String(i).trim()).filter(Boolean));
  const dish = correctFoodSpelling(parseDishName(correctedQuery, dishName));
  const isDishQuery = Boolean(dish);
  const isIngredientQuery = cleaned.length > 0;
  const isCombined = isDishQuery && isIngredientQuery;

  if (!isDishQuery && !isIngredientQuery) {
    throw new Error("Provide a dish name or at least one ingredient");
  }

  if (!ENV.OPENAI_API_KEY) {
    return buildMockRecipe({ ingredients: cleaned, dish });
  }

  const prompt = buildPrompt({
    ingredients: cleaned,
    dish,
    isDishQuery,
    isCombined,
    rawQuery,
  });

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ENV.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      temperature: 0.6,
      max_tokens: 2500,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    console.error("OpenAI error:", await response.text());
    return buildMockRecipe({ ingredients: cleaned, dish });
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  const recipe = normalizeRecipe(JSON.parse(content), dish, cleaned);
  return recipe;
}

export async function generateRecipeFromIngredients(ingredients) {
  return generateRecipe({ ingredients });
}
