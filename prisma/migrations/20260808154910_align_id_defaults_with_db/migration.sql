-- Codifies the `id` column defaults that were set directly in Supabase (outside
-- Prisma's migration history) on the Food and MealEntry tables. Prisma Client
-- always supplies an explicit id on every insert (from `@default(cuid())`), so
-- this only affects rows inserted directly against the database without an id.
ALTER TABLE "Food" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "MealEntry" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
