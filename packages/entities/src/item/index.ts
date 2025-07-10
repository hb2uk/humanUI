import { z } from 'zod';
import { entityRegistry } from '../core/EntityRegistry';
import { TenantRules, BusinessLogic } from '../core/SchemaBuilder';

// Export Item entity
export * from './schema';
export * from './config';
export { ItemService } from './service';
// Export types separately to avoid conflicts
export type {
  ItemStats,
  BulkItemOperation,
  ItemImportData,
  ItemExportOptions,
  ItemFilters,
  ItemSortField,
  ItemSortOrder
} from './types';

// Item schema with proper nullable fields
export const itemSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1).max(255),
  description: z.string().nullable(),
  sku: z.string().min(1).max(255),
  categoryId: z.string().cuid().nullable(),
  storeId: z.string().cuid(),
  price: z.number().positive(),
  cost: z.number().positive().nullable(),
  quantity: z.number().int().min(0),
  minQuantity: z.number().int().min(0).nullable(),
  maxQuantity: z.number().int().min(0).nullable(),
  weight: z.number().positive().nullable(),
  dimensions: z.any().nullable(),
  images: z.any().nullable(),
  tags: z.any().nullable(),
  metadata: z.any().nullable(),
  isActive: z.boolean().default(true),
  tenantId: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Item = z.infer<typeof itemSchema>;

// Tenant rules for item
const itemTenantRules: TenantRules = {
  requiredFields: ['name', 'sku', 'storeId', 'price', 'quantity'],
  optionalFields: ['description', 'categoryId', 'cost', 'minQuantity', 'maxQuantity', 'weight', 'dimensions', 'images', 'tags', 'metadata'],
  uniqueConstraints: ['sku'],
  validationRules: {
    name: { minLength: 1, maxLength: 255 },
    sku: { pattern: '^[A-Z0-9-]+$' },
    price: { min: 0 },
    quantity: { min: 0 },
  },
};

// Business logic for item
const itemBusinessLogic: BusinessLogic = {
  beforeCreate: async (data: any, tenantId?: string) => {
    // Generate SKU if not provided
    if (!data.sku) {
      data.sku = `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Set default values
    if (data.quantity === undefined) {
      data.quantity = 0;
    }
    
    if (data.minQuantity === undefined) {
      data.minQuantity = 0;
    }
    
    // Ensure price is positive
    if (data.price < 0) {
      data.price = 0;
    }
    
    return data;
  },
  
  beforeUpdate: async (id: string, data: any, tenantId?: string) => {
    // Ensure price is positive
    if (data.price !== undefined && data.price < 0) {
      data.price = 0;
    }
    
    // Ensure quantity is non-negative
    if (data.quantity !== undefined && data.quantity < 0) {
      data.quantity = 0;
    }
    
    return data;
  },
  
  beforeDelete: async (id: string, tenantId?: string) => {
    // Check if item has orders
    // This would be implemented in the service layer
    return true;
  },
};

// Register item entity
entityRegistry.registerEntity({
  name: 'item',
  schema: itemSchema,
  tenantRules: itemTenantRules,
  businessLogic: itemBusinessLogic,
  displayName: 'Items',
  description: 'Product items and SKUs',
  icon: 'package',
  color: 'green',
});

// Export the service generator
export const createItemService = () => {
  return entityRegistry.generateService('Item');
};

// Export types
export type CreateItem = Omit<Item, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateItem = Partial<CreateItem> & { id: string }; 