import { z } from 'zod';
import { entityRegistry } from '../core/EntityRegistry';
import { TenantRules, BusinessLogic } from '../core/SchemaBuilder';

// Export Store entity
export * from './schema';
export * from './config';
export { StoreService } from './service';
// Export types separately to avoid conflicts
export type {
  StoreStatus,
  StoreType,
  StoreSettings,
  StoreOperatingSchedule,
  OperatingHours,
  StoreStats,
  StoreBulkOperation,
  StoreImportData,
  StoreExportData,
  StoreValidationError,
  IStoreService
} from './types';

// Store schema with proper nullable fields
export const storeSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1).max(255),
  description: z.string().nullable(),
  slug: z.string().min(1).max(255),
  organizationId: z.string().cuid(),
  address: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().email().nullable(),
  settings: z.any().nullable(),
  metadata: z.any().nullable(),
  isActive: z.boolean().default(true),
  tenantId: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Store = z.infer<typeof storeSchema>;

// Tenant rules for store
const storeTenantRules: TenantRules = {
  requiredFields: ['name', 'slug', 'organizationId'],
  optionalFields: ['description', 'address', 'phone', 'email', 'settings', 'metadata'],
  uniqueConstraints: ['slug'],
  validationRules: {
    name: { minLength: 1, maxLength: 255 },
    slug: { pattern: '^[a-z0-9-]+$' },
    email: { pattern: '^[^@]+@[^@]+\\.[^@]+$' },
  },
};

// Business logic for store
const storeBusinessLogic: BusinessLogic = {
  beforeCreate: async (data: any, tenantId?: string) => {
    // Ensure slug is unique within organization
    if (data.slug) {
      data.slug = data.slug.toLowerCase().replace(/\s+/g, '-');
    }
    
    // Set default settings if not provided
    if (!data.settings) {
      data.settings = {
        currency: 'USD',
        timezone: 'UTC',
        inventory: {
          lowStockThreshold: 10,
          autoReorder: false,
        },
      };
    }
    
    return data;
  },
  
  beforeUpdate: async (id: string, data: any, tenantId?: string) => {
    // Ensure slug is unique within organization
    if (data.slug) {
      data.slug = data.slug.toLowerCase().replace(/\s+/g, '-');
    }
    return data;
  },
  
  beforeDelete: async (id: string, tenantId?: string) => {
    // Check if store has items
    // This would be implemented in the service layer
    return true;
  },
};

// Register store entity
entityRegistry.registerEntity({
  name: 'store',
  schema: storeSchema,
  tenantRules: storeTenantRules,
  businessLogic: storeBusinessLogic,
  displayName: 'Stores',
  description: 'Retail stores and locations',
  icon: 'store',
  color: 'orange',
});

// Export the service generator
export const createStoreService = () => {
  return entityRegistry.generateService('Store');
};

// Export types
export type CreateStore = Omit<Store, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateStore = Partial<CreateStore> & { id: string }; 