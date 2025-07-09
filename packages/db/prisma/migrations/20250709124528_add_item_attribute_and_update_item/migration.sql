/*
  Warnings:

  - A unique constraint covering the columns `[sku,organizationId,tenantId]` on the table `items` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `basePrice` to the `items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoryType` to the `items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sku` to the `items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "items" ADD COLUMN     "basePrice" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "categoryType" TEXT NOT NULL,
ADD COLUMN     "complianceRequired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'THB',
ADD COLUMN     "fulfillmentConfig" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "fulfillmentMethod" TEXT NOT NULL DEFAULT 'pickup',
ADD COLUMN     "hasVariants" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "organizationId" TEXT NOT NULL,
ADD COLUMN     "pricingRules" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "regulatoryFlags" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "sku" TEXT NOT NULL,
ADD COLUMN     "variantGroups" JSONB;

-- CreateTable
CREATE TABLE "item_attributes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "attributeType" TEXT NOT NULL,
    "dataType" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "defaultValue" JSONB,
    "validationRules" JSONB,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "organizationId" TEXT NOT NULL,
    "tenantId" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "item_attributes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "item_attributes_tenantId_idx" ON "item_attributes"("tenantId");

-- CreateIndex
CREATE INDEX "item_attributes_organizationId_idx" ON "item_attributes"("organizationId");

-- CreateIndex
CREATE INDEX "item_attributes_attributeType_idx" ON "item_attributes"("attributeType");

-- CreateIndex
CREATE INDEX "item_attributes_isActive_idx" ON "item_attributes"("isActive");

-- CreateIndex
CREATE INDEX "item_attributes_isRequired_idx" ON "item_attributes"("isRequired");

-- CreateIndex
CREATE INDEX "item_attributes_sortOrder_idx" ON "item_attributes"("sortOrder");

-- CreateIndex
CREATE INDEX "item_attributes_createdAt_idx" ON "item_attributes"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "item_attributes_name_organizationId_tenantId_key" ON "item_attributes"("name", "organizationId", "tenantId");

-- CreateIndex
CREATE INDEX "items_organizationId_idx" ON "items"("organizationId");

-- CreateIndex
CREATE INDEX "items_categoryType_idx" ON "items"("categoryType");

-- CreateIndex
CREATE INDEX "items_sku_idx" ON "items"("sku");

-- CreateIndex
CREATE INDEX "items_basePrice_idx" ON "items"("basePrice");

-- CreateIndex
CREATE UNIQUE INDEX "items_sku_organizationId_tenantId_key" ON "items"("sku", "organizationId", "tenantId");

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_attributes" ADD CONSTRAINT "item_attributes_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
