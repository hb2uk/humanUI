import { z } from 'zod';
import { CategoryService } from './service';
import { 
  categorySchema as baseCategorySchema, 
  createCategorySchema, 
  updateCategorySchema, 
  categoryQuerySchema,
  categoryResponseSchema,
  categoriesListResponseSchema
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

export const categoryTableColumns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'slug', label: 'Slug', sortable: true },
  { key: 'isActive', label: 'Active', sortable: true },
  { key: 'isPublished', label: 'Published', sortable: true },
  { key: 'sortOrder', label: 'Sort Order', sortable: true },
  { key: 'parentId', label: 'Parent', sortable: true },
  { key: 'createdAt', label: 'Created At', sortable: true },
  { key: 'updatedAt', label: 'Updated At', sortable: true },
];

export const categoryFormFields = [
  {
    name: 'name',
    label: 'Name',
    type: 'text' as const,
    required: true,
    placeholder: 'Enter category name',
  },
  {
    name: 'slug',
    label: 'Slug',
    type: 'text' as const,
    required: true,
    placeholder: 'Enter category slug',
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea' as const,
    required: false,
    placeholder: 'Enter description',
  },
  {
    name: 'imageUrl',
    label: 'Image URL',
    type: 'text' as const,
    required: false,
    placeholder: 'Enter image URL',
  },
  {
    name: 'isActive',
    label: 'Active',
    type: 'checkbox' as const,
    required: false,
    defaultValue: true,
  },
  {
    name: 'isPublished',
    label: 'Published',
    type: 'checkbox' as const,
    required: false,
    defaultValue: false,
  },
  {
    name: 'parentId',
    label: 'Parent Category',
    type: 'select' as const,
    required: false,
    placeholder: 'Select parent category',
    options: [], // Will be populated dynamically
  },
  {
    name: 'sortOrder',
    label: 'Sort Order',
    type: 'number' as const,
    required: false,
    defaultValue: 0,
    fieldProps: { min: 0 },
  },
  {
    name: 'organizationId',
    label: 'Organization',
    type: 'select' as const,
    required: true,
    placeholder: 'Select organization',
    options: [], // Will be populated dynamically
  },
  {
    name: 'storeId',
    label: 'Store',
    type: 'select' as const,
    required: true,
    placeholder: 'Select store',
    options: [], // Will be populated dynamically
  },
];

export const categoryFormSchema = createCategorySchema;

export const categoryFormConfig: EntityFormConfig = {
  schema: categoryFormSchema,
  fields: categoryFormFields,
  title: 'Category',
  description: 'Create or edit a category',
  submitLabel: 'Save Category',
  cancelLabel: 'Cancel',
  layout: 'two-column',
  sections: [
    {
      title: 'Basic Information',
      fields: ['name', 'slug', 'description', 'imageUrl'],
      defaultExpanded: true,
    },
    {
      title: 'Settings',
      fields: ['isActive', 'isPublished', 'sortOrder', 'parentId'],
      defaultExpanded: true,
    },
    {
      title: 'Organization',
      fields: ['organizationId', 'storeId'],
      defaultExpanded: true,
    },
  ],
};

// EntityConfig for API route generator
export const categoryConfig = {
  name: 'category',
  displayName: 'Category',
  description: 'Manage product categories and their hierarchies',
  path: '/categories',
  service: CategoryService,
  schemas: {
    base: baseCategorySchema,
    create: createCategorySchema,
    update: updateCategorySchema,
    query: categoryQuerySchema,
    response: categoryResponseSchema,
    listResponse: categoriesListResponseSchema,
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
    create: ['category:create'],
    read: ['category:read'],
    update: ['category:update'],
    delete: ['category:delete'],
    list: ['category:list'],
    search: ['category:search'],
    bulkOperations: ['category:bulk'],
    import: ['category:import'],
    export: ['category:export'],
    stats: ['category:stats'],
  },
  validation: {
    uniqueFields: ['slug', 'organizationId'],
    requiredFields: ['name', 'slug', 'organizationId'],
    businessRules: [
      'Category slugs must be unique within an organization',
      'Parent categories must exist and be active',
      'Categories with children cannot be deleted',
    ],
  },
  api: {
    endpoints: {
      create: {
        method: 'POST',
        path: '/',
        description: 'Create a new category',
      },
      findById: {
        method: 'GET',
        path: '/:id',
        description: 'Get category by ID',
      },
      list: {
        method: 'GET',
        path: '/',
        description: 'List categories with filtering and pagination',
      },
      update: {
        method: 'PUT',
        path: '/:id',
        description: 'Update a category',
      },
      delete: {
        method: 'DELETE',
        path: '/:id',
        description: 'Delete a category (soft delete)',
      },
      search: {
        method: 'GET',
        path: '/search',
        description: 'Search categories',
      },
      bulkOperation: {
        method: 'POST',
        path: '/bulk',
        description: 'Perform bulk operations on categories',
      },
      import: {
        method: 'POST',
        path: '/import',
        description: 'Import categories from external data',
      },
      export: {
        method: 'GET',
        path: '/export',
        description: 'Export categories to external format',
      },
      stats: {
        method: 'GET',
        path: '/stats',
        description: 'Get category statistics',
      },
    },
    examples: {
      create: {
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic devices and accessories',
        isActive: true,
        isPublished: true,
        organizationId: 'org_123',
        storeId: 'store_456',
      },
      update: {
        name: 'Consumer Electronics',
        description: 'Updated description for consumer electronics',
        isPublished: true,
      },
      query: {
        search: 'electronics',
        isActive: true,
        page: 1,
        limit: 20,
        sortBy: 'sortOrder',
        sortOrder: 'asc',
      },
    },
  },
  ui: {
    display: {
      listFields: ['name', 'slug', 'isActive', 'isPublished', 'sortOrder', 'parentId'],
      detailFields: ['name', 'slug', 'description', 'imageUrl', 'isActive', 'isPublished', 'sortOrder', 'parentId', 'organizationId'],
      searchFields: ['name', 'slug', 'description'],
      sortFields: ['name', 'sortOrder', 'createdAt', 'updatedAt'],
      filterFields: ['isActive', 'isPublished', 'parentId', 'organizationId'],
    },
    forms: {
      create: {
        fields: [
          { name: 'name', type: 'text', required: true, label: 'Name' },
          { name: 'slug', type: 'text', required: true, label: 'Slug' },
          { name: 'isActive', type: 'checkbox', required: false, label: 'Active' },
        ],
      },
      update: {
        fields: [
          { name: 'name', type: 'text', required: false, label: 'Name' },
          { name: 'description', type: 'textarea', required: false, label: 'Description' },
          { name: 'isActive', type: 'checkbox', required: false, label: 'Active' },
        ],
      },
    },
  },
};

export type CategoryTableColumn = typeof categoryTableColumns[number];
export type CategoryFormField = typeof categoryFormFields[number]; 