// Export all entities
export * from './item';
export * from './category';
export * from './store';
export * from './organization';
export * from './itemAttribute';

// Export entity configurations
export { itemConfig } from './item/config';
export { categoryConfig } from './category/config';
export { storeConfig } from './store/config';
export { organizationConfig } from './organization/config';
export { itemAttributeConfig } from './itemAttribute/config';

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