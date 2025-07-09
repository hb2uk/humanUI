import { ItemStatus, Priority } from '@humanui/db';
import { z } from 'zod';
import { ItemService } from './service';
import { 
  itemSchema as baseItemSchema, 
  createItemSchema, 
  updateItemSchema, 
  itemQuerySchema,
  itemResponseSchema,
  itemsListResponseSchema
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

export const itemTableColumns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'priority', label: 'Priority', sortable: true },
  { key: 'tags', label: 'Tags', sortable: false },
  { key: 'createdBy', label: 'Created By', sortable: true },
  { key: 'createdAt', label: 'Created At', sortable: true },
  { key: 'updatedAt', label: 'Updated At', sortable: true },
];

export const itemFormFields = [
  {
    name: 'categoryType',
    label: 'Category Type',
    type: 'text' as const,
    required: true,
    placeholder: 'Enter category type',
  },
  {
    name: 'sku',
    label: 'SKU',
    type: 'text' as const,
    required: true,
    placeholder: 'Enter SKU',
  },
  {
    name: 'name',
    label: 'Name',
    type: 'text' as const,
    required: true,
    placeholder: 'Enter item name',
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea' as const,
    required: false,
    placeholder: 'Enter description',
  },
  {
    name: 'hasVariants',
    label: 'Has Variants',
    type: 'checkbox' as const,
    required: false,
  },
  {
    name: 'fulfillmentMethod',
    label: 'Fulfillment Method',
    type: 'select' as const,
    options: [
      { label: 'Pickup', value: 'pickup' },
      { label: 'Delivery', value: 'delivery' },
      { label: 'Both', value: 'both' },
    ],
    required: true,
    defaultValue: 'pickup',
  },
  {
    name: 'basePrice',
    label: 'Base Price',
    type: 'number' as const,
    required: true,
    placeholder: 'Enter base price',
  },
  {
    name: 'currency',
    label: 'Currency',
    type: 'select' as const,
    options: [
      { label: 'THB', value: 'THB' },
      { label: 'USD', value: 'USD' },
      { label: 'EUR', value: 'EUR' },
    ],
    required: true,
    defaultValue: 'THB',
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select' as const,
    options: Object.values(ItemStatus).map((v) => ({ label: v, value: v })),
    required: true,
    defaultValue: ItemStatus.DRAFT,
  },
  {
    name: 'priority',
    label: 'Priority',
    type: 'select' as const,
    options: Object.values(Priority).map((v) => ({ label: v, value: v })),
    required: true,
    defaultValue: Priority.MEDIUM,
  },
  {
    name: 'tags',
    label: 'Tags',
    type: 'tags' as const,
    required: false,
    placeholder: 'Add tags',
  },
  {
    name: 'metadata',
    label: 'Metadata',
    type: 'json' as const,
    required: false,
    placeholder: 'Enter metadata as JSON',
  },
];

export const itemFormSchema = createItemSchema;

export const itemFormConfig: EntityFormConfig = {
  schema: itemFormSchema,
  fields: itemFormFields,
  title: 'Item',
  description: 'Create or edit an item in your inventory',
  submitLabel: 'Save Item',
  cancelLabel: 'Cancel',
  layout: 'two-column',
  sections: [
    {
      title: 'Basic Information',
      fields: ['categoryType', 'sku', 'name', 'description'],
      defaultExpanded: true,
    },
    {
      title: 'Pricing & Status',
      fields: ['basePrice', 'currency', 'status', 'priority'],
      defaultExpanded: true,
    },
    {
      title: 'Advanced Settings',
      fields: ['hasVariants', 'fulfillmentMethod', 'tags', 'metadata'],
      defaultExpanded: false,
    },
  ],
};

// EntityConfig for API route generator
export const itemConfig = {
  name: 'item',
  displayName: 'Item',
  description: 'Manage inventory items and their configurations',
  path: '/items',
  service: ItemService,
  schemas: {
    base: baseItemSchema,
    create: createItemSchema,
    update: updateItemSchema,
    query: itemQuerySchema,
    response: itemResponseSchema,
    listResponse: itemsListResponseSchema,
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
    create: ['item:create'],
    read: ['item:read'],
    update: ['item:update'],
    delete: ['item:delete'],
    list: ['item:list'],
    search: ['item:search'],
    bulkOperations: ['item:bulk'],
    import: ['item:import'],
    export: ['item:export'],
    stats: ['item:stats'],
  },
  validation: {
    uniqueFields: ['sku', 'organizationId'],
    requiredFields: ['name', 'sku', 'basePrice', 'organizationId'],
    businessRules: [
      'SKU must be unique within an organization',
      'Base price must be positive',
      'Items with variants cannot be deleted if variants exist',
    ],
  },
  api: {
    endpoints: {
      create: {
        method: 'POST',
        path: '/',
        description: 'Create a new item',
      },
      findById: {
        method: 'GET',
        path: '/:id',
        description: 'Get item by ID',
      },
      list: {
        method: 'GET',
        path: '/',
        description: 'List items with filtering and pagination',
      },
      update: {
        method: 'PUT',
        path: '/:id',
        description: 'Update an item',
      },
      delete: {
        method: 'DELETE',
        path: '/:id',
        description: 'Delete an item (soft delete)',
      },
      search: {
        method: 'GET',
        path: '/search',
        description: 'Search items',
      },
      bulkOperation: {
        method: 'POST',
        path: '/bulk',
        description: 'Perform bulk operations on items',
      },
      import: {
        method: 'POST',
        path: '/import',
        description: 'Import items from external data',
      },
      export: {
        method: 'GET',
        path: '/export',
        description: 'Export items to external format',
      },
      stats: {
        method: 'GET',
        path: '/stats',
        description: 'Get item statistics',
      },
    },
    examples: {
      create: {
        name: 'Sample Item',
        sku: 'ITEM-001',
        basePrice: 99.99,
        currency: 'THB',
        status: 'DRAFT',
        priority: 'MEDIUM',
        organizationId: 'org_123',
      },
      update: {
        name: 'Updated Item Name',
        basePrice: 149.99,
        status: 'ACTIVE',
      },
      query: {
        search: 'sample',
        status: 'ACTIVE',
        page: 1,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      },
    },
  },
  ui: {
    display: {
      listFields: ['name', 'sku', 'basePrice', 'status', 'priority', 'createdAt'],
      detailFields: ['name', 'sku', 'description', 'basePrice', 'currency', 'status', 'priority', 'tags', 'metadata'],
      searchFields: ['name', 'sku', 'description'],
      sortFields: ['name', 'basePrice', 'status', 'priority', 'createdAt', 'updatedAt'],
      filterFields: ['status', 'priority', 'hasVariants', 'organizationId'],
    },
    forms: {
      create: {
        fields: [
          { name: 'name', type: 'text', required: true, label: 'Name' },
          { name: 'sku', type: 'text', required: true, label: 'SKU' },
          { name: 'basePrice', type: 'number', required: true, label: 'Base Price' },
          { name: 'status', type: 'select', required: true, label: 'Status' },
        ],
      },
      update: {
        fields: [
          { name: 'name', type: 'text', required: false, label: 'Name' },
          { name: 'basePrice', type: 'number', required: false, label: 'Base Price' },
          { name: 'status', type: 'select', required: false, label: 'Status' },
        ],
      },
    },
  },
};

export type ItemTableColumn = typeof itemTableColumns[number];
export type ItemFormField = typeof itemFormFields[number]; 