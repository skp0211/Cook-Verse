import { Router } from "express";
import { db } from "../config/db.js";
import { followsTable, usersTable } from "../db/schema.js";
import { and, eq } from "drizzle-orm";

const router = Router();

async function enrichFollowRows(rows, userIdKey) {
  if (!rows.length) return [];
  const enriched = await Promise.all(
    rows.map(async (row) => {
      const userId = row[userIdKey];
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
      return {
        id: row.id,
        userId,
        fullName: user?.fullName || "CookVerse Chef",
        avatarUrl: user?.avatarUrl || null,
        bio: user?.bio || null,
        createdAt: row.createdAt,
      };
    })
  );
  return enriched;
}

router.post("/toggle", async (req, res) => {
  try {
    const { followerId, followingId } = req.body;
    if (!followerId || !followingId) {
      return res.status(400).json({ error: "followerId and followingId required" });
    }
    if (followerId === followingId) {
      return res.status(400).json({ error: "Cannot follow yourself" });
    }

    const [existing] = await db
      .select()
      .from(followsTable)
      .where(
        and(eq(followsTable.followerId, followerId), eq(followsTable.followingId, followingId))
      );

    if (existing) {
      await db
        .delete(followsTable)
        .where(
          and(eq(followsTable.followerId, followerId), eq(followsTable.followingId, followingId))
        );
      return res.json({ following: false });
    }

    await db.insert(followsTable).values({ followerId, followingId });
    res.json({ following: true });
  } catch (error) {
    console.error("Follow error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.get("/status/:followerId/:followingId", async (req, res) => {
  try {
    const { followerId, followingId } = req.params;
    const [existing] = await db
      .select()
      .from(followsTable)
      .where(
        and(eq(followsTable.followerId, followerId), eq(followsTable.followingId, followingId))
      );
    res.json({ following: !!existing });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.get("/followers/:userId", async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(followsTable)
      .where(eq(followsTable.followingId, req.params.userId));
    const users = await enrichFollowRows(rows, "followerId");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.get("/following/:userId", async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(followsTable)
      .where(eq(followsTable.followerId, req.params.userId));
    const users = await enrichFollowRows(rows, "followingId");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
