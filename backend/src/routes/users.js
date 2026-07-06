import { Router } from "express";
import { db } from "../config/db.js";
import {
  usersTable,
  recipesTable,
  followsTable,
  commentsTable,
  likesTable,
  savesTable,
  aiHistoryTable,
  favoritesTable,
} from "../db/schema.js";
import { eq, sql } from "drizzle-orm";
import { formatUser } from "../utils/format.js";

const router = Router();

router.get("/search/:query", async (req, res) => {
  try {
    const q = `%${req.params.query}%`;
    const users = await db
      .select()
      .from(usersTable)
      .where(sql`${usersTable.fullName} ILIKE ${q}`);
    res.json(users);
  } catch (error) {
    console.error("Search users error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));

    const [postsCount] = await db
      .select({ count: sql`count(*)::int` })
      .from(recipesTable)
      .where(eq(recipesTable.createdBy, userId));

    const [followersCount] = await db
      .select({ count: sql`count(*)::int` })
      .from(followsTable)
      .where(eq(followsTable.followingId, userId));

    const [followingCount] = await db
      .select({ count: sql`count(*)::int` })
      .from(followsTable)
      .where(eq(followsTable.followerId, userId));

    if (!user) {
      return res.json(
        formatUser(null, { postsCount: 0, followersCount: 0, followingCount: 0 })
      );
    }
    if (user.isDeactivated) {
      return res.status(403).json({ error: "Account deactivated", deactivated: true });
    }
    return res.json(
      formatUser(user, {
        postsCount: postsCount?.count || 0,
        followersCount: followersCount?.count || 0,
        followingCount: followingCount?.count || 0,
      })
    );
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { id, fullName, age, foodPreference, dietGoal, bio, avatarUrl } = req.body;
    if (!id) return res.status(400).json({ error: "User id is required" });

    const [existing] = await db.select().from(usersTable).where(eq(usersTable.id, id));

    if (existing) {
      const [updated] = await db
        .update(usersTable)
        .set({ fullName, age, foodPreference, dietGoal, bio, avatarUrl })
        .where(eq(usersTable.id, id))
        .returning();
      return res.json(updated);
    }

    const [created] = await db
      .insert(usersTable)
      .values({ id, fullName, age, foodPreference, dietGoal, bio, avatarUrl })
      .returning();

    res.status(201).json(created);
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.patch("/:userId/deactivate", async (req, res) => {
  try {
    const { userId } = req.params;
    const { requestUserId } = req.body;
    if (requestUserId !== userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const [existing] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (!existing) return res.status(404).json({ error: "User not found" });

    const [updated] = await db
      .update(usersTable)
      .set({ isDeactivated: true })
      .where(eq(usersTable.id, userId))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error("Deactivate user error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.patch("/:userId/reactivate", async (req, res) => {
  try {
    const { userId } = req.params;
    const [updated] = await db
      .update(usersTable)
      .set({ isDeactivated: false })
      .where(eq(usersTable.id, userId))
      .returning();

    if (!updated) return res.status(404).json({ error: "User not found" });
    res.json(updated);
  } catch (error) {
    console.error("Reactivate user error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.delete("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { requestUserId } = req.body;
    if (requestUserId !== userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const userRecipes = await db
      .select({ id: recipesTable.id })
      .from(recipesTable)
      .where(eq(recipesTable.createdBy, userId));

    for (const recipe of userRecipes) {
      await db.delete(commentsTable).where(eq(commentsTable.recipeId, recipe.id));
      await db.delete(likesTable).where(eq(likesTable.recipeId, recipe.id));
      await db.delete(savesTable).where(eq(savesTable.recipeId, recipe.id));
    }

    await db.delete(recipesTable).where(eq(recipesTable.createdBy, userId));
    await db.delete(commentsTable).where(eq(commentsTable.userId, userId));
    await db.delete(likesTable).where(eq(likesTable.userId, userId));
    await db.delete(savesTable).where(eq(savesTable.userId, userId));
    await db.delete(followsTable).where(eq(followsTable.followerId, userId));
    await db.delete(followsTable).where(eq(followsTable.followingId, userId));
    await db.delete(aiHistoryTable).where(eq(aiHistoryTable.userId, userId));
    await db.delete(favoritesTable).where(eq(favoritesTable.userId, userId));
    await db.delete(usersTable).where(eq(usersTable.id, userId));

    res.json({ deleted: true });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
