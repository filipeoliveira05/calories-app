-- Reverts the previous migration's DB-level id defaults. Prisma Client always
-- supplies an explicit id (from `@default(cuid())`) on every insert, so the
-- schema never expected a DB-level default here; restoring "no default" keeps
-- `prisma migrate dev`'s schema/DB diff in agreement going forward.
ALTER TABLE "Food" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "MealEntry" ALTER COLUMN "id" DROP DEFAULT;
