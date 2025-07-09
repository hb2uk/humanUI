import { PrismaClient } from '@prisma/client';
import { ItemAttribute, CreateItemAttribute, UpdateItemAttribute, ItemAttributeQuery, ItemAttributeStats, ItemAttributeBulkOperation, ItemAttributeImportData, ItemAttributeExportData } from './types';
import { itemAttributeSchema, createItemAttributeSchema, updateItemAttributeSchema, itemAttributeQuerySchema } from './schema';

export class ItemAttributeService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Create a new item attribute
   */
  async create(data: CreateItemAttribute, tenantId?: string): Promise<ItemAttribute> {
    const validatedData = createItemAttributeSchema.parse(data);
    
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

    // Check if attribute name is unique within the organization
    const existingAttribute = await this.prisma.itemAttribute.findFirst({
      where: {
        name: validatedData.name,
        organizationId: validatedData.organizationId,
        tenantId: tenantId || null,
      },
    });

    if (existingAttribute) {
      throw new Error(`Item attribute with name "${validatedData.name}" already exists in this organization`);
    }

    const itemAttribute = await this.prisma.itemAttribute.create({
      data: {
        ...validatedData,
        tenantId: tenantId || null,
      },
    });

    return itemAttribute;
  }

  /**
   * Find item attribute by ID
   */
  async findById(id: string, tenantId?: string): Promise<ItemAttribute | null> {
    const itemAttribute = await this.prisma.itemAttribute.findFirst({
      where: {
        id,
        tenantId: tenantId || null,
      },
      include: {
        organization: true,
      },
    });

    return itemAttribute;
  }

  /**
   * List item attributes with filtering and pagination
   */
  async list(query: ItemAttributeQuery, tenantId?: string): Promise<{
    itemAttributes: ItemAttribute[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const validatedQuery = itemAttributeQuerySchema.parse(query);
    const { page, limit, search, attributeType, organizationId, isActive, isRequired, sortBy, sortOrder } = validatedQuery;

    const where: any = {
      tenantId: tenantId || null,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { displayName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (attributeType) {
      where.attributeType = attributeType;
    }

    if (organizationId) {
      where.organizationId = organizationId;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (isRequired !== undefined) {
      where.isRequired = isRequired;
    }

    const [itemAttributes, total] = await Promise.all([
      this.prisma.itemAttribute.findMany({
        where,
        include: {
          organization: true,
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.itemAttribute.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      itemAttributes,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Update item attribute
   */
  async update(id: string, data: UpdateItemAttribute, tenantId?: string): Promise<ItemAttribute> {
    const validatedData = updateItemAttributeSchema.parse({ ...data, id });

    // Check if item attribute exists
    const existingAttribute = await this.prisma.itemAttribute.findFirst({
      where: {
        id,
        tenantId: tenantId || null,
      },
    });

    if (!existingAttribute) {
      throw new Error('Item attribute not found');
    }

    // Check if name is unique (if being updated)
    if (validatedData.name && validatedData.name !== existingAttribute.name) {
      const nameExists = await this.prisma.itemAttribute.findFirst({
        where: {
          name: validatedData.name,
          organizationId: existingAttribute.organizationId,
          tenantId: tenantId || null,
          id: { not: id },
        },
      });

      if (nameExists) {
        throw new Error(`Item attribute with name "${validatedData.name}" already exists in this organization`);
      }
    }

    // Check if organization exists (if being updated)
    if (validatedData.organizationId && validatedData.organizationId !== existingAttribute.organizationId) {
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

    const itemAttribute = await this.prisma.itemAttribute.update({
      where: { id },
      data: validatedData,
      include: {
        organization: true,
      },
    });

    return itemAttribute;
  }

  /**
   * Delete item attribute (soft delete)
   */
  async delete(id: string, tenantId?: string): Promise<boolean> {
    const itemAttribute = await this.prisma.itemAttribute.findFirst({
      where: {
        id,
        tenantId: tenantId || null,
      },
    });

    if (!itemAttribute) {
      throw new Error('Item attribute not found');
    }

    await this.prisma.itemAttribute.update({
      where: { id },
      data: { isActive: false },
    });

    return true;
  }

  /**
   * Get item attribute statistics
   */
  async getStats(tenantId?: string): Promise<ItemAttributeStats> {
    const [
      totalAttributes,
      activeAttributes,
      requiredAttributes,
      attributesByType,
      topUsedAttributes,
    ] = await Promise.all([
      this.prisma.itemAttribute.count({
        where: { tenantId: tenantId || null },
      }),
      this.prisma.itemAttribute.count({
        where: { 
          tenantId: tenantId || null,
          isActive: true,
        },
      }),
      this.prisma.itemAttribute.count({
        where: { 
          tenantId: tenantId || null,
          isRequired: true,
        },
      }),
      this.prisma.itemAttribute.groupBy({
        by: ['attributeType'],
        where: { tenantId: tenantId || null },
        _count: {
          attributeType: true,
        },
      }),
      this.prisma.itemAttribute.findMany({
        where: { tenantId: tenantId || null },
        select: {
          id: true,
          name: true,
        },
        orderBy: {
          sortOrder: 'asc',
        },
        take: 10,
      }),
    ]);

    const attributesByTypeMap: Record<string, number> = {};
    attributesByType.forEach(group => {
      attributesByTypeMap[group.attributeType] = group._count.attributeType;
    });

    return {
      totalAttributes,
      activeAttributes,
      requiredAttributes,
      attributesByType: attributesByTypeMap,
      topUsedAttributes: topUsedAttributes.map(attr => ({
        id: attr.id,
        name: attr.name,
        usageCount: 0, // TODO: Implement usage tracking
      })),
    };
  }

  /**
   * Bulk operations on item attributes
   */
  async bulkOperation(operation: ItemAttributeBulkOperation, tenantId?: string): Promise<boolean> {
    const { ids, operation: op, data } = operation;

    // Verify all item attributes exist and belong to the tenant
    const itemAttributes = await this.prisma.itemAttribute.findMany({
      where: {
        id: { in: ids },
        tenantId: tenantId || null,
      },
    });

    if (itemAttributes.length !== ids.length) {
      throw new Error('Some item attributes not found or do not belong to the tenant');
    }

    switch (op) {
      case 'activate':
        await this.prisma.itemAttribute.updateMany({
          where: { id: { in: ids } },
          data: { isActive: true },
        });
        break;

      case 'deactivate':
        await this.prisma.itemAttribute.updateMany({
          where: { id: { in: ids } },
          data: { isActive: false },
        });
        break;

      case 'delete':
        await this.prisma.itemAttribute.updateMany({
          where: { id: { in: ids } },
          data: { isActive: false },
        });
        break;

      case 'update':
        if (!data) {
          throw new Error('Update data is required for update operation');
        }
        await this.prisma.itemAttribute.updateMany({
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
   * Import item attributes from external data
   */
  async import(data: ItemAttributeImportData[], organizationId: string, tenantId?: string): Promise<ItemAttribute[]> {
    const importedItemAttributes: ItemAttribute[] = [];

    for (const item of data) {
      try {
        const itemAttribute = await this.create({
          name: item.name,
          displayName: item.displayName,
          description: item.description,
          attributeType: item.attributeType,
          dataType: item.dataType,
          isRequired: item.isRequired ?? false,
          defaultValue: item.defaultValue,
          validationRules: item.validationRules,
          sortOrder: item.sortOrder ?? 0,
          isActive: item.isActive ?? true,
          organizationId,
        }, tenantId);

        importedItemAttributes.push(itemAttribute);
      } catch (error) {
        console.error(`Failed to import item attribute ${item.name}:`, error);
        throw new Error(`Failed to import item attribute ${item.name}: ${error}`);
      }
    }

    return importedItemAttributes;
  }

  /**
   * Export item attributes to external format
   */
  async export(organizationId: string, tenantId?: string): Promise<ItemAttributeExportData[]> {
    const itemAttributes = await this.prisma.itemAttribute.findMany({
      where: {
        organizationId,
        tenantId: tenantId || null,
      },
      include: {
        organization: true,
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    return itemAttributes.map(attr => ({
      id: attr.id,
      name: attr.name,
      displayName: attr.displayName,
      description: attr.description || undefined,
      attributeType: attr.attributeType as any,
      dataType: attr.dataType,
      isRequired: attr.isRequired,
      defaultValue: attr.defaultValue,
      validationRules: attr.validationRules as any,
      sortOrder: attr.sortOrder,
      isActive: attr.isActive,
      organizationId: attr.organizationId,
      createdAt: attr.createdAt.toISOString(),
      updatedAt: attr.updatedAt.toISOString(),
    }));
  }
} 