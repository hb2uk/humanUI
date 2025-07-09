import { EntityConfig } from '../../types';
import { ItemAttributeService } from './service';
import { 
  itemAttributeSchema, 
  createItemAttributeSchema, 
  updateItemAttributeSchema, 
  itemAttributeQuerySchema,
  itemAttributeResponseSchema,
  itemAttributesListResponseSchema
} from './schema';

export const itemAttributeConfig: EntityConfig = {
  name: 'itemAttribute',
  displayName: 'Item Attribute',
  description: 'Manage item attributes and their configurations',
  path: '/item-attributes',
  service: ItemAttributeService,
  schemas: {
    base: itemAttributeSchema,
    create: createItemAttributeSchema,
    update: updateItemAttributeSchema,
    query: itemAttributeQuerySchema,
    response: itemAttributeResponseSchema,
    listResponse: itemAttributesListResponseSchema,
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
    create: ['item-attribute:create'],
    read: ['item-attribute:read'],
    update: ['item-attribute:update'],
    delete: ['item-attribute:delete'],
    list: ['item-attribute:list'],
    search: ['item-attribute:search'],
    bulkOperations: ['item-attribute:bulk'],
    import: ['item-attribute:import'],
    export: ['item-attribute:export'],
    stats: ['item-attribute:stats'],
  },
  validation: {
    uniqueFields: ['name', 'organizationId'],
    requiredFields: ['name', 'displayName', 'attributeType', 'dataType', 'organizationId'],
    businessRules: [
      'Attribute names must be unique within an organization',
      'Required attributes cannot be deleted if used by items',
      'Attribute types must be one of: string, number, boolean, enum, json',
    ],
  },
  api: {
    endpoints: {
      create: {
        method: 'POST',
        path: '/',
        description: 'Create a new item attribute',
      },
      findById: {
        method: 'GET',
        path: '/:id',
        description: 'Get item attribute by ID',
      },
      list: {
        method: 'GET',
        path: '/',
        description: 'List item attributes with filtering and pagination',
      },
      update: {
        method: 'PUT',
        path: '/:id',
        description: 'Update an item attribute',
      },
      delete: {
        method: 'DELETE',
        path: '/:id',
        description: 'Delete an item attribute (soft delete)',
      },
      search: {
        method: 'GET',
        path: '/search',
        description: 'Search item attributes',
      },
      bulkOperation: {
        method: 'POST',
        path: '/bulk',
        description: 'Perform bulk operations on item attributes',
      },
      import: {
        method: 'POST',
        path: '/import',
        description: 'Import item attributes from external data',
      },
      export: {
        method: 'GET',
        path: '/export',
        description: 'Export item attributes to external format',
      },
      stats: {
        method: 'GET',
        path: '/stats',
        description: 'Get item attribute statistics',
      },
    },
    examples: {
      create: {
        name: 'color',
        displayName: 'Color',
        description: 'Product color attribute',
        attributeType: 'enum',
        dataType: 'string',
        isRequired: true,
        defaultValue: 'black',
        validationRules: {
          options: ['red', 'blue', 'green', 'black', 'white']
        },
        sortOrder: 1,
        isActive: true,
        organizationId: 'org_123',
      },
      update: {
        displayName: 'Product Color',
        description: 'Updated product color attribute',
        isRequired: false,
      },
      query: {
        search: 'color',
        attributeType: 'enum',
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
      listFields: ['name', 'displayName', 'attributeType', 'isRequired', 'isActive', 'sortOrder'],
      detailFields: ['name', 'displayName', 'description', 'attributeType', 'dataType', 'isRequired', 'defaultValue', 'validationRules', 'sortOrder', 'isActive', 'organizationId'],
      searchFields: ['name', 'displayName', 'description'],
      sortFields: ['name', 'displayName', 'sortOrder', 'createdAt', 'updatedAt'],
      filterFields: ['attributeType', 'isRequired', 'isActive', 'organizationId'],
    },
    forms: {
      create: {
        fields: [
          { name: 'name', type: 'text', required: true, label: 'Name' },
          { name: 'displayName', type: 'text', required: true, label: 'Display Name' },
          { name: 'description', type: 'textarea', required: false, label: 'Description' },
          { name: 'attributeType', type: 'select', required: true, label: 'Attribute Type', options: ['string', 'number', 'boolean', 'enum', 'json'] },
          { name: 'dataType', type: 'text', required: true, label: 'Data Type' },
          { name: 'isRequired', type: 'checkbox', required: false, label: 'Required' },
          { name: 'defaultValue', type: 'text', required: false, label: 'Default Value' },
          { name: 'sortOrder', type: 'number', required: false, label: 'Sort Order' },
          { name: 'isActive', type: 'checkbox', required: false, label: 'Active' },
        ],
      },
      update: {
        fields: [
          { name: 'displayName', type: 'text', required: false, label: 'Display Name' },
          { name: 'description', type: 'textarea', required: false, label: 'Description' },
          { name: 'isRequired', type: 'checkbox', required: false, label: 'Required' },
          { name: 'defaultValue', type: 'text', required: false, label: 'Default Value' },
          { name: 'sortOrder', type: 'number', required: false, label: 'Sort Order' },
          { name: 'isActive', type: 'checkbox', required: false, label: 'Active' },
        ],
      },
    },
  },
}; 