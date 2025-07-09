import { z } from 'zod';
import { itemAttributeSchema, createItemAttributeSchema, updateItemAttributeSchema, itemAttributeQuerySchema } from './schema';

// Re-export schema types
export type ItemAttribute = z.infer<typeof itemAttributeSchema>;
export type CreateItemAttribute = z.infer<typeof createItemAttributeSchema>;
export type UpdateItemAttribute = z.infer<typeof updateItemAttributeSchema>;
export type ItemAttributeQuery = z.infer<typeof itemAttributeQuerySchema>;

// ItemAttribute type enum
export enum ItemAttributeType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  ENUM = 'enum',
  JSON = 'json',
}

// ItemAttribute status enum
export enum ItemAttributeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DEPRECATED = 'DEPRECATED',
}

// ItemAttribute validation rule interface
export interface ItemAttributeValidationRule {
  type: 'min' | 'max' | 'pattern' | 'required' | 'custom';
  value: any;
  message?: string;
}

// ItemAttribute metadata interface
export interface ItemAttributeMetadata {
  fieldType?: string;
  inputType?: string;
  placeholder?: string;
  helpText?: string;
  options?: Array<{ label: string; value: any }>;
  customFields?: Record<string, any>;
}

// ItemAttribute statistics interface
export interface ItemAttributeStats {
  totalAttributes: number;
  activeAttributes: number;
  requiredAttributes: number;
  attributesByType: Record<string, number>;
  topUsedAttributes: Array<{
    id: string;
    name: string;
    usageCount: number;
  }>;
}

// ItemAttribute bulk operation interface
export interface ItemAttributeBulkOperation {
  ids: string[];
  operation: 'activate' | 'deactivate' | 'delete' | 'update';
  data?: Partial<UpdateItemAttribute>;
}

// ItemAttribute import/export interface
export interface ItemAttributeImportData {
  name: string;
  displayName: string;
  description?: string;
  attributeType: ItemAttributeType;
  dataType: string;
  isRequired?: boolean;
  defaultValue?: any;
  validationRules?: Record<string, any>;
  sortOrder?: number;
  isActive?: boolean;
}

export interface ItemAttributeExportData extends ItemAttributeImportData {
  id: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

// ItemAttribute validation error interface
export interface ItemAttributeValidationError {
  field: string;
  message: string;
  code: string;
}

// ItemAttribute service interface
export interface IItemAttributeService {
  create(data: CreateItemAttribute, tenantId?: string): Promise<ItemAttribute>;
  findById(id: string, tenantId?: string): Promise<ItemAttribute | null>;
  list(query: ItemAttributeQuery, tenantId?: string): Promise<{
    itemAttributes: ItemAttribute[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
  update(id: string, data: UpdateItemAttribute, tenantId?: string): Promise<ItemAttribute>;
  delete(id: string, tenantId?: string): Promise<boolean>;
  getStats(tenantId?: string): Promise<ItemAttributeStats>;
  bulkOperation(operation: ItemAttributeBulkOperation, tenantId?: string): Promise<boolean>;
  import(data: ItemAttributeImportData[], organizationId: string, tenantId?: string): Promise<ItemAttribute[]>;
  export(organizationId: string, tenantId?: string): Promise<ItemAttributeExportData[]>;
} 