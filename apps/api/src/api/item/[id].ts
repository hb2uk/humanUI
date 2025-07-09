import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { ItemService } from '@humanui/entities';
import { prisma } from '@humanui/db';
import { withTenant, TenantRequest } from '../../middleware/tenant';
import { withOptionalLocale, LocaleRequest } from '../../middleware/locale';
import { updateItemSchema } from '@humanui/entities';

const router = Router();

// Combined request type for tenant and locale
interface ItemRequest extends TenantRequest, LocaleRequest {}

// Initialize ItemService
const itemService = new ItemService(prisma);

/**
 * GET /api/items/:id - Get a specific item by ID
 */
router.get('/:id', withTenant(), withOptionalLocale(), async (req: ItemRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        error: 'Validation Error',
        code: 'VALIDATION_ERROR',
        message: 'Valid item ID is required'
      });
    }

    // Get item with tenant isolation
    const item = await itemService.getById(id, req.tenantId);

    if (!item) {
      return res.status(404).json({
        error: 'Not Found',
        code: 'ITEM_NOT_FOUND',
        message: 'Item not found'
      });
    }

    // Format response based on locale
    const formattedItem = {
      ...item,
      createdAt: formatDate(item.createdAt, req.localeSettings?.dateFormat),
      updatedAt: formatDate(item.updatedAt, req.localeSettings?.dateFormat),
    };

    // Return JSON API response
    res.json({
      data: formattedItem,
      meta: {
        retrieved: new Date().toISOString(),
        tenant: req.tenantId
      },
      links: {
        self: `${req.protocol}://${req.get('host')}/api/items/${id}`,
        collection: `${req.protocol}://${req.get('host')}/api/items`
      }
    });

  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      code: 'INTERNAL_ERROR',
      message: 'Failed to fetch item'
    });
  }
});

/**
 * PUT /api/items/:id - Update a specific item
 */
router.put('/:id', withTenant(), withOptionalLocale(), async (req: ItemRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        error: 'Validation Error',
        code: 'VALIDATION_ERROR',
        message: 'Valid item ID is required'
      });
    }

    // Parse and validate request body
    const updateData = updateItemSchema.parse({
      id,
      ...req.body
    });

    // Check if item exists and belongs to tenant
    const existingItem = await itemService.getById(id, req.tenantId);
    if (!existingItem) {
      return res.status(404).json({
        error: 'Not Found',
        code: 'ITEM_NOT_FOUND',
        message: 'Item not found'
      });
    }

    // Update item with tenant isolation
    const updatedItem = await itemService.update(updateData, req.tenantId);

    // Format response based on locale
    const formattedItem = {
      ...updatedItem,
      createdAt: formatDate(updatedItem.createdAt, req.localeSettings?.dateFormat),
      updatedAt: formatDate(updatedItem.updatedAt, req.localeSettings?.dateFormat),
    };

    // Return JSON API response
    res.json({
      data: formattedItem,
      meta: {
        updated: true,
        timestamp: new Date().toISOString(),
        tenant: req.tenantId
      },
      links: {
        self: `${req.protocol}://${req.get('host')}/api/items/${id}`,
        collection: `${req.protocol}://${req.get('host')}/api/items`
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation Error',
        code: 'VALIDATION_ERROR',
        message: 'Invalid item data',
        details: error.errors
      });
    }

    console.error('Error updating item:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      code: 'INTERNAL_ERROR',
      message: 'Failed to update item'
    });
  }
});

/**
 * PATCH /api/items/:id - Partially update a specific item
 */
router.patch('/:id', withTenant(), withOptionalLocale(), async (req: ItemRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        error: 'Validation Error',
        code: 'VALIDATION_ERROR',
        message: 'Valid item ID is required'
      });
    }

    // Check if item exists and belongs to tenant
    const existingItem = await itemService.getById(id, req.tenantId);
    if (!existingItem) {
      return res.status(404).json({
        error: 'Not Found',
        code: 'ITEM_NOT_FOUND',
        message: 'Item not found'
      });
    }

    // Create update data with existing item as base
    const updateData = {
      id,
      ...req.body
    };

    // Update item with tenant isolation
    const updatedItem = await itemService.update(updateData, req.tenantId);

    // Format response based on locale
    const formattedItem = {
      ...updatedItem,
      createdAt: formatDate(updatedItem.createdAt, req.localeSettings?.dateFormat),
      updatedAt: formatDate(updatedItem.updatedAt, req.localeSettings?.dateFormat),
    };

    // Return JSON API response
    res.json({
      data: formattedItem,
      meta: {
        updated: true,
        timestamp: new Date().toISOString(),
        tenant: req.tenantId
      },
      links: {
        self: `${req.protocol}://${req.get('host')}/api/items/${id}`,
        collection: `${req.protocol}://${req.get('host')}/api/items`
      }
    });

  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      code: 'INTERNAL_ERROR',
      message: 'Failed to update item'
    });
  }
});

/**
 * DELETE /api/items/:id - Delete (soft delete) a specific item
 */
router.delete('/:id', withTenant(), withOptionalLocale(), async (req: ItemRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        error: 'Validation Error',
        code: 'VALIDATION_ERROR',
        message: 'Valid item ID is required'
      });
    }

    // Check if item exists and belongs to tenant
    const existingItem = await itemService.getById(id, req.tenantId);
    if (!existingItem) {
      return res.status(404).json({
        error: 'Not Found',
        code: 'ITEM_NOT_FOUND',
        message: 'Item not found'
      });
    }

    // Soft delete item (set status to DELETED)
    const deletedItem = await itemService.delete(id, req.tenantId);

    // Format response based on locale
    const formattedItem = {
      ...deletedItem,
      createdAt: formatDate(deletedItem.createdAt, req.localeSettings?.dateFormat),
      updatedAt: formatDate(deletedItem.updatedAt, req.localeSettings?.dateFormat),
    };

    // Return JSON API response
    res.json({
      data: formattedItem,
      meta: {
        deleted: true,
        timestamp: new Date().toISOString(),
        tenant: req.tenantId
      },
      links: {
        collection: `${req.protocol}://${req.get('host')}/api/items`
      }
    });

  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      code: 'INTERNAL_ERROR',
      message: 'Failed to delete item'
    });
  }
});

/**
 * DELETE /api/items/:id/hard - Hard delete a specific item
 */
router.delete('/:id/hard', withTenant(), withOptionalLocale(), async (req: ItemRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        error: 'Validation Error',
        code: 'VALIDATION_ERROR',
        message: 'Valid item ID is required'
      });
    }

    // Check if item exists and belongs to tenant
    const existingItem = await itemService.getById(id, req.tenantId);
    if (!existingItem) {
      return res.status(404).json({
        error: 'Not Found',
        code: 'ITEM_NOT_FOUND',
        message: 'Item not found'
      });
    }

    // Hard delete item
    const deletedItem = await itemService.hardDelete(id, req.tenantId);

    // Return JSON API response
    res.json({
      data: { id: deletedItem.id },
      meta: {
        hardDeleted: true,
        timestamp: new Date().toISOString(),
        tenant: req.tenantId
      },
      links: {
        collection: `${req.protocol}://${req.get('host')}/api/items`
      }
    });

  } catch (error) {
    console.error('Error hard deleting item:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      code: 'INTERNAL_ERROR',
      message: 'Failed to hard delete item'
    });
  }
});

// Helper function to format dates based on locale
function formatDate(date: Date, dateFormat?: string): string {
  if (!dateFormat) return date.toISOString();
  
  // Simple date formatting based on format string
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  switch (dateFormat) {
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'DD.MM.YYYY':
      return `${day}.${month}.${year}`;
    case 'YYYY/MM/DD':
      return `${year}/${month}/${day}`;
    default:
      return date.toISOString();
  }
}

export default router; 