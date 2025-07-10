import { z } from 'zod';
import { entityRegistry } from '../core/EntityRegistry';
import { TenantRules, BusinessLogic } from '../core/SchemaBuilder';

// Export Category entity
export * from './schema';
export * from './config';
export { CategoryService } from './service';
// Export types separately to avoid conflicts
export type {
  CategoryStatus,
  CategoryVisibility,
  CategoryType,
  CategoryMetadata,
  CategoryTreeNode,
  CategoryStats,
  CategoryBulkOperation,
  CategoryImportData,
  CategoryExportData,
  CategoryValidationError,
  ICategoryService
} from './types';

// Category schema with proper nullable fields
export const categorySchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1).max(255),
  description: z.string().nullable(),
  slug: z.string().min(1).max(255),
  parentId: z.string().cuid().nullable(),
  metadata: z.any().nullable(),
  isActive: z.boolean().default(true),
  tenantId: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Category = z.infer<typeof categorySchema>;

// Tenant rules for category
const categoryTenantRules: TenantRules = {
  requiredFields: ['name', 'slug'],
  optionalFields: ['description', 'parentId', 'metadata'],
  uniqueConstraints: ['slug'],
  validationRules: {
    name: { minLength: 1, maxLength: 255 },
    slug: { pattern: '^[a-z0-9-]+$' },
  },
};

// Business logic for category
const categoryBusinessLogic: BusinessLogic = {
  beforeCreate: async (data: any, tenantId?: string) => {
    // Ensure slug is unique within tenant
    if (data.slug) {
      // This would be validated in the service layer
      data.slug = data.slug.toLowerCase().replace(/\s+/g, '-');
    }
    return data;
  },
  
  beforeUpdate: async (id: string, data: any, tenantId?: string) => {
    // Ensure slug is unique within tenant
    if (data.slug) {
      data.slug = data.slug.toLowerCase().replace(/\s+/g, '-');
    }
    return data;
  },
  
  beforeDelete: async (id: string, tenantId?: string) => {
    // Check if category has children
    // This would be implemented in the service layer
    return true;
  },
};

// Register category entity
entityRegistry.registerEntity({
  name: 'category',
  schema: categorySchema,
  tenantRules: categoryTenantRules,
  businessLogic: categoryBusinessLogic,
  displayName: 'Categories',
  description: 'Product categories and classifications',
  icon: 'folder',
  color: 'blue',
});

// Export the service generator
export const createCategoryService = () => {
  return entityRegistry.generateService('Category');
};

// Export types
export type CreateCategory = Omit<Category, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateCategory = Partial<CreateCategory> & { id: string }; 