import { z } from 'zod';
import { StoreService } from './service';
import { 
  storeSchema as baseStoreSchema, 
  createStoreSchema, 
  updateStoreSchema, 
  storeQuerySchema,
  storeResponseSchema,
  storesListResponseSchema
} from './schema';

// Define the EntityFormConfig interface locally to avoid circular dependencies
interface EntityFormConfig<T = any> {
  schema: z.ZodSchema<T>;
  fields: any[];
  title?: string;
  description?: string;
  submitLabel?: string;
  cancelLabel?: string;
  layout?: 'single' | 'two-column' | 'three-column';
  sections?: {
    title: string;
    fields: string[];
    collapsible?: boolean;
    defaultExpanded?: boolean;
  }[];
}

export const storeTableColumns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'displayName', label: 'Display Name', sortable: true },
  { key: 'isActive', label: 'Active', sortable: true },
  { key: 'storeType', label: 'Type', sortable: true },
  { key: 'address', label: 'Address', sortable: false },
  { key: 'phone', label: 'Phone', sortable: false },
  { key: 'email', label: 'Email', sortable: false },
  { key: 'createdAt', label: 'Created At', sortable: true },
  { key: 'updatedAt', label: 'Updated At', sortable: true },
];

export const storeFormFields = [
  {
    name: 'name',
    label: 'Name',
    type: 'text' as const,
    required: true,
    placeholder: 'Enter store name',
  },
  {
    name: 'displayName',
    label: 'Display Name',
    type: 'text' as const,
    required: false,
    placeholder: 'Enter display name',
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea' as const,
    required: false,
    placeholder: 'Enter description',
  },
  {
    name: 'address.street',
    label: 'Street Address',
    type: 'text' as const,
    required: true,
    placeholder: 'Enter street address',
  },
  {
    name: 'address.city',
    label: 'City',
    type: 'text' as const,
    required: true,
    placeholder: 'Enter city',
  },
  {
    name: 'address.state',
    label: 'State/Province',
    type: 'text' as const,
    required: true,
    placeholder: 'Enter state or province',
  },
  {
    name: 'address.postalCode',
    label: 'Postal Code',
    type: 'text' as const,
    required: true,
    placeholder: 'Enter postal code',
  },
  {
    name: 'address.country',
    label: 'Country',
    type: 'text' as const,
    required: true,
    placeholder: 'Enter country',
  },
  {
    name: 'phone',
    label: 'Phone',
    type: 'text' as const,
    required: false,
    placeholder: 'Enter phone number',
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email' as const,
    required: false,
    placeholder: 'Enter email address',
  },
  {
    name: 'timezone',
    label: 'Timezone',
    type: 'select' as const,
    required: false,
    placeholder: 'Select timezone',
    options: [
      { label: 'UTC', value: 'UTC' },
      { label: 'America/New_York', value: 'America/New_York' },
      { label: 'America/Chicago', value: 'America/Chicago' },
      { label: 'America/Denver', value: 'America/Denver' },
      { label: 'America/Los_Angeles', value: 'America/Los_Angeles' },
      { label: 'Europe/London', value: 'Europe/London' },
      { label: 'Europe/Paris', value: 'Europe/Paris' },
      { label: 'Asia/Tokyo', value: 'Asia/Tokyo' },
      { label: 'Asia/Shanghai', value: 'Asia/Shanghai' },
    ],
  },
  {
    name: 'isActive',
    label: 'Active',
    type: 'checkbox' as const,
    required: false,
    defaultValue: true,
  },
  {
    name: 'storeType',
    label: 'Store Type',
    type: 'select' as const,
    required: false,
    placeholder: 'Select store type',
    options: [
      { label: 'Retail', value: 'RETAIL' },
      { label: 'Online', value: 'ONLINE' },
      { label: 'Hybrid', value: 'HYBRID' },
      { label: 'Wholesale', value: 'WHOLESALE' },
      { label: 'Pop-up', value: 'POPUP' },
      { label: 'Marketplace', value: 'MARKETPLACE' },
    ],
  },
  {
    name: 'organizationId',
    label: 'Organization',
    type: 'select' as const,
    required: true,
    placeholder: 'Select organization',
    options: [], // Will be populated dynamically
  },
];

export const storeFormSchema = createStoreSchema;

export const storeFormConfig: EntityFormConfig = {
  schema: storeFormSchema,
  fields: storeFormFields,
  title: 'Store',
  description: 'Create or edit a store',
  submitLabel: 'Save Store',
  cancelLabel: 'Cancel',
  layout: 'two-column',
  sections: [
    {
      title: 'Basic Information',
      fields: ['name', 'displayName', 'description'],
      defaultExpanded: true,
    },
    {
      title: 'Address',
      fields: ['address.street', 'address.city', 'address.state', 'address.postalCode', 'address.country'],
      defaultExpanded: true,
    },
    {
      title: 'Contact & Settings',
      fields: ['phone', 'email', 'timezone', 'isActive', 'storeType'],
      defaultExpanded: true,
    },
    {
      title: 'Organization',
      fields: ['organizationId'],
      defaultExpanded: true,
    },
  ],
};

// EntityConfig for API route generator
export const storeConfig = {
  name: 'store',
  displayName: 'Store',
  description: 'Manage retail stores and their configurations',
  path: '/stores',
  service: StoreService,
  schemas: {
    base: baseStoreSchema,
    create: createStoreSchema,
    update: updateStoreSchema,
    query: storeQuerySchema,
    response: storeResponseSchema,
    listResponse: storesListResponseSchema,
  },
  features: {
    create: true,
    read: true,
    update: true,
    delete: true,
    list: true,
    search: true,
    bulkOperations: true,
    import: true,
    export: true,
    stats: true,
  },
  permissions: {
    create: ['store:create'],
    read: ['store:read'],
    update: ['store:update'],
    delete: ['store:delete'],
    list: ['store:list'],
    search: ['store:search'],
    bulkOperations: ['store:bulk'],
    import: ['store:import'],
    export: ['store:export'],
    stats: ['store:stats'],
  },
  validation: {
    uniqueFields: ['name', 'organizationId'],
    requiredFields: ['name', 'address', 'organizationId'],
    businessRules: [
      'Store names must be unique within an organization',
      'Address must be complete (street, city, state, postal code, country)',
      'Active stores cannot be deleted if they have active inventory',
    ],
  },
  api: {
    endpoints: {
      create: {
        method: 'POST',
        path: '/',
        description: 'Create a new store',
      },
      findById: {
        method: 'GET',
        path: '/:id',
        description: 'Get store by ID',
      },
      list: {
        method: 'GET',
        path: '/',
        description: 'List stores with filtering and pagination',
      },
      update: {
        method: 'PUT',
        path: '/:id',
        description: 'Update a store',
      },
      delete: {
        method: 'DELETE',
        path: '/:id',
        description: 'Delete a store (soft delete)',
      },
      search: {
        method: 'GET',
        path: '/search',
        description: 'Search stores',
      },
      bulkOperation: {
        method: 'POST',
        path: '/bulk',
        description: 'Perform bulk operations on stores',
      },
      import: {
        method: 'POST',
        path: '/import',
        description: 'Import stores from external data',
      },
      export: {
        method: 'GET',
        path: '/export',
        description: 'Export stores to external format',
      },
      stats: {
        method: 'GET',
        path: '/stats',
        description: 'Get store statistics',
      },
    },
    examples: {
      create: {
        name: 'Main Store',
        displayName: 'Downtown Main Store',
        address: {
          street: '123 Main St',
          city: 'Bangkok',
          state: 'Bangkok',
          postalCode: '10400',
          country: 'Thailand',
        },
        phone: '+66-2-123-4567',
        email: 'main@store.com',
        timezone: 'Asia/Bangkok',
        isActive: true,
        storeType: 'RETAIL',
        organizationId: 'org_123',
      },
      update: {
        displayName: 'Updated Store Name',
        phone: '+66-2-123-4568',
        isActive: false,
      },
      query: {
        search: 'main',
        isActive: true,
        storeType: 'RETAIL',
        page: 1,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      },
    },
  },
  ui: {
    display: {
      listFields: ['name', 'displayName', 'isActive', 'storeType', 'address', 'phone'],
      detailFields: ['name', 'displayName', 'description', 'address', 'phone', 'email', 'timezone', 'isActive', 'storeType'],
      searchFields: ['name', 'displayName', 'description'],
      sortFields: ['name', 'displayName', 'createdAt', 'updatedAt'],
      filterFields: ['isActive', 'storeType', 'organizationId'],
    },
    forms: {
      create: {
        fields: [
          { name: 'name', type: 'text', required: true, label: 'Name' },
          { name: 'address.street', type: 'text', required: true, label: 'Street Address' },
          { name: 'isActive', type: 'checkbox', required: false, label: 'Active' },
        ],
      },
      update: {
        fields: [
          { name: 'displayName', type: 'text', required: false, label: 'Display Name' },
          { name: 'phone', type: 'text', required: false, label: 'Phone' },
          { name: 'isActive', type: 'checkbox', required: false, label: 'Active' },
        ],
      },
    },
  },
};

export type StoreTableColumn = typeof storeTableColumns[number];
export type StoreFormField = typeof storeFormFields[number]; 