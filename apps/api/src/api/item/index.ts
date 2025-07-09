import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { ItemService } from '@humanui/entities';
import { prisma } from '@humanui/db';
import { withTenant, TenantRequest } from '../../middleware/tenant';
import { withOptionalLocale, LocaleRequest } from '../../middleware/locale';
import { itemQuerySchema, createItemSchema } from '@humanui/entities';

const router = Router();

// Combined request type for tenant and locale
interface ItemRequest extends TenantRequest, LocaleRequest {}

// Initialize ItemService
const itemService = new ItemService(prisma);

/**
 * GET /api/items - List items with filtering, pagination, and sorting
 */
router.get('/', withTenant(), withOptionalLocale(), async (req: ItemRequest, res: Response) => {
  try {
    // Parse and validate query parameters
    const queryParams = itemQuerySchema.parse(req.query);
    
    // Get items with tenant isolation
    const result = await itemService.list(queryParams, req.tenantId);

    // Format response based on locale
    const formattedItems = result.items.map(item => ({
      ...item,
      createdAt: formatDate(item.createdAt, req.localeSettings?.dateFormat),
      updatedAt: formatDate(item.updatedAt, req.localeSettings?.dateFormat),
    }));

    // Return JSON API response
    res.json({
      data: formattedItems,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        hasNext: result.page < result.totalPages,
        hasPrev: result.page > 1,
      },
      links: {
        self: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
        first: `${req.protocol}://${req.get('host')}${req.path}?page=1&limit=${result.limit}`,
        last: `${req.protocol}://${req.get('host')}${req.path}?page=${result.totalPages}&limit=${result.limit}`,
        next: result.page < result.totalPages 
          ? `${req.protocol}://${req.get('host')}${req.path}?page=${result.page + 1}&limit=${result.limit}`
          : null,
        prev: result.page > 1 
          ? `${req.protocol}://${req.get('host')}${req.path}?page=${result.page - 1}&limit=${result.limit}`
          : null,
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation Error',
        code: 'VALIDATION_ERROR',
        message: 'Invalid query parameters',
        details: error.errors
      });
    }

    console.error('Error fetching items:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      code: 'INTERNAL_ERROR',
      message: 'Failed to fetch items'
    });
  }
});

/**
 * POST /api/items - Create a new item
 */
router.post('/', withTenant(), withOptionalLocale(), async (req: ItemRequest, res: Response) => {
  try {
    // Parse and validate request body
    const itemData = createItemSchema.parse(req.body);
    
    // Create item with tenant isolation
    const newItem = await itemService.create(
      itemData, 
      req.tenantId, 
      req.headers['x-user-id'] as string
    );

    // Format response based on locale
    const formattedItem = {
      ...newItem,
      createdAt: formatDate(newItem.createdAt, req.localeSettings?.dateFormat),
      updatedAt: formatDate(newItem.updatedAt, req.localeSettings?.dateFormat),
    };

    // Return JSON API response
    res.status(201).json({
      data: formattedItem,
      meta: {
        created: true,
        timestamp: new Date().toISOString()
      },
      links: {
        self: `${req.protocol}://${req.get('host')}/api/items/${newItem.id}`,
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

    console.error('Error creating item:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      code: 'INTERNAL_ERROR',
      message: 'Failed to create item'
    });
  }
});

/**
 * GET /api/items/stats - Get item statistics
 */
router.get('/stats', withTenant(), withOptionalLocale(), async (req: ItemRequest, res: Response) => {
  try {
    const stats = await itemService.getStats(req.tenantId);

    res.json({
      data: stats,
      meta: {
        generated: new Date().toISOString(),
        tenant: req.tenantId
      }
    });

  } catch (error) {
    console.error('Error fetching item stats:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      code: 'INTERNAL_ERROR',
      message: 'Failed to fetch item statistics'
    });
  }
});

/**
 * GET /api/items/tags - Get all unique tags for tenant
 */
router.get('/tags', withTenant(), withOptionalLocale(), async (req: ItemRequest, res: Response) => {
  try {
    const tags = await itemService.getTags(req.tenantId);

    res.json({
      data: tags,
      meta: {
        count: tags.length,
        tenant: req.tenantId
      }
    });

  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      code: 'INTERNAL_ERROR',
      message: 'Failed to fetch tags'
    });
  }
});

/**
 * POST /api/items/bulk - Bulk operations
 */
router.post('/bulk', withTenant(), withOptionalLocale(), async (req: ItemRequest, res: Response) => {
  try {
    const { ids, operation, data } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        error: 'Validation Error',
        code: 'VALIDATION_ERROR',
        message: 'IDs array is required and must not be empty'
      });
    }

    if (!operation || !['delete', 'archive', 'activate', 'updateStatus', 'updatePriority'].includes(operation)) {
      return res.status(400).json({
        error: 'Validation Error',
        code: 'VALIDATION_ERROR',
        message: 'Valid operation is required'
      });
    }

    const affectedCount = await itemService.bulkOperation(
      { ids, operation, data },
      req.tenantId
    );

    res.json({
      data: { affectedCount },
      meta: {
        operation,
        timestamp: new Date().toISOString(),
        tenant: req.tenantId
      }
    });

  } catch (error) {
    console.error('Error performing bulk operation:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      code: 'INTERNAL_ERROR',
      message: 'Failed to perform bulk operation'
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