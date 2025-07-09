// Export Category entity
export * from './schema';
export * from './config';
export { CategoryService } from './service';
// Export types separately to avoid conflicts
export type {
  CategoryStatus,
  CategoryVisibility,
  CategoryType,
  CategoryMetadata,
  CategoryTreeNode,
  CategoryStats,
  CategoryBulkOperation,
  CategoryImportData,
  CategoryExportData,
  CategoryValidationError,
  ICategoryService
} from './types'; 