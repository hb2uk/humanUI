import { z } from 'zod';
import { categorySchema, createCategorySchema, updateCategorySchema, categoryQuerySchema } from './schema';

// Re-export schema types
export type Category = z.infer<typeof categorySchema>;
export type CreateCategory = z.infer<typeof createCategorySchema>;
export type UpdateCategory = z.infer<typeof updateCategorySchema>;
export type CategoryQuery = z.infer<typeof categoryQuerySchema>;

// Category status enum
export enum CategoryStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED',
}

// Category visibility enum
export enum CategoryVisibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  DRAFT = 'DRAFT',
}

// Category type enum
export enum CategoryType {
  PRODUCT = 'PRODUCT',
  SERVICE = 'SERVICE',
  BLOG = 'BLOG',
  PAGE = 'PAGE',
  CUSTOM = 'CUSTOM',
}

// Category metadata interface
export interface CategoryMetadata {
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  featured?: boolean;
  featuredOrder?: number;
  customFields?: Record<string, any>;
}

// Category tree node interface
export interface CategoryTreeNode {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string | null;
  isActive: boolean;
  isPublished: boolean;
  sortOrder: number;
  children: CategoryTreeNode[];
  productCount: number;
  level: number;
  path: string[];
}

// Category statistics interface
export interface CategoryStats {
  totalCategories: number;
  activeCategories: number;
  publishedCategories: number;
  categoriesWithProducts: number;
  averageProductsPerCategory: number;
  topCategories: Array<{
    id: string;
    name: string;
    productCount: number;
  }>;
}

// Category bulk operation interface
export interface CategoryBulkOperation {
  ids: string[];
  operation: 'activate' | 'deactivate' | 'publish' | 'unpublish' | 'delete' | 'move';
  targetParentId?: string;
  targetStoreId?: string;
}

// Category import/export interface
export interface CategoryImportData {
  name: string;
  slug: string;
  description?: string;
  parentSlug?: string;
  sortOrder?: number;
  isActive?: boolean;
  isPublished?: boolean;
  metadata?: CategoryMetadata;
}

export interface CategoryExportData extends CategoryImportData {
  id: string;
  organizationId: string;
  storeId: string;
  createdAt: string;
  updatedAt: string;
  productCount: number;
}

// Category validation error interface
export interface CategoryValidationError {
  field: string;
  message: string;
  code: string;
}

// Category service interface
export interface ICategoryService {
  create(data: CreateCategory, tenantId?: string): Promise<Category>;
  findById(id: string, tenantId?: string): Promise<Category | null>;
  list(query: CategoryQuery, tenantId?: string): Promise<{
    categories: Category[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
  update(id: string, data: UpdateCategory, tenantId?: string): Promise<Category>;
  delete(id: string, tenantId?: string): Promise<boolean>;
  getTree(storeId: string, tenantId?: string): Promise<CategoryTreeNode[]>;
  getStats(tenantId?: string): Promise<CategoryStats>;
  bulkOperation(operation: CategoryBulkOperation, tenantId?: string): Promise<boolean>;
  import(data: CategoryImportData[], organizationId: string, storeId: string, tenantId?: string): Promise<Category[]>;
  export(storeId: string, tenantId?: string): Promise<CategoryExportData[]>;
} 