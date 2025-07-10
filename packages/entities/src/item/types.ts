import { ItemStatus, Priority } from '@humanui/db';

// Base Item type matching Prisma schema
export interface Item {
  id: string;
  categoryType: string;
  sku: string;
  name: string;
  description?: string | null;
  hasVariants: boolean;
  variantGroups?: any;
  fulfillmentMethod: string;
  fulfillmentConfig: any;
  regulatoryFlags: any;
  complianceRequired: boolean;
  basePrice: number;
  currency: string;
  pricingRules: any;
  status: ItemStatus;
  priority: Priority;
  tags: string[];
  metadata?: any;
  organizationId: string;
  storeId?: string | null;
  categoryId?: string | null;
  tenantId?: string | null;
  createdBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Create Item type (without id, timestamps)
export type CreateItem = Omit<Item, 'id' | 'createdAt' | 'updatedAt'>;

// Update Item type (all fields optional except id)
export type UpdateItem = Partial<Omit<Item, 'id' | 'createdAt' | 'updatedAt'>> & {
  id: string;
};

// Item query type for filtering
export interface ItemQuery {
  search?: string;
  status?: ItemStatus;
  priority?: Priority;
  tags?: string[];
  tenantId?: string;
  createdBy?: string;
  organizationId?: string;
  storeId?: string;
  categoryId?: string;
  categoryType?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'status' | 'priority' | 'createdAt' | 'updatedAt' | 'basePrice' | 'sku';
  sortOrder?: 'asc' | 'desc';
}

// Item response type
export type ItemResponse = Item;

// Items list response type
export interface ItemsListResponse {
  items: ItemResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Item filters type
export interface ItemFilters {
  status?: ItemStatus;
  priority?: Priority;
  tags?: string[];
  categoryType?: string;
  organizationId?: string;
  storeId?: string;
  categoryId?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

// Item sort options
export type ItemSortField = 'name' | 'status' | 'priority' | 'createdAt' | 'updatedAt' | 'basePrice' | 'sku';
export type ItemSortOrder = 'asc' | 'desc';

// Item statistics
export interface ItemStats {
  total: number;
  byStatus: Record<ItemStatus, number>;
  byPriority: Record<Priority, number>;
  byMonth: Record<string, number>;
}

// Item bulk operations
export interface BulkItemOperation {
  ids: string[];
  operation: 'delete' | 'archive' | 'activate' | 'updateStatus' | 'updatePriority' | 'update';
  data?: Partial<UpdateItem>;
}

// Item import/export
export interface ItemImportData {
  categoryType: string;
  sku: string;
  name: string;
  description?: string;
  basePrice: number;
  currency?: string;
  status?: ItemStatus;
  priority?: Priority;
  tags?: string[];
  metadata?: any;
  organizationId: string;
  storeId?: string;
  categoryId?: string;
}

export interface ItemExportOptions {
  format: 'csv' | 'json' | 'xlsx';
  filters?: ItemFilters;
  fields?: (keyof Item)[];
} 