import { PrismaClient } from '@prisma/client';
import { Organization, CreateOrganization, UpdateOrganization, OrganizationQuery, OrganizationStats, OrganizationBulkOperation, OrganizationImportData, OrganizationExportData, OrganizationSettings } from './types';
import { organizationSchema, createOrganizationSchema, updateOrganizationSchema, organizationQuerySchema } from './schema';

export class OrganizationService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Create a new organization
   */
  async create(data: CreateOrganization, tenantId?: string): Promise<Organization> {
    const validatedData = createOrganizationSchema.parse(data);
    
    // Check if slug is unique within the tenant
    const existingOrganization = await this.prisma.organization.findFirst({
      where: {
        slug: validatedData.slug,
        tenantId: tenantId || null,
      },
    });

    if (existingOrganization) {
      throw new Error(`Organization with slug "${validatedData.slug}" already exists`);
    }

    const organization = await this.prisma.organization.create({
      data: {
        ...validatedData,
        tenantId: tenantId || null,
      },
    });

    return organization;
  }

  /**
   * Find organization by ID
   */
  async findById(id: string, tenantId?: string): Promise<Organization | null> {
    const organization = await this.prisma.organization.findFirst({
      where: {
        id,
        tenantId: tenantId || null,
      },
      include: {
        _count: {
          select: {
            stores: true,
            users: true,
          },
        },
      },
    });

    return organization;
  }

  /**
   * Find organization by slug
   */
  async findBySlug(slug: string, tenantId?: string): Promise<Organization | null> {
    const organization = await this.prisma.organization.findFirst({
      where: {
        slug,
        tenantId: tenantId || null,
      },
      include: {
        _count: {
          select: {
            stores: true,
            users: true,
          },
        },
      },
    });

    return organization;
  }

  /**
   * List organizations with filtering and pagination
   */
  async list(query: OrganizationQuery, tenantId?: string): Promise<{
    organizations: Organization[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const validatedQuery = organizationQuerySchema.parse(query);
    const { page, limit, search, isActive, isPublic, sortBy, sortOrder } = validatedQuery;

    const where: any = {
      tenantId: tenantId || null,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (isPublic !== undefined) {
      where.isPublic = isPublic;
    }

    const [organizations, total] = await Promise.all([
      this.prisma.organization.findMany({
        where,
        include: {
          _count: {
            select: {
              stores: true,
              users: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.organization.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      organizations,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Update organization
   */
  async update(id: string, data: UpdateOrganization, tenantId?: string): Promise<Organization> {
    const validatedData = updateOrganizationSchema.parse({ ...data, id });

    // Check if organization exists
    const existingOrganization = await this.prisma.organization.findFirst({
      where: {
        id,
        tenantId: tenantId || null,
      },
    });

    if (!existingOrganization) {
      throw new Error('Organization not found');
    }

    // Check if slug is unique (if being updated)
    if (validatedData.slug && validatedData.slug !== existingOrganization.slug) {
      const slugExists = await this.prisma.organization.findFirst({
        where: {
          slug: validatedData.slug,
          tenantId: tenantId || null,
          id: { not: id },
        },
      });

      if (slugExists) {
        throw new Error(`Organization with slug "${validatedData.slug}" already exists`);
      }
    }

    const organization = await this.prisma.organization.update({
      where: { id },
      data: validatedData,
      include: {
        _count: {
          select: {
            stores: true,
            users: true,
          },
        },
      },
    });

    return organization;
  }

  /**
   * Delete organization (soft delete)
   */
  async delete(id: string, tenantId?: string): Promise<boolean> {
    const organization = await this.prisma.organization.findFirst({
      where: {
        id,
        tenantId: tenantId || null,
      },
    });

    if (!organization) {
      throw new Error('Organization not found');
    }

    // Check if organization has stores or users
    const [storeCount, userCount] = await Promise.all([
      this.prisma.store.count({
        where: {
          organizationId: id,
          tenantId: tenantId || null,
        },
      }),
      this.prisma.user.count({
        where: {
          organizationId: id,
          tenantId: tenantId || null,
        },
      }),
    ]);

    if (storeCount > 0 || userCount > 0) {
      throw new Error('Cannot delete organization with stores or users. Please remove them first.');
    }

    await this.prisma.organization.update({
      where: { id },
      data: { isActive: false },
    });

    return true;
  }

  /**
   * Get organization statistics
   */
  async getStats(id: string, tenantId?: string): Promise<OrganizationStats> {
    const organization = await this.prisma.organization.findFirst({
      where: {
        id,
        tenantId: tenantId || null,
      },
    });

    if (!organization) {
      throw new Error('Organization not found');
    }

    // TODO: Implement actual statistics calculation
    // This is a placeholder implementation
    const stats: OrganizationStats = {
      totalStores: 0,
      totalUsers: 0,
      totalProducts: 0,
      totalCategories: 0,
      totalOrders: 0,
      totalRevenue: 0,
      activeStores: 0,
      activeUsers: 0,
      storesThisMonth: 0,
      revenueThisMonth: 0,
      topStores: [],
    };

    return stats;
  }

  /**
   * Bulk operations on organizations
   */
  async bulkOperation(operation: OrganizationBulkOperation, tenantId?: string): Promise<boolean> {
    const { ids, operation: op, data } = operation;

    // Verify all organizations exist and belong to the tenant
    const organizations = await this.prisma.organization.findMany({
      where: {
        id: { in: ids },
        tenantId: tenantId || null,
      },
    });

    if (organizations.length !== ids.length) {
      throw new Error('Some organizations not found or do not belong to the tenant');
    }

    switch (op) {
      case 'activate':
        await this.prisma.organization.updateMany({
          where: { id: { in: ids } },
          data: { isActive: true },
        });
        break;

      case 'deactivate':
        await this.prisma.organization.updateMany({
          where: { id: { in: ids } },
          data: { isActive: false },
        });
        break;

      case 'delete':
        await this.prisma.organization.updateMany({
          where: { id: { in: ids } },
          data: { isActive: false },
        });
        break;

      case 'update':
        if (!data) {
          throw new Error('Update data is required for update operation');
        }
        await this.prisma.organization.updateMany({
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
   * Import organizations from external data
   */
  async import(data: OrganizationImportData[], tenantId?: string): Promise<Organization[]> {
    const importedOrganizations: Organization[] = [];

    for (const item of data) {
      try {
        const organization = await this.create({
          name: item.name,
          slug: item.slug,
          description: item.description,
          logoUrl: item.logoUrl,
          website: item.website,
          email: item.email,
          phone: item.phone,
          address: item.address,
          isActive: item.isActive ?? true,
          isPublic: item.isPublic ?? false,
          settings: item.settings,
        }, tenantId);

        importedOrganizations.push(organization);
      } catch (error) {
        console.error(`Failed to import organization ${item.name}:`, error);
        throw new Error(`Failed to import organization ${item.name}: ${error}`);
      }
    }

    return importedOrganizations;
  }

  /**
   * Export organizations to external format
   */
  async export(tenantId?: string): Promise<OrganizationExportData[]> {
    const organizations = await this.prisma.organization.findMany({
      where: {
        tenantId: tenantId || null,
      },
      include: {
        _count: {
          select: {
            stores: true,
            users: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return organizations.map(org => ({
      id: org.id,
      name: org.name,
      slug: org.slug,
      description: org.description || undefined,
      logoUrl: org.logoUrl || undefined,
      website: org.website || undefined,
      email: org.email || undefined,
      phone: org.phone || undefined,
      address: org.address as any,
      isActive: org.isActive,
      isPublic: org.isPublic,
      settings: org.settings as any,
      createdAt: org.createdAt.toISOString(),
      updatedAt: org.updatedAt.toISOString(),
      stats: {
        totalStores: org._count.stores,
        totalUsers: org._count.users,
        totalProducts: 0,
        totalCategories: 0,
        totalOrders: 0,
        totalRevenue: 0,
        activeStores: 0,
        activeUsers: 0,
        storesThisMonth: 0,
        revenueThisMonth: 0,
        topStores: [],
      },
    }));
  }

  /**
   * Update organization settings
   */
  async updateSettings(id: string, settings: Partial<OrganizationSettings>, tenantId?: string): Promise<Organization> {
    const organization = await this.prisma.organization.findFirst({
      where: {
        id,
        tenantId: tenantId || null,
      },
    });

    if (!organization) {
      throw new Error('Organization not found');
    }

    const currentSettings = organization.settings as OrganizationSettings;
    const updatedSettings = { ...currentSettings, ...settings };

    const updatedOrganization = await this.prisma.organization.update({
      where: { id },
      data: { settings: updatedSettings },
    });

    return updatedOrganization;
  }

  /**
   * Get organization settings
   */
  async getSettings(id: string, tenantId?: string): Promise<OrganizationSettings> {
    const organization = await this.prisma.organization.findFirst({
      where: {
        id,
        tenantId: tenantId || null,
      },
    });

    if (!organization) {
      throw new Error('Organization not found');
    }

    return organization.settings as OrganizationSettings;
  }
} 