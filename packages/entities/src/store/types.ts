import { z } from 'zod';
import { storeSchema, createStoreSchema, updateStoreSchema, storeQuerySchema } from './schema';

// Re-export schema types
export type Store = z.infer<typeof storeSchema>;
export type CreateStore = z.infer<typeof createStoreSchema>;
export type UpdateStore = z.infer<typeof updateStoreSchema>;
export type StoreQuery = z.infer<typeof storeQuerySchema>;

// Store status enum
export enum StoreStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE',
  CLOSED = 'CLOSED',
}

// Store type enum
export enum StoreType {
  RETAIL = 'RETAIL',
  ONLINE = 'ONLINE',
  HYBRID = 'HYBRID',
  WHOLESALE = 'WHOLESALE',
  POPUP = 'POPUP',
  MARKETPLACE = 'MARKETPLACE',
}

// Store settings interface
export interface StoreSettings {
  currency: string;
  language: string;
  timezone: string;
  taxRate: number;
  shippingEnabled: boolean;
  pickupEnabled: boolean;
  deliveryEnabled: boolean;
  maxOrderValue?: number;
  minOrderValue?: number;
  customFields?: Record<string, any>;
}

// Store operating schedule interface
export interface StoreOperatingSchedule {
  monday?: OperatingHours;
  tuesday?: OperatingHours;
  wednesday?: OperatingHours;
  thursday?: OperatingHours;
  friday?: OperatingHours;
  saturday?: OperatingHours;
  sunday?: OperatingHours;
}

// Operating hours interface
export interface OperatingHours {
  open: string;
  close: string;
  isClosed: boolean;
  breakStart?: string;
  breakEnd?: string;
}

// Store statistics interface
export interface StoreStats {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  totalCustomers: number;
  totalProducts: number;
  totalCategories: number;
  ordersThisMonth: number;
  revenueThisMonth: number;
  topProducts: Array<{
    id: string;
    name: string;
    salesCount: number;
  }>;
}

// Store bulk operation interface
export interface StoreBulkOperation {
  ids: string[];
  operation: 'activate' | 'deactivate' | 'delete' | 'update';
  data?: Partial<UpdateStore>;
}

// Store import/export interface
export interface StoreImportData {
  name: string;
  displayName?: string;
  description?: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  phone?: string;
  email?: string;
  timezone?: string;
  storeType?: string;
  isActive?: boolean;
  operatingHours?: Record<string, OperatingHours>;
}

export interface StoreExportData extends StoreImportData {
  id: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  stats: StoreStats;
}

// Store validation error interface
export interface StoreValidationError {
  field: string;
  message: string;
  code: string;
}

// Store service interface
export interface IStoreService {
  create(data: CreateStore, tenantId?: string): Promise<Store>;
  findById(id: string, tenantId?: string): Promise<Store | null>;
  list(query: StoreQuery, tenantId?: string): Promise<{
    stores: Store[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
  update(id: string, data: UpdateStore, tenantId?: string): Promise<Store>;
  delete(id: string, tenantId?: string): Promise<boolean>;
  getStats(id: string, tenantId?: string): Promise<StoreStats>;
  bulkOperation(operation: StoreBulkOperation, tenantId?: string): Promise<boolean>;
  import(data: StoreImportData[], organizationId: string, tenantId?: string): Promise<Store[]>;
  export(organizationId: string, tenantId?: string): Promise<StoreExportData[]>;
  getOperatingHours(id: string, date?: Date, tenantId?: string): Promise<OperatingHours | null>;
  isOpen(id: string, date?: Date, tenantId?: string): Promise<boolean>;
} 