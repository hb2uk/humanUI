import { z } from 'zod';

// Inventory transaction schema
export const inventoryTransactionSchema = z.object({
  id: z.string().optional(),
  itemId: z.string().min(1, 'Item ID is required'),
  variantId: z.string().optional(),
  transactionType: z.enum(['in', 'out', 'adjustment', 'reserved']),
  quantity: z.number().min(0, 'Quantity must be non-negative'),
  previousQuantity: z.number().min(0).optional(),
  newQuantity: z.number().min(0).optional(),
  reason: z.string().optional(),
  referenceId: z.string().optional(), // Order ID, transfer ID, etc.
  referenceType: z.string().optional(),
  notes: z.string().optional(),
  createdBy: z.string().optional(),
  createdAt: z.date().optional(),
});

// Create inventory transaction schema
export const createInventoryTransactionSchema = inventoryTransactionSchema.omit({
  id: true,
  createdAt: true,
});

// Update inventory transaction schema
export const updateInventoryTransactionSchema = inventoryTransactionSchema.partial().extend({
  id: z.string().min(1, 'Transaction ID is required'),
});

// Inventory transaction list query schema
export const inventoryTransactionListQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  itemId: z.string().optional(),
  variantId: z.string().optional(),
  transactionType: z.enum(['in', 'out', 'adjustment', 'reserved']).optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  sortBy: z.enum(['createdAt', 'quantity', 'transactionType']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Export types
export type InventoryTransaction = z.infer<typeof inventoryTransactionSchema>;
export type CreateInventoryTransaction = z.infer<typeof createInventoryTransactionSchema>;
export type UpdateInventoryTransaction = z.infer<typeof updateInventoryTransactionSchema>;
export type InventoryTransactionListQuery = z.infer<typeof inventoryTransactionListQuerySchema>; 