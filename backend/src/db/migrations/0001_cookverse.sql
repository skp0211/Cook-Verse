CREATE TABLE IF NOT EXISTS "users" (
  "id" text PRIMARY KEY NOT NULL,
  "full_name" text,
  "age" integer,
  "food_preference" text,
  "diet_goal" text,
  "bio" text,
  "avatar_url" text,
  "created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "recipes" (
  "id" serial PRIMARY KEY NOT NULL,
  "title" text NOT NULL,
  "image" text,
  "video_url" text,
  "ingredients" text NOT NULL,
  "steps" text NOT NULL,
  "category" text,
  "cuisine" text,
  "diet_type" text,
  "calories" integer,
  "nutrition" text,
  "difficulty" text,
  "cooking_time" text,
  "tips" text,
  "is_ai_generated" boolean DEFAULT false,
  "created_by" text NOT NULL,
  "creator_name" text,
  "creator_avatar" text,
  "likes_count" integer DEFAULT 0,
  "created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "comments" (
  "id" serial PRIMARY KEY NOT NULL,
  "recipe_id" integer NOT NULL,
  "user_id" text NOT NULL,
  "user_name" text,
  "user_avatar" text,
  "text" text NOT NULL,
  "created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "likes" (
  "id" serial PRIMARY KEY NOT NULL,
  "recipe_id" integer NOT NULL,
  "user_id" text NOT NULL,
  "created_at" timestamp DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "likes_recipe_user_idx" ON "likes" ("recipe_id", "user_id");

CREATE TABLE IF NOT EXISTS "saves" (
  "id" serial PRIMARY KEY NOT NULL,
  "recipe_id" integer NOT NULL,
  "user_id" text NOT NULL,
  "created_at" timestamp DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "saves_recipe_user_idx" ON "saves" ("recipe_id", "user_id");

CREATE TABLE IF NOT EXISTS "follows" (
  "id" serial PRIMARY KEY NOT NULL,
  "follower_id" text NOT NULL,
  "following_id" text NOT NULL,
  "created_at" timestamp DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "follows_pair_idx" ON "follows" ("follower_id", "following_id");

CREATE TABLE IF NOT EXISTS "ai_history" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "recipe_data" text NOT NULL,
  "created_at" timestamp DEFAULT now()
);
