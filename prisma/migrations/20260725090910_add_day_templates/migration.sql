-- CreateTable
CREATE TABLE "DayTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DayTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DayTemplateEntry" (
    "id" TEXT NOT NULL,
    "dayTemplateId" TEXT NOT NULL,
    "mealType" "MealType" NOT NULL,
    "foodId" TEXT NOT NULL,
    "grams" DOUBLE PRECISION,
    "quantity" DOUBLE PRECISION,

    CONSTRAINT "DayTemplateEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DayTemplate_name_key" ON "DayTemplate"("name");

-- CreateIndex
CREATE INDEX "DayTemplateEntry_dayTemplateId_idx" ON "DayTemplateEntry"("dayTemplateId");

-- CreateIndex
CREATE INDEX "DayTemplateEntry_foodId_idx" ON "DayTemplateEntry"("foodId");

-- AddForeignKey
ALTER TABLE "DayTemplateEntry" ADD CONSTRAINT "DayTemplateEntry_dayTemplateId_fkey" FOREIGN KEY ("dayTemplateId") REFERENCES "DayTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DayTemplateEntry" ADD CONSTRAINT "DayTemplateEntry_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
