// Export Item entity
export * from './schema';
export * from './config';
export { ItemService } from './service';
// Export types separately to avoid conflicts
export type {
  ItemStats,
  BulkItemOperation,
  ItemImportData,
  ItemExportOptions,
  ItemFilters,
  ItemSortField,
  ItemSortOrder
} from './types'; 