import { z } from 'zod';
import { OrganizationService } from './service';
import { 
  organizationSchema as baseOrganizationSchema, 
  createOrganizationSchema, 
  updateOrganizationSchema, 
  organizationQuerySchema,
  organizationResponseSchema,
  organizationsListResponseSchema
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

export const organizationTableColumns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'slug', label: 'Slug', sortable: true },
  { key: 'isActive', label: 'Active', sortable: true },
  { key: 'isPublic', label: 'Public', sortable: true },
  { key: 'email', label: 'Email', sortable: false },
  { key: 'phone', label: 'Phone', sortable: false },
  { key: 'createdAt', label: 'Created At', sortable: true },
  { key: 'updatedAt', label: 'Updated At', sortable: true },
];

export const organizationFormFields = [
  {
    name: 'name',
    label: 'Name',
    type: 'text' as const,
    required: true,
    placeholder: 'Enter organization name',
  },
  {
    name: 'slug',
    label: 'Slug',
    type: 'text' as const,
    required: true,
    placeholder: 'Enter organization slug',
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea' as const,
    required: false,
    placeholder: 'Enter description',
  },
  {
    name: 'logoUrl',
    label: 'Logo URL',
    type: 'text' as const,
    required: false,
    placeholder: 'Enter logo URL',
  },
  {
    name: 'website',
    label: 'Website',
    type: 'text' as const,
    required: false,
    placeholder: 'Enter website URL',
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email' as const,
    required: false,
    placeholder: 'Enter email address',
  },
  {
    name: 'phone',
    label: 'Phone',
    type: 'text' as const,
    required: false,
    placeholder: 'Enter phone number',
  },
  {
    name: 'address.street',
    label: 'Street Address',
    type: 'text' as const,
    required: false,
    placeholder: 'Enter street address',
  },
  {
    name: 'address.city',
    label: 'City',
    type: 'text' as const,
    required: false,
    placeholder: 'Enter city',
  },
  {
    name: 'address.state',
    label: 'State/Province',
    type: 'text' as const,
    required: false,
    placeholder: 'Enter state or province',
  },
  {
    name: 'address.postalCode',
    label: 'Postal Code',
    type: 'text' as const,
    required: false,
    placeholder: 'Enter postal code',
  },
  {
    name: 'address.country',
    label: 'Country',
    type: 'text' as const,
    required: false,
    placeholder: 'Enter country',
  },
  {
    name: 'isActive',
    label: 'Active',
    type: 'checkbox' as const,
    required: false,
    defaultValue: true,
  },
  {
    name: 'isPublic',
    label: 'Public',
    type: 'checkbox' as const,
    required: false,
    defaultValue: false,
  },
];

export const organizationFormSchema = createOrganizationSchema;

export const organizationFormConfig: EntityFormConfig = {
  schema: organizationFormSchema,
  fields: organizationFormFields,
  title: 'Organization',
  description: 'Create or edit an organization',
  submitLabel: 'Save Organization',
  cancelLabel: 'Cancel',
  layout: 'two-column',
  sections: [
    {
      title: 'Basic Information',
      fields: ['name', 'slug', 'description', 'logoUrl', 'website'],
      defaultExpanded: true,
    },
    {
      title: 'Contact Information',
      fields: ['email', 'phone'],
      defaultExpanded: true,
    },
    {
      title: 'Address',
      fields: ['address.street', 'address.city', 'address.state', 'address.postalCode', 'address.country'],
      defaultExpanded: false,
    },
    {
      title: 'Settings',
      fields: ['isActive', 'isPublic'],
      defaultExpanded: true,
    },
  ],
};

// EntityConfig for API route generator
export const organizationConfig = {
  name: 'organization',
  displayName: 'Organization',
  description: 'Manage organizations and their configurations',
  path: 'organizations',
  service: OrganizationService,
  schemas: {
    base: baseOrganizationSchema,
    create: createOrganizationSchema,
    update: updateOrganizationSchema,
    query: organizationQuerySchema,
    response: organizationResponseSchema,
    listResponse: organizationsListResponseSchema,
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
    create: ['organization:create'],
    read: ['organization:read'],
    update: ['organization:update'],
    delete: ['organization:delete'],
    list: ['organization:list'],
    search: ['organization:search'],
    bulkOperations: ['organization:bulk'],
    import: ['organization:import'],
    export: ['organization:export'],
    stats: ['organization:stats'],
  },
  validation: {
    uniqueFields: ['slug'],
    requiredFields: ['name', 'slug'],
    businessRules: [
      'Organization slugs must be unique globally',
      'Active organizations cannot be deleted if they have active stores',
      'Public organizations are visible to all users',
    ],
  },
  api: {
    endpoints: {
      create: {
        method: 'POST',
        path: '/',
        description: 'Create a new organization',
      },
      findById: {
        method: 'GET',
        path: '/:id',
        description: 'Get organization by ID',
      },
      list: {
        method: 'GET',
        path: '/',
        description: 'List organizations with filtering and pagination',
      },
      update: {
        method: 'PUT',
        path: '/:id',
        description: 'Update an organization',
      },
      delete: {
        method: 'DELETE',
        path: '/:id',
        description: 'Delete an organization (soft delete)',
      },
      search: {
        method: 'GET',
        path: '/search',
        description: 'Search organizations',
      },
      bulkOperation: {
        method: 'POST',
        path: '/bulk',
        description: 'Perform bulk operations on organizations',
      },
      import: {
        method: 'POST',
        path: '/import',
        description: 'Import organizations from external data',
      },
      export: {
        method: 'GET',
        path: '/export',
        description: 'Export organizations to external format',
      },
      stats: {
        method: 'GET',
        path: '/stats',
        description: 'Get organization statistics',
      },
    },
    examples: {
      create: {
        name: 'Acme Corporation',
        slug: 'acme-corp',
        description: 'A leading technology company',
        website: 'https://acme.com',
        email: 'contact@acme.com',
        phone: '+1-555-0123',
        isActive: true,
        isPublic: true,
      },
      update: {
        name: 'Acme Corporation Inc.',
        description: 'Updated description for Acme Corporation',
        isPublic: false,
      },
      query: {
        search: 'acme',
        isActive: true,
        isPublic: true,
        page: 1,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      },
    },
  },
  ui: {
    display: {
      listFields: ['name', 'slug', 'isActive', 'isPublic', 'email', 'website'],
      detailFields: ['name', 'slug', 'description', 'logoUrl', 'website', 'email', 'phone', 'address', 'isActive', 'isPublic'],
      searchFields: ['name', 'slug', 'description'],
      sortFields: ['name', 'slug', 'createdAt', 'updatedAt'],
      filterFields: ['isActive', 'isPublic'],
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

export type OrganizationTableColumn = typeof organizationTableColumns[number];
export type OrganizationFormField = typeof organizationFormFields[number]; 