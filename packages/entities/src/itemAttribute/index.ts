import { z } from 'zod';
import { entityRegistry } from '../core/EntityRegistry';
import { TenantRules, BusinessLogic } from '../core/SchemaBuilder';

// Export ItemAttribute entity
export * from './schema';
export * from './config';
export { ItemAttributeService } from './service';
// Export types separately to avoid conflicts
export type {
  ItemAttributeType,
  ItemAttributeStatus,
  ItemAttributeValidationRule,
  ItemAttributeMetadata,
  ItemAttributeStats,
  ItemAttributeBulkOperation,
  ItemAttributeImportData,
  ItemAttributeExportData,
  ItemAttributeValidationError,
  IItemAttributeService
} from './types';

// ItemAttribute schema with proper nullable fields
export const itemAttributeSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1).max(255),
  value: z.string().min(1).max(1000),
  itemId: z.string().cuid(),
  type: z.enum(['text', 'number', 'boolean', 'date', 'json']).default('text'),
  isRequired: z.boolean().default(false),
  isSearchable: z.boolean().default(false),
  isFilterable: z.boolean().default(false),
  displayOrder: z.number().int().min(0).nullable(),
  metadata: z.any().nullable(),
  isActive: z.boolean().default(true),
  tenantId: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ItemAttribute = z.infer<typeof itemAttributeSchema>;

// Tenant rules for itemAttribute
const itemAttributeTenantRules: TenantRules = {
  requiredFields: ['name', 'value', 'itemId'],
  optionalFields: ['type', 'isRequired', 'isSearchable', 'isFilterable', 'displayOrder', 'metadata'],
  uniqueConstraints: ['name_itemId'],
  validationRules: {
    name: { minLength: 1, maxLength: 255 },
    value: { minLength: 1, maxLength: 1000 },
  },
};

// Business logic for itemAttribute
const itemAttributeBusinessLogic: BusinessLogic = {
  beforeCreate: async (data: any, tenantId?: string) => {
    // Set default type if not provided
    if (!data.type) {
      data.type = 'text';
    }
    
    // Set default display order if not provided
    if (data.displayOrder === undefined) {
      data.displayOrder = 0;
    }
    
    // Validate value based on type
    if (data.type === 'number' && isNaN(Number(data.value))) {
      throw new Error('Value must be a number for number type attributes');
    }
    
    if (data.type === 'boolean' && !['true', 'false', '0', '1'].includes(data.value.toLowerCase())) {
      throw new Error('Value must be a boolean for boolean type attributes');
    }
    
    return data;
  },
  
  beforeUpdate: async (id: string, data: any, tenantId?: string) => {
    // Validate value based on type
    if (data.type === 'number' && data.value && isNaN(Number(data.value))) {
      throw new Error('Value must be a number for number type attributes');
    }
    
    if (data.type === 'boolean' && data.value && !['true', 'false', '0', '1'].includes(data.value.toLowerCase())) {
      throw new Error('Value must be a boolean for boolean type attributes');
    }
    
    return data;
  },
  
  beforeDelete: async (id: string, tenantId?: string) => {
    // Check if attribute is required
    // This would be implemented in the service layer
    return true;
  },
};

// Register itemAttribute entity
entityRegistry.registerEntity({
  name: 'itemattribute',
  schema: itemAttributeSchema,
  tenantRules: itemAttributeTenantRules,
  businessLogic: itemAttributeBusinessLogic,
  displayName: 'Item Attributes',
  description: 'Attributes for items',
  icon: 'tag',
  color: 'yellow',
});

// Export the service generator
export const createItemAttributeService = () => {
  return entityRegistry.generateService('ItemAttribute');
};

// Export types
export type CreateItemAttribute = Omit<ItemAttribute, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateItemAttribute = Partial<CreateItemAttribute> & { id: string }; 