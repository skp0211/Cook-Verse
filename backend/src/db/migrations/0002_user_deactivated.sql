ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_deactivated" boolean DEFAULT false;
