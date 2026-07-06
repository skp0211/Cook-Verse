import express from "express";
import cors from "cors";
import { neon } from "@neondatabase/serverless";
import { ENV } from "./config/env.js";
import { db } from "./config/db.js";
import { favoritesTable, recipesTable } from "./db/schema.js";
import { and, eq } from "drizzle-orm";
import job from "./config/cron.js";
import usersRouter from "./routes/users.js";
import recipesRouter from "./routes/recipes.js";
import followsRouter from "./routes/follows.js";
import { CATEGORY_SEED_RECIPES } from "./data/seedRecipes.js";
import { buildSeedLookup, isEmptyRecipeContent } from "./utils/seedRepair.js";

const app = express();
const PORT = ENV.PORT || 5001;

if (ENV.NODE_ENV === "production") job.start();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true });
});

app.use("/api/users", usersRouter);
app.use("/api/recipes", recipesRouter);
app.use("/api/follows", followsRouter);

// Legacy favorites endpoints
app.post("/api/favorites", async (req, res) => {
  try {
    const { userId, recipeId, title, image, cookTime, servings } = req.body;
    if (!userId || !recipeId || !title) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const newFavorite = await db
      .insert(favoritesTable)
      .values({ userId, recipeId, title, image, cookTime, servings })
      .returning();
    res.status(201).json(newFavorite[0]);
  } catch (error) {
    console.log("Error adding favorite", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/api/favorites/:userId", async (req, res) => {
  try {
    const userFavorites = await db
      .select()
      .from(favoritesTable)
      .where(eq(favoritesTable.userId, req.params.userId));
    res.status(200).json(userFavorites);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.delete("/api/favorites/:userId/:recipeId", async (req, res) => {
  try {
    const { userId, recipeId } = req.params;
    await db
      .delete(favoritesTable)
      .where(
        and(eq(favoritesTable.userId, userId), eq(favoritesTable.recipeId, parseInt(recipeId)))
      );
    res.status(200).json({ message: "Favorite removed successfully" });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

async function seedRecipesIfEmpty() {
  const existing = await db.select({ title: recipesTable.title }).from(recipesTable);
  const existingTitles = new Set(existing.map((r) => r.title));
  const toInsert = CATEGORY_SEED_RECIPES.filter((r) => !existingTitles.has(r.title));

  if (!toInsert.length) return;

  await db.insert(recipesTable).values(toInsert);
  console.log(`Seeded ${toInsert.length} CookVerse category recipes`);
}

async function repairBrokenRecipes() {
  const seedLookup = buildSeedLookup(CATEGORY_SEED_RECIPES);
  const rows = await db.select().from(recipesTable);
  let repaired = 0;

  for (const row of rows) {
    const needsFix = isEmptyRecipeContent(row.ingredients) || isEmptyRecipeContent(row.steps);
    if (!needsFix) continue;

    const seed = seedLookup.get(row.title);
    if (!seed) continue;

    await db
      .update(recipesTable)
      .set({
        ingredients: seed.ingredients,
        steps: seed.steps,
        nutrition: seed.nutrition,
        tips: seed.tips,
        cookingTime: seed.cookingTime,
        difficulty: seed.difficulty,
        calories: seed.calories,
      })
      .where(eq(recipesTable.id, row.id));
    repaired++;
  }

  if (repaired) console.log(`Repaired ${repaired} recipes with missing ingredients/steps`);
}

async function ensureSchema() {
  try {
    const sql = neon(ENV.DATABASE_URL);
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_deactivated boolean DEFAULT false`;
  } catch (e) {
    console.warn("Schema check:", e.message);
  }
}

app.listen(PORT, async () => {
  console.log("CookVerse API running on PORT:", PORT);
  try {
    await ensureSchema();
    await seedRecipesIfEmpty();
    await repairBrokenRecipes();
  } catch (e) {
    console.error("Seed error:", e);
  }
});
