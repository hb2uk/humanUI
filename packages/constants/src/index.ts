// Entity types
export const ENTITY_TYPES = {
  ITEM: 'item',
  CATEGORY: 'category',
  STORE: 'store',
  ORGANIZATION: 'organization',
  ITEM_ATTRIBUTE: 'itemAttribute',
  USER: 'user',
} as const;

export type EntityType = typeof ENTITY_TYPES[keyof typeof ENTITY_TYPES];

// Item types
export const ITEM_TYPES = {
  PRODUCT: 'product',
  SERVICE: 'service',
  DIGITAL: 'digital',
  PHYSICAL: 'physical',
} as const;

export type ItemType = typeof ITEM_TYPES[keyof typeof ITEM_TYPES];

// Item attribute types
export const ATTRIBUTE_TYPES = {
  TEXT: 'text',
  NUMBER: 'number',
  SELECT: 'select',
  MULTISELECT: 'multiselect',
  BOOLEAN: 'boolean',
  DATE: 'date',
  DATETIME: 'datetime',
  JSON: 'json',
} as const;

export type AttributeType = typeof ATTRIBUTE_TYPES[keyof typeof ATTRIBUTE_TYPES];

// Store types
export const STORE_TYPES = {
  RETAIL: 'retail',
  WHOLESALE: 'wholesale',
  ONLINE: 'online',
  HYBRID: 'hybrid',
} as const;

export type StoreType = typeof STORE_TYPES[keyof typeof STORE_TYPES];

// Fulfillment methods
export const FULFILLMENT_METHODS = {
  PICKUP: 'pickup',
  DELIVERY: 'delivery',
  SHIPPING: 'shipping',
  DIGITAL: 'digital',
} as const;

export type FulfillmentMethod = typeof FULFILLMENT_METHODS[keyof typeof FULFILLMENT_METHODS];

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
  GUEST: 'guest',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// Status types
export const STATUS_TYPES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  SUSPENDED: 'suspended',
} as const;

export type StatusType = typeof STATUS_TYPES[keyof typeof STATUS_TYPES];

// Validation rules
export const VALIDATION_RULES = {
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_TITLE_LENGTH: 200,
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
} as const;

// Pagination defaults
export const PAGINATION_DEFAULTS = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// Sort options
export const SORT_OPTIONS = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

export type SortOrder = typeof SORT_OPTIONS[keyof typeof SORT_OPTIONS];

// Common sort fields
export const SORT_FIELDS = {
  NAME: 'name',
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt',
  ID: 'id',
} as const;

export type SortField = typeof SORT_FIELDS[keyof typeof SORT_FIELDS];

// Error codes
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  TENANT_ERROR: 'TENANT_ERROR',
  BUSINESS_LOGIC_ERROR: 'BUSINESS_LOGIC_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

// UI constants
export const UI_CONSTANTS = {
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 200,
  TOAST_DURATION: 5000,
} as const;

// API constants
export const API_CONSTANTS = {
  DEFAULT_TIMEOUT: 30000,
  MAX_RETRIES: 3,
  RATE_LIMIT_WINDOW: 60000, // 1 minute
  RATE_LIMIT_MAX_REQUESTS: 100,
} as const; 