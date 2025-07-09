// Export ItemAttribute entity
export * from './schema';
export * from './config';
export { ItemAttributeService } from './service';
// Export types separately to avoid conflicts
export type {
  ItemAttributeType,
  ItemAttributeStatus,
  ItemAttributeValidationRule,
  ItemAttributeMetadata,
  ItemAttributeStats,
  ItemAttributeBulkOperation,
  ItemAttributeImportData,
  ItemAttributeExportData,
  ItemAttributeValidationError,
  IItemAttributeService
} from './types'; 