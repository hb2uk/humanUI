// Core framework exports
export * from './core/SchemaBuilder';
export * from './core/EntityRegistry';

// Entity exports
export * from './category';
export * from './organization';
export * from './store';
export * from './item';
export * from './itemAttribute';
export * from './user';

// Import entity registry instance
import { entityRegistry } from './core/EntityRegistry';

// Auto-generated admin routes
export const getAdminRoutes = () => {
  return entityRegistry.generateAdminRoutes();
};

// Auto-generated API endpoints
export const getAPIEndpoints = () => {
  return entityRegistry.generateAPIEndpoints();
};

// Entity statistics
export const getEntityStats = () => {
  return entityRegistry.getEntityStats();
};

// Service generators
export const createCategoryService = () => entityRegistry.generateService('category');
export const createOrganizationService = () => entityRegistry.generateService('organization');
export const createStoreService = () => entityRegistry.generateService('store');
export const createItemService = () => entityRegistry.generateService('item');
export const createItemAttributeService = () => entityRegistry.generateService('itemattribute');
export const createUserService = () => entityRegistry.generateService('user');

// Export entity configurations
export { itemConfig } from './item/config';
export { itemFormConfig } from './item/config';
export { categoryConfig } from './category/config';
export { categoryFormConfig } from './category/config';
export { storeConfig } from './store/config';
export { storeFormConfig } from './store/config';
export { organizationConfig } from './organization/config';
export { organizationFormConfig } from './organization/config';
export { itemAttributeConfig } from './itemAttribute/config';
export { itemAttributeFormConfig } from './itemAttribute/config';

// Export types
export interface EntityConfig {
  name: string;
  displayName: string;
  description: string;
  path: string;
  service: any;
  schemas: {
    base: any;
    create: any;
    update: any;
    query: any;
    response: any;
    listResponse: any;
  };
  features: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    list: boolean;
    search: boolean;
    bulkOperations: boolean;
    import: boolean;
    export: boolean;
    stats: boolean;
  };
  permissions: {
    create: string[];
    read: string[];
    update: string[];
    delete: string[];
    list: string[];
    search: string[];
    bulkOperations: string[];
    import: string[];
    export: string[];
    stats: string[];
  };
  validation: {
    uniqueFields: string[];
    requiredFields: string[];
    businessRules: string[];
  };
  api: {
    endpoints: Record<string, any>;
    examples: Record<string, any>;
  };
  ui: {
    display: {
      listFields: string[];
      detailFields: string[];
      searchFields: string[];
      sortFields: string[];
      filterFields: string[];
    };
    forms: {
      create: {
        fields: Array<{
          name: string;
          type: string;
          required: boolean;
          label: string;
          options?: string[];
        }>;
      };
      update: {
        fields: Array<{
          name: string;
          type: string;
          required: boolean;
          label: string;
          options?: string[];
        }>;
      };
    };
  };
} 