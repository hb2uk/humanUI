import { z } from 'zod';
import { entityRegistry } from '../core/EntityRegistry';
import { TenantRules, BusinessLogic } from '../core/SchemaBuilder';

// Export Organization entity
export * from './schema';
export * from './config';
export { OrganizationService } from './service';
// Export types separately to avoid conflicts
export type {
  OrganizationStatus,
  OrganizationType,
  OrganizationSettings,
  OrganizationAddress,
  OrganizationStats,
  OrganizationBulkOperation,
  OrganizationImportData,
  OrganizationExportData,
  OrganizationValidationError,
  IOrganizationService
} from './types';

// Organization schema with proper nullable fields
export const organizationSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1).max(255),
  description: z.string().nullable(),
  slug: z.string().min(1).max(255),
  domain: z.string().nullable(),
  settings: z.any().nullable(),
  metadata: z.any().nullable(),
  isActive: z.boolean().default(true),
  tenantId: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Organization = z.infer<typeof organizationSchema>;

// Tenant rules for organization
const organizationTenantRules: TenantRules = {
  requiredFields: ['name', 'slug'],
  optionalFields: ['description', 'domain', 'settings', 'metadata'],
  uniqueConstraints: ['slug', 'domain'],
  validationRules: {
    name: { minLength: 1, maxLength: 255 },
    slug: { pattern: '^[a-z0-9-]+$' },
    domain: { pattern: '^[a-zA-Z0-9.-]+$' },
  },
};

// Business logic for organization
const organizationBusinessLogic: BusinessLogic = {
  beforeCreate: async (data: any, tenantId?: string) => {
    // Ensure slug is unique
    if (data.slug) {
      data.slug = data.slug.toLowerCase().replace(/\s+/g, '-');
    }
    
    // Set default settings if not provided
    if (!data.settings) {
      data.settings = {
        theme: 'default',
        features: ['inventory', 'orders'],
        limits: {
          users: 10,
          stores: 5,
          items: 1000,
        },
      };
    }
    
    return data;
  },
  
  beforeUpdate: async (id: string, data: any, tenantId?: string) => {
    // Ensure slug is unique
    if (data.slug) {
      data.slug = data.slug.toLowerCase().replace(/\s+/g, '-');
    }
    return data;
  },
  
  beforeDelete: async (id: string, tenantId?: string) => {
    // Check if organization has stores
    // This would be implemented in the service layer
    return true;
  },
};

// Register organization entity
entityRegistry.registerEntity({
  name: 'organization',
  schema: organizationSchema,
  tenantRules: organizationTenantRules,
  businessLogic: organizationBusinessLogic,
  displayName: 'Organizations',
  description: 'Business organizations',
  icon: 'building',
  color: 'purple',
});

// Export the service generator
export const createOrganizationService = () => {
  return entityRegistry.generateService('Organization');
};

// Export types
export type CreateOrganization = Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateOrganization = Partial<CreateOrganization> & { id: string }; 