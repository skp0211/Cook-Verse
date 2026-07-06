import { Router } from "express";
import { db } from "../config/db.js";
import {
  recipesTable,
  commentsTable,
  likesTable,
  savesTable,
  followsTable,
  aiHistoryTable,
} from "../db/schema.js";
import { and, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { generateRecipe } from "../services/aiRecipe.js";
import { formatRecipe } from "../utils/format.js";

const router = Router();

router.get("/feed", async (req, res) => {
  try {
    const page = parseInt(req.query.page || "1", 10);
    const limit = parseInt(req.query.limit || "10", 10);
    const category = req.query.category;
    const mode = req.query.mode || "all";
    const userId = req.query.userId;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (category && category !== "All") {
      conditions.push(
        or(eq(recipesTable.category, category), eq(recipesTable.cuisine, category))
      );
    }

    if (mode === "following" && userId) {
      const followed = await db
        .select({ id: followsTable.followingId })
        .from(followsTable)
        .where(eq(followsTable.followerId, userId));
      const ids = followed.map((f) => f.id);
      if (!ids.length) return res.json({ recipes: [], page, hasMore: false });
      conditions.push(inArray(recipesTable.createdBy, ids));
    }

    let rows;
    if (mode === "trending") {
      rows = await db
        .select()
        .from(recipesTable)
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(desc(recipesTable.likesCount), desc(recipesTable.createdAt))
        .limit(limit)
        .offset(offset);
    } else if (mode === "foryou") {
      rows = await db
        .select()
        .from(recipesTable)
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(
          sql`(${recipesTable.likesCount} * 2 + EXTRACT(EPOCH FROM ${recipesTable.createdAt}) / 100000) DESC`
        )
        .limit(limit)
        .offset(offset);
    } else {
      rows = await db
        .select()
        .from(recipesTable)
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(desc(recipesTable.createdAt))
        .limit(limit)
        .offset(offset);
    }

    res.json({
      recipes: rows.map(formatRecipe),
      page,
      hasMore: rows.length === limit,
    });
  } catch (error) {
    console.error("Feed error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.get("/search", async (req, res) => {
  try {
    const q = req.query.q || "";
    const type = req.query.type || "all";

    if (!q.trim()) return res.json({ recipes: [], users: [], hashtags: [] });

    const pattern = `%${q}%`;
    let recipes = [];
    let hashtags = [];

    if (type === "all" || type === "recipes") {
      recipes = await db
        .select()
        .from(recipesTable)
        .where(
          or(
            ilike(recipesTable.title, pattern),
            ilike(recipesTable.category, pattern),
            ilike(recipesTable.cuisine, pattern)
          )
        )
        .limit(20);
    }

    if (type === "all" || type === "hashtags") {
      const cats = await db
        .select({ tag: recipesTable.category })
        .from(recipesTable)
        .where(ilike(recipesTable.category, pattern))
        .limit(10);
      hashtags = [...new Set(cats.map((c) => c.tag).filter(Boolean))];
    }

    res.json({
      recipes: recipes.map(formatRecipe),
      hashtags,
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.get("/category/:name", async (req, res) => {
  try {
    const name = req.params.name;
    const rows = await db
      .select()
      .from(recipesTable)
      .where(or(eq(recipesTable.category, name), eq(recipesTable.cuisine, name)))
      .orderBy(desc(recipesTable.createdAt));
    res.json(rows.map(formatRecipe));
  } catch (error) {
    console.error("Category error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.get("/user/:userId", async (req, res) => {
  try {
    const { type } = req.query;
    const { userId } = req.params;

    if (type === "saved") {
      const saved = await db
        .select({ recipe: recipesTable })
        .from(savesTable)
        .innerJoin(recipesTable, eq(savesTable.recipeId, recipesTable.id))
        .where(eq(savesTable.userId, userId));
      return res.json(saved.map((s) => formatRecipe(s.recipe)));
    }

    if (type === "liked") {
      const liked = await db
        .select({ recipe: recipesTable })
        .from(likesTable)
        .innerJoin(recipesTable, eq(likesTable.recipeId, recipesTable.id))
        .where(eq(likesTable.userId, userId));
      return res.json(liked.map((l) => formatRecipe(l.recipe)));
    }

    const rows = await db
      .select()
      .from(recipesTable)
      .where(eq(recipesTable.createdBy, userId))
      .orderBy(desc(recipesTable.createdAt));
    res.json(rows.map(formatRecipe));
  } catch (error) {
    console.error("User recipes error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [row] = await db.select().from(recipesTable).where(eq(recipesTable.id, id));
    if (!row) return res.status(404).json({ error: "Recipe not found" });
    res.json(formatRecipe(row));
  } catch (error) {
    console.error("Get recipe error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { userId, title, image, ingredients, steps, category, dietType, calories, nutrition, difficulty, cookingTime, tips } = req.body;

    if (!userId) return res.status(400).json({ error: "userId required" });

    const [existing] = await db.select().from(recipesTable).where(eq(recipesTable.id, id));
    if (!existing) return res.status(404).json({ error: "Recipe not found" });
    if (existing.createdBy !== userId) return res.status(403).json({ error: "Not authorized to edit this recipe" });

    const [updated] = await db
      .update(recipesTable)
      .set({
        title: title ?? existing.title,
        image: image ?? existing.image,
        ingredients: ingredients ? JSON.stringify(ingredients) : existing.ingredients,
        steps: steps ? JSON.stringify(steps) : existing.steps,
        category: category ?? existing.category,
        dietType: dietType ?? existing.dietType,
        calories: calories ?? existing.calories,
        nutrition: nutrition ? JSON.stringify(nutrition) : existing.nutrition,
        difficulty: difficulty ?? existing.difficulty,
        cookingTime: cookingTime ?? existing.cookingTime,
        tips: tips ?? existing.tips,
      })
      .where(eq(recipesTable.id, id))
      .returning();

    res.json(formatRecipe(updated));
  } catch (error) {
    console.error("Update recipe error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const userId = req.body?.userId || req.query.userId;

    if (!userId) return res.status(400).json({ error: "userId required" });

    const [existing] = await db.select().from(recipesTable).where(eq(recipesTable.id, id));
    if (!existing) return res.status(404).json({ error: "Recipe not found" });
    if (existing.createdBy !== userId) return res.status(403).json({ error: "Not authorized to delete this recipe" });

    await db.delete(commentsTable).where(eq(commentsTable.recipeId, id));
    await db.delete(likesTable).where(eq(likesTable.recipeId, id));
    await db.delete(savesTable).where(eq(savesTable.recipeId, id));
    await db.delete(recipesTable).where(eq(recipesTable.id, id));

    res.json({ deleted: true });
  } catch (error) {
    console.error("Delete recipe error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      title,
      image,
      videoUrl,
      ingredients,
      steps,
      category,
      cuisine,
      dietType,
      calories,
      nutrition,
      difficulty,
      cookingTime,
      tips,
      isAIGenerated,
      createdBy,
      creatorName,
      creatorAvatar,
      publishToFeed,
    } = req.body;

    if (!title || !createdBy) {
      return res.status(400).json({ error: "Title and createdBy are required" });
    }

    const [recipe] = await db
      .insert(recipesTable)
      .values({
        title,
        image,
        videoUrl,
        ingredients: JSON.stringify(ingredients || []),
        steps: JSON.stringify(steps || []),
        category,
        cuisine,
        dietType,
        calories,
        nutrition: JSON.stringify(nutrition || {}),
        difficulty,
        cookingTime,
        tips,
        isAIGenerated: isAIGenerated || false,
        createdBy,
        creatorName,
        creatorAvatar,
      })
      .returning();

    if (publishToFeed === false) {
      return res.status(201).json(formatRecipe(recipe));
    }

    res.status(201).json(formatRecipe(recipe));
  } catch (error) {
    console.error("Create recipe error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.post("/ai/generate", async (req, res) => {
  try {
    const { ingredients = [], query = "", dishName = "", userId } = req.body;
    if (!ingredients?.length && !query?.trim() && !dishName?.trim()) {
      return res.status(400).json({ error: "Provide a dish name or at least one ingredient" });
    }

    const generated = await generateRecipe({ ingredients, query, dishName });

    if (userId) {
      await db.insert(aiHistoryTable).values({
        userId,
        recipeData: JSON.stringify(generated),
      });
    }

    res.json(generated);
  } catch (error) {
    console.error("AI generate error:", error);
    res.status(500).json({ error: error.message || "AI generation failed" });
  }
});

router.get("/ai/history/:userId", async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(aiHistoryTable)
      .where(eq(aiHistoryTable.userId, req.params.userId))
      .orderBy(desc(aiHistoryTable.createdAt))
      .limit(20);

    res.json(
      rows.map((r) => ({
        id: r.id,
        createdAt: r.createdAt,
        recipe: JSON.parse(r.recipeData),
      }))
    );
  } catch (error) {
    console.error("AI history error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.get("/:id/comments", async (req, res) => {
  try {
    const recipeId = parseInt(req.params.id, 10);
    const comments = await db
      .select()
      .from(commentsTable)
      .where(eq(commentsTable.recipeId, recipeId))
      .orderBy(desc(commentsTable.createdAt));
    res.json(comments);
  } catch (error) {
    console.error("Comments error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.post("/:id/comments", async (req, res) => {
  try {
    const recipeId = parseInt(req.params.id, 10);
    const { userId, userName, userAvatar, text } = req.body;
    if (!userId || !text) return res.status(400).json({ error: "Missing fields" });

    const [comment] = await db
      .insert(commentsTable)
      .values({ recipeId, userId, userName, userAvatar, text })
      .returning();
    res.status(201).json(comment);
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.post("/:id/like", async (req, res) => {
  try {
    const recipeId = parseInt(req.params.id, 10);
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId required" });

    const [existing] = await db
      .select()
      .from(likesTable)
      .where(and(eq(likesTable.recipeId, recipeId), eq(likesTable.userId, userId)));

    if (existing) {
      await db
        .delete(likesTable)
        .where(and(eq(likesTable.recipeId, recipeId), eq(likesTable.userId, userId)));
      await db
        .update(recipesTable)
        .set({ likesCount: sql`GREATEST(${recipesTable.likesCount} - 1, 0)` })
        .where(eq(recipesTable.id, recipeId));
      return res.json({ liked: false });
    }

    await db.insert(likesTable).values({ recipeId, userId });
    await db
      .update(recipesTable)
      .set({ likesCount: sql`${recipesTable.likesCount} + 1` })
      .where(eq(recipesTable.id, recipeId));
    res.json({ liked: true });
  } catch (error) {
    console.error("Like error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.get("/:id/like/:userId", async (req, res) => {
  try {
    const recipeId = parseInt(req.params.id, 10);
    const { userId } = req.params;
    const [existing] = await db
      .select()
      .from(likesTable)
      .where(and(eq(likesTable.recipeId, recipeId), eq(likesTable.userId, userId)));
    res.json({ liked: !!existing });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.post("/:id/save", async (req, res) => {
  try {
    const recipeId = parseInt(req.params.id, 10);
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId required" });

    const [existing] = await db
      .select()
      .from(savesTable)
      .where(and(eq(savesTable.recipeId, recipeId), eq(savesTable.userId, userId)));

    if (existing) {
      await db
        .delete(savesTable)
        .where(and(eq(savesTable.recipeId, recipeId), eq(savesTable.userId, userId)));
      return res.json({ saved: false });
    }

    await db.insert(savesTable).values({ recipeId, userId });
    res.json({ saved: true });
  } catch (error) {
    console.error("Save error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.get("/:id/save/:userId", async (req, res) => {
  try {
    const recipeId = parseInt(req.params.id, 10);
    const { userId } = req.params;
    const [existing] = await db
      .select()
      .from(savesTable)
      .where(and(eq(savesTable.recipeId, recipeId), eq(savesTable.userId, userId)));
    res.json({ saved: !!existing });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
