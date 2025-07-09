import { PrismaClient, ItemStatus, Priority, Prisma } from '@prisma/client';
import { 
  CreateItem, 
  UpdateItem, 
  ItemQuery, 
  ItemsListResponse, 
  ItemStats,
  BulkItemOperation 
} from './types';
import { createItemSchema, updateItemSchema, itemQuerySchema } from './schema';

export class ItemService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a new item
   */
  async create(data: CreateItem, tenantId?: string, createdBy?: string): Promise<CreateItem> {
    const validatedData = createItemSchema.parse(data);
    
    const item = await this.prisma.item.create({
      data: {
        ...validatedData,
        tenantId: tenantId || validatedData.tenantId,
        createdBy: createdBy || validatedData.createdBy,
      },
    });

    return item;
  }

  /**
   * Get item by ID with tenant isolation
   */
  async getById(id: string, tenantId?: string): Promise<CreateItem | null> {
    const item = await this.prisma.item.findFirst({
      where: {
        id,
        ...(tenantId && { tenantId }),
      },
    });

    return item;
  }

  /**
   * Update an item
   */
  async update(data: UpdateItem, tenantId?: string): Promise<CreateItem> {
    const validatedData = updateItemSchema.parse(data);
    
    const item = await this.prisma.item.update({
      where: {
        id: validatedData.id,
        ...(tenantId && { tenantId }),
      },
      data: validatedData,
    });

    return item;
  }

  /**
   * Delete an item (soft delete by setting status to DELETED)
   */
  async delete(id: string, tenantId?: string): Promise<CreateItem> {
    const item = await this.prisma.item.update({
      where: {
        id,
        ...(tenantId && { tenantId }),
      },
      data: {
        status: ItemStatus.DELETED,
      },
    });

    return item;
  }

  /**
   * Hard delete an item
   */
  async hardDelete(id: string, tenantId?: string): Promise<CreateItem> {
    const item = await this.prisma.item.delete({
      where: {
        id,
        ...(tenantId && { tenantId }),
      },
    });

    return item;
  }

  /**
   * List items with filtering, pagination, and sorting
   */
  async list(query: ItemQuery, tenantId?: string): Promise<ItemsListResponse> {
    const validatedQuery = itemQuerySchema.parse(query);
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', ...filters } = validatedQuery;

    // Build where clause
    const where: Prisma.ItemWhereInput = {
      ...(tenantId && { tenantId }),
      ...(filters.status && { status: filters.status }),
      ...(filters.priority && { priority: filters.priority }),
      ...(filters.createdBy && { createdBy: filters.createdBy }),
      ...(filters.tags && filters.tags.length > 0 && {
        tags: {
          hasSome: filters.tags,
        },
      }),
      ...(filters.search && {
        OR: [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
      // Exclude deleted items by default
      status: { not: ItemStatus.DELETED },
    };

    // Build order by clause
    const orderBy: Prisma.ItemOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    // Get total count
    const total = await this.prisma.item.count({ where });

    // Get items
    const items = await this.prisma.item.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get item statistics
   */
  async getStats(tenantId?: string): Promise<ItemStats> {
    const where: Prisma.ItemWhereInput = {
      ...(tenantId && { tenantId }),
      status: { not: ItemStatus.DELETED },
    };

    const [total, byStatus, byPriority] = await Promise.all([
      this.prisma.item.count({ where }),
      this.prisma.item.groupBy({
        by: ['status'],
        where,
        _count: { status: true },
      }),
      this.prisma.item.groupBy({
        by: ['priority'],
        where,
        _count: { priority: true },
      }),
    ]);

    // Get monthly stats for the last 12 months
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const byMonth = await this.prisma.item.groupBy({
      by: ['createdAt'],
      where: {
        ...where,
        createdAt: { gte: twelveMonthsAgo },
      },
      _count: { createdAt: true },
    });

    // Transform the results
    const statusStats = Object.fromEntries(
      byStatus.map(({ status, _count }) => [status, _count.status])
    ) as Record<ItemStatus, number>;

    const priorityStats = Object.fromEntries(
      byPriority.map(({ priority, _count }) => [priority, _count.priority])
    ) as Record<Priority, number>;

    const monthlyStats = Object.fromEntries(
      byMonth.map(({ createdAt, _count }) => [
        `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`,
        _count.createdAt,
      ])
    );

    return {
      total,
      byStatus: statusStats,
      byPriority: priorityStats,
      byMonth: monthlyStats,
    };
  }

  /**
   * Bulk operations
   */
  async bulkOperation(operation: BulkItemOperation, tenantId?: string): Promise<number> {
    const { ids, operation: op, data } = operation;

    const where: Prisma.ItemWhereInput = {
      id: { in: ids },
      ...(tenantId && { tenantId }),
    };

    let updateData: Prisma.ItemUpdateInput = {};

    switch (op) {
      case 'delete':
        updateData = { status: ItemStatus.DELETED };
        break;
      case 'archive':
        updateData = { status: ItemStatus.ARCHIVED };
        break;
      case 'activate':
        updateData = { status: ItemStatus.ACTIVE };
        break;
      case 'updateStatus':
        if (data?.status) {
          updateData = { status: data.status };
        }
        break;
      case 'updatePriority':
        if (data?.priority) {
          updateData = { priority: data.priority };
        }
        break;
      default:
        throw new Error(`Unknown bulk operation: ${op}`);
    }

    const result = await this.prisma.item.updateMany({
      where,
      data: updateData,
    });

    return result.count;
  }

  /**
   * Search items with full-text search
   */
  async search(searchTerm: string, tenantId?: string, limit = 10): Promise<CreateItem[]> {
    const items = await this.prisma.item.findMany({
      where: {
        ...(tenantId && { tenantId }),
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
          { tags: { has: searchTerm } },
        ],
        status: { not: ItemStatus.DELETED },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return items;
  }

  /**
   * Get items by tags
   */
  async getByTags(tags: string[], tenantId?: string): Promise<CreateItem[]> {
    const items = await this.prisma.item.findMany({
      where: {
        ...(tenantId && { tenantId }),
        tags: {
          hasSome: tags,
        },
        status: { not: ItemStatus.DELETED },
      },
      orderBy: { createdAt: 'desc' },
    });

    return items;
  }

  /**
   * Get all unique tags for a tenant
   */
  async getTags(tenantId?: string): Promise<string[]> {
    const items = await this.prisma.item.findMany({
      where: {
        ...(tenantId && { tenantId }),
        status: { not: ItemStatus.DELETED },
      },
      select: { tags: true },
    });

    const allTags = items.flatMap(item => item.tags);
    return [...new Set(allTags)];
  }
} 