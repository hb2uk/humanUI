import { PrismaClient } from '@humanui/db';
import { Store, CreateStore, UpdateStore, StoreQuery, StoreStats, StoreBulkOperation, StoreImportData, StoreExportData, OperatingHours } from './types';
import { storeSchema, createStoreSchema, updateStoreSchema, storeQuerySchema } from './schema';

export class StoreService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Create a new store
   */
  async create(data: CreateStore, tenantId?: string): Promise<Store> {
    const validatedData = createStoreSchema.parse(data);
    
    // Check if organization exists
    const organization = await this.prisma.organization.findFirst({
      where: {
        id: validatedData.organizationId,
        tenantId: tenantId || null,
      },
    });

    if (!organization) {
      throw new Error('Organization not found or does not belong to the tenant');
    }

    const store = await this.prisma.store.create({
      data: {
        name: validatedData.name,
        displayName: validatedData.displayName,
        description: validatedData.description,
        address: validatedData.address ?? {},
        phone: validatedData.phone,
        email: validatedData.email,
        timezone: validatedData.timezone,
        isActive: validatedData.isActive,
        storeType: validatedData.storeType,
        operatingHours: validatedData.operatingHours,
        organizationId: validatedData.organizationId,
        tenantId: tenantId || null,
        createdBy: validatedData.createdBy,
      },
    });

    return store;
  }

  /**
   * Find store by ID
   */
  async findById(id: string, tenantId?: string): Promise<Store | null> {
    const store = await this.prisma.store.findFirst({
      where: {
        id,
        tenantId: tenantId || null,
      },
      include: {
        organization: true,
        _count: {
          select: {
            categories: true,
            items: true,
          },
        },
      },
    });

    return store;
  }

  /**
   * List stores with filtering and pagination
   */
  async list(query: StoreQuery, tenantId?: string): Promise<{
    stores: Store[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const validatedQuery = storeQuerySchema.parse(query);
    const { page, limit, search, organizationId, isActive, storeType, sortBy, sortOrder } = validatedQuery;

    const where: any = {
      tenantId: tenantId || null,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { displayName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { address: { path: ['city'], string_contains: search } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (organizationId) {
      where.organizationId = organizationId;
    }

    if (storeType) {
      where.storeType = storeType;
    }

    const [stores, total] = await Promise.all([
      this.prisma.store.findMany({
        where,
        include: {
          organization: true,
          _count: {
            select: {
              categories: true,
              items: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.store.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      stores,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Update store
   */
  async update(id: string, data: UpdateStore, tenantId?: string): Promise<Store> {
    const validatedData = updateStoreSchema.parse({ ...data, id });

    // Check if store exists
    const existingStore = await this.prisma.store.findFirst({
      where: {
        id,
        tenantId: tenantId || null,
      },
    });

    if (!existingStore) {
      throw new Error('Store not found');
    }

    // Check if organization exists (if being updated)
    if (validatedData.organizationId && validatedData.organizationId !== existingStore.organizationId) {
      const organization = await this.prisma.organization.findFirst({
        where: {
          id: validatedData.organizationId,
          tenantId: tenantId || null,
        },
      });

      if (!organization) {
        throw new Error('Organization not found or does not belong to the tenant');
      }
    }

    const store = await this.prisma.store.update({
      where: { id },
      data: validatedData,
      include: {
        organization: true,
        _count: {
          select: {
            categories: true,
            items: true,
          },
        },
      },
    });

    return store;
  }

  /**
   * Delete store (soft delete)
   */
  async delete(id: string, tenantId?: string): Promise<boolean> {
    const store = await this.prisma.store.findFirst({
      where: {
        id,
        tenantId: tenantId || null,
      },
    });

    if (!store) {
      throw new Error('Store not found');
    }

    // Check if store has categories or items
    const [categoryCount, itemCount] = await Promise.all([
      this.prisma.category.count({
        where: {
          storeId: id,
          tenantId: tenantId || null,
        },
      }),
      this.prisma.item.count({
        where: {
          storeId: id,
          tenantId: tenantId || null,
        },
      }),
    ]);

    if (categoryCount > 0 || itemCount > 0) {
      throw new Error('Cannot delete store with categories or items. Please remove them first.');
    }

    await this.prisma.store.update({
      where: { id },
      data: { isActive: false },
    });

    return true;
  }

  /**
   * Get store statistics
   */
  async getStats(id: string, tenantId?: string): Promise<StoreStats> {
    const store = await this.prisma.store.findFirst({
      where: {
        id,
        tenantId: tenantId || null,
      },
    });

    if (!store) {
      throw new Error('Store not found');
    }

    // TODO: Implement actual statistics calculation
    // This is a placeholder implementation
    const stats: StoreStats = {
      totalOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      totalCustomers: 0,
      totalProducts: 0,
      totalCategories: 0,
      ordersThisMonth: 0,
      revenueThisMonth: 0,
      topProducts: [],
    };

    return stats;
  }

  /**
   * Bulk operations on stores
   */
  async bulkOperation(operation: StoreBulkOperation, tenantId?: string): Promise<boolean> {
    const { ids, operation: op, data } = operation;

    // Verify all stores exist and belong to the tenant
    const stores = await this.prisma.store.findMany({
      where: {
        id: { in: ids },
        tenantId: tenantId || null,
      },
    });

    if (stores.length !== ids.length) {
      throw new Error('Some stores not found or do not belong to the tenant');
    }

    switch (op) {
      case 'activate':
        await this.prisma.store.updateMany({
          where: { id: { in: ids } },
          data: { isActive: true },
        });
        break;

      case 'deactivate':
        await this.prisma.store.updateMany({
          where: { id: { in: ids } },
          data: { isActive: false },
        });
        break;

      case 'delete':
        await this.prisma.store.updateMany({
          where: { id: { in: ids } },
          data: { isActive: false },
        });
        break;

      case 'update':
        if (!data) {
          throw new Error('Update data is required for update operation');
        }
        await this.prisma.store.updateMany({
          where: { id: { in: ids } },
          data,
        });
        break;

      default:
        throw new Error(`Unknown operation: ${op}`);
    }

    return true;
  }

  /**
   * Import stores from external data
   */
  async import(data: StoreImportData[], organizationId: string, tenantId?: string): Promise<Store[]> {
    const importedStores: Store[] = [];

    for (const item of data) {
      try {
        const store = await this.create({
          name: item.name,
          displayName: item.displayName ?? null,
          description: item.description ?? null,
          address: item.address ?? {},
          phone: item.phone ?? null,
          email: item.email ?? null,
          timezone: item.timezone ?? null,
          storeType: item.storeType ?? null,
          isActive: item.isActive ?? true,
          operatingHours: item.operatingHours ?? null,
          organizationId,
          tenantId: tenantId ?? null,
          createdBy: null,
        }, tenantId);

        importedStores.push(store);
      } catch (error) {
        console.error(`Failed to import store ${item.name}:`, error);
        throw new Error(`Failed to import store ${item.name}: ${error}`);
      }
    }

    return importedStores;
  }

  /**
   * Export stores to external format
   */
  async export(organizationId: string, tenantId?: string): Promise<StoreExportData[]> {
    const stores = await this.prisma.store.findMany({
      where: {
        organizationId,
        tenantId: tenantId || null,
      },
      include: {
        organization: true,
        _count: {
          select: {
            categories: true,
            items: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return stores.map((store: any) => ({
      id: store.id,
      name: store.name,
      displayName: store.displayName || undefined,
      description: store.description || undefined,
      address: store.address as any,
      phone: store.phone || undefined,
      email: store.email || undefined,
      timezone: store.timezone || undefined,
      storeType: store.storeType || undefined,
      isActive: store.isActive,
      operatingHours: store.operatingHours as any,
      organizationId: store.organizationId,
      createdAt: store.createdAt.toISOString(),
      updatedAt: store.updatedAt.toISOString(),
      stats: {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        totalCustomers: 0,
        totalProducts: store._count.items,
        totalCategories: store._count.categories,
        ordersThisMonth: 0,
        revenueThisMonth: 0,
        topProducts: [],
      },
    }));
  }

  /**
   * Get operating hours for a specific date
   */
  async getOperatingHours(id: string, date?: Date, tenantId?: string): Promise<OperatingHours | null> {
    const store = await this.prisma.store.findFirst({
      where: {
        id,
        tenantId: tenantId || null,
      },
    });

    if (!store || !store.operatingHours) {
      return null;
    }

    const targetDate = date || new Date();
    const dayOfWeek = targetDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    return (store.operatingHours as any)[dayOfWeek] || null;
  }

  /**
   * Check if store is open at a specific date/time
   */
  async isOpen(id: string, date?: Date, tenantId?: string): Promise<boolean> {
    const operatingHours = await this.getOperatingHours(id, date, tenantId);
    
    if (!operatingHours || operatingHours.isClosed) {
      return false;
    }

    const targetDate = date || new Date();
    const currentTime = targetDate.toTimeString().slice(0, 5); // HH:MM format
    
    return currentTime >= operatingHours.open && currentTime <= operatingHours.close;
  }
} 