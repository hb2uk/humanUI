import { PrismaClient, Prisma } from '@humanui/db';
import { ItemStatus, Priority } from '@humanui/db';
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
        categoryType: validatedData.categoryType,
        sku: validatedData.sku,
        name: validatedData.name,
        description: validatedData.description,
        hasVariants: validatedData.hasVariants,
        variantGroups: validatedData.variantGroups,
        fulfillmentMethod: validatedData.fulfillmentMethod,
        fulfillmentConfig: validatedData.fulfillmentConfig,
        regulatoryFlags: validatedData.regulatoryFlags,
        complianceRequired: validatedData.complianceRequired,
        basePrice: validatedData.basePrice,
        currency: validatedData.currency,
        pricingRules: validatedData.pricingRules,
        status: validatedData.status,
        priority: validatedData.priority,
        tags: validatedData.tags,
        metadata: validatedData.metadata,
        organizationId: validatedData.organizationId,
        storeId: validatedData.storeId,
        categoryId: validatedData.categoryId,
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
   * List items with filtering, pagination, and sorting
   */
  async list(query: ItemQuery, tenantId?: string): Promise<ItemsListResponse> {
    const validatedQuery = itemQuerySchema.parse(query);
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', ...filters } = validatedQuery;

    // Build where clause
    const where: any = {
      ...(tenantId && { tenantId }),
      ...(filters.status && { status: filters.status }),
      ...(filters.priority && { priority: filters.priority }),
      ...(filters.createdBy && { createdBy: filters.createdBy }),
      ...(filters.organizationId && { organizationId: filters.organizationId }),
      ...(filters.storeId && { storeId: filters.storeId }),
      ...(filters.categoryId && { categoryId: filters.categoryId }),
      ...(filters.categoryType && { categoryType: filters.categoryType }),
      ...(filters.tags && filters.tags.length > 0 && {
        tags: {
          hasSome: filters.tags,
        },
      }),
      ...(filters.search && {
        OR: [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
          { sku: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
      // Exclude deleted items by default
      status: { not: ItemStatus.DELETED },
    };

    // Build order by clause
    const orderBy: any = {
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
    const where: any = {
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
      byStatus.map(({ status, _count }: { status: ItemStatus; _count: { status: number } }) => [status, _count.status])
    ) as Record<ItemStatus, number>;

    const priorityStats = Object.fromEntries(
      byPriority.map(({ priority, _count }: { priority: Priority; _count: { priority: number } }) => [priority, _count.priority])
    ) as Record<Priority, number>;

    const monthlyStats = Object.fromEntries(
      byMonth.map(({ createdAt, _count }: { createdAt: Date; _count: { createdAt: number } }) => [
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
   * Bulk operations on items
   */
  async bulkOperation(operation: BulkItemOperation, tenantId?: string): Promise<number> {
    const { ids, operation: op, data } = operation;

    let affectedCount = 0;

    switch (op) {
      case 'update':
        if (data) {
          const updatePromises = ids.map(id =>
            this.prisma.item.update({
              where: { id, ...(tenantId && { tenantId }) },
              data,
            })
          );
          await Promise.all(updatePromises);
          affectedCount = ids.length;
        }
        break;

      case 'delete':
        const deletePromises = ids.map(id =>
          this.prisma.item.update({
            where: { id, ...(tenantId && { tenantId }) },
            data: { status: ItemStatus.DELETED },
          })
        );
        await Promise.all(deletePromises);
        affectedCount = ids.length;
        break;

      case 'archive':
        const archivePromises = ids.map(id =>
          this.prisma.item.update({
            where: { id, ...(tenantId && { tenantId }) },
            data: { status: ItemStatus.ARCHIVED },
          })
        );
        await Promise.all(archivePromises);
        affectedCount = ids.length;
        break;

      case 'activate':
        const activatePromises = ids.map(id =>
          this.prisma.item.update({
            where: { id, ...(tenantId && { tenantId }) },
            data: { status: ItemStatus.ACTIVE },
          })
        );
        await Promise.all(activatePromises);
        affectedCount = ids.length;
        break;

      case 'updateStatus':
        if (data?.status) {
          const updateStatusPromises = ids.map(id =>
            this.prisma.item.update({
              where: { id, ...(tenantId && { tenantId }) },
              data: { status: data.status },
            })
          );
          await Promise.all(updateStatusPromises);
          affectedCount = ids.length;
        }
        break;

      case 'updatePriority':
        if (data?.priority) {
          const updatePriorityPromises = ids.map(id =>
            this.prisma.item.update({
              where: { id, ...(tenantId && { tenantId }) },
              data: { priority: data.priority },
            })
          );
          await Promise.all(updatePriorityPromises);
          affectedCount = ids.length;
        }
        break;

      default:
        throw new Error(`Unsupported bulk operation: ${op}`);
    }

    return affectedCount;
  }

  /**
   * Search items by term
   */
  async search(searchTerm: string, tenantId?: string, limit = 10): Promise<CreateItem[]> {
    const items = await this.prisma.item.findMany({
      where: {
        ...(tenantId && { tenantId }),
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
          { sku: { contains: searchTerm, mode: 'insensitive' } },
        ],
        status: { not: ItemStatus.DELETED },
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
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
   * Get all unique tags
   */
  async getTags(tenantId?: string): Promise<string[]> {
    const items = await this.prisma.item.findMany({
      where: {
        ...(tenantId && { tenantId }),
        status: { not: ItemStatus.DELETED },
        tags: { isEmpty: false },
      },
      select: { tags: true },
    });

    const allTags = items.flatMap((item: { tags: string[] }) => item.tags);
    return [...new Set(allTags)] as string[];
  }
} 