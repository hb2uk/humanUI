import { z } from 'zod';
import { organizationSchema, createOrganizationSchema, updateOrganizationSchema, organizationQuerySchema } from './schema';

// Re-export schema types
export type Organization = z.infer<typeof organizationSchema>;
export type CreateOrganization = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganization = z.infer<typeof updateOrganizationSchema>;
export type OrganizationQuery = z.infer<typeof organizationQuerySchema>;

// Organization status enum
export enum OrganizationStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
}

// Organization type enum
export enum OrganizationType {
  COMPANY = 'COMPANY',
  NON_PROFIT = 'NON_PROFIT',
  GOVERNMENT = 'GOVERNMENT',
  EDUCATIONAL = 'EDUCATIONAL',
  INDIVIDUAL = 'INDIVIDUAL',
}

// Organization settings interface
export interface OrganizationSettings {
  currency: string;
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  taxEnabled: boolean;
  taxRate: number;
  shippingEnabled: boolean;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  features: {
    multiStore: boolean;
    analytics: boolean;
    reporting: boolean;
    integrations: boolean;
  };
  customFields?: Record<string, any>;
}

// Organization address interface
export interface OrganizationAddress {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

// Organization statistics interface
export interface OrganizationStats {
  totalStores: number;
  totalUsers: number;
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  totalRevenue: number;
  activeStores: number;
  activeUsers: number;
  storesThisMonth: number;
  revenueThisMonth: number;
  topStores: Array<{
    id: string;
    name: string;
    revenue: number;
  }>;
}

// Organization bulk operation interface
export interface OrganizationBulkOperation {
  ids: string[];
  operation: 'activate' | 'deactivate' | 'delete' | 'update';
  data?: Partial<UpdateOrganization>;
}

// Organization import/export interface
export interface OrganizationImportData {
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: OrganizationAddress;
  isActive?: boolean;
  isPublic?: boolean;
  settings?: Partial<OrganizationSettings>;
}

export interface OrganizationExportData extends OrganizationImportData {
  id: string;
  createdAt: string;
  updatedAt: string;
  stats: OrganizationStats;
}

// Organization validation error interface
export interface OrganizationValidationError {
  field: string;
  message: string;
  code: string;
}

// Organization service interface
export interface IOrganizationService {
  create(data: CreateOrganization, tenantId?: string): Promise<Organization>;
  findById(id: string, tenantId?: string): Promise<Organization | null>;
  findBySlug(slug: string, tenantId?: string): Promise<Organization | null>;
  list(query: OrganizationQuery, tenantId?: string): Promise<{
    organizations: Organization[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
  update(id: string, data: UpdateOrganization, tenantId?: string): Promise<Organization>;
  delete(id: string, tenantId?: string): Promise<boolean>;
  getStats(id: string, tenantId?: string): Promise<OrganizationStats>;
  bulkOperation(operation: OrganizationBulkOperation, tenantId?: string): Promise<boolean>;
  import(data: OrganizationImportData[], tenantId?: string): Promise<Organization[]>;
  export(tenantId?: string): Promise<OrganizationExportData[]>;
  updateSettings(id: string, settings: Partial<OrganizationSettings>, tenantId?: string): Promise<Organization>;
  getSettings(id: string, tenantId?: string): Promise<OrganizationSettings>;
} 