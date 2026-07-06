import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  boolean,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const favoritesTable = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  recipeId: integer("recipe_id").notNull(),
  title: text("title").notNull(),
  image: text("image"),
  cookTime: text("cook_time"),
  servings: text("servings"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  fullName: text("full_name"),
  age: integer("age"),
  foodPreference: text("food_preference"),
  dietGoal: text("diet_goal"),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  isDeactivated: boolean("is_deactivated").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const recipesTable = pgTable("recipes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  image: text("image"),
  videoUrl: text("video_url"),
  ingredients: text("ingredients").notNull(),
  steps: text("steps").notNull(),
  category: text("category"),
  cuisine: text("cuisine"),
  dietType: text("diet_type"),
  calories: integer("calories"),
  nutrition: text("nutrition"),
  difficulty: text("difficulty"),
  cookingTime: text("cooking_time"),
  tips: text("tips"),
  isAIGenerated: boolean("is_ai_generated").default(false),
  createdBy: text("created_by").notNull(),
  creatorName: text("creator_name"),
  creatorAvatar: text("creator_avatar"),
  likesCount: integer("likes_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const commentsTable = pgTable("comments", {
  id: serial("id").primaryKey(),
  recipeId: integer("recipe_id").notNull(),
  userId: text("user_id").notNull(),
  userName: text("user_name"),
  userAvatar: text("user_avatar"),
  text: text("text").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const likesTable = pgTable(
  "likes",
  {
    id: serial("id").primaryKey(),
    recipeId: integer("recipe_id").notNull(),
    userId: text("user_id").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [uniqueIndex("likes_recipe_user_idx").on(table.recipeId, table.userId)]
);

export const savesTable = pgTable(
  "saves",
  {
    id: serial("id").primaryKey(),
    recipeId: integer("recipe_id").notNull(),
    userId: text("user_id").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [uniqueIndex("saves_recipe_user_idx").on(table.recipeId, table.userId)]
);

export const followsTable = pgTable(
  "follows",
  {
    id: serial("id").primaryKey(),
    followerId: text("follower_id").notNull(),
    followingId: text("following_id").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [uniqueIndex("follows_pair_idx").on(table.followerId, table.followingId)]
);

export const aiHistoryTable = pgTable("ai_history", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  recipeData: text("recipe_data").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
