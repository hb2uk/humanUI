import { PrismaClient } from '@humanui/db';
import { Category, CreateCategory, UpdateCategory, CategoryQuery, CategoryTreeNode, CategoryStats, CategoryBulkOperation, CategoryImportData, CategoryExportData } from './types';
import { categorySchema, createCategorySchema, updateCategorySchema, categoryQuerySchema } from './schema';

export class CategoryService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Create a new category
   */
  async create(data: CreateCategory, tenantId?: string): Promise<Category> {
    const validatedData = createCategorySchema.parse(data);
    
    // Check if slug is unique within the store
    const existingCategory = await this.prisma.category.findFirst({
      where: {
        slug: validatedData.slug,
        storeId: validatedData.storeId,
        tenantId: tenantId || null,
      },
    });

    if (existingCategory) {
      throw new Error(`Category with slug "${validatedData.slug}" already exists in this store`);
    }

    // Check if parent category exists and belongs to the same store
    if (validatedData.parentId) {
      const parentCategory = await this.prisma.category.findFirst({
        where: {
          id: validatedData.parentId,
          storeId: validatedData.storeId,
          tenantId: tenantId || null,
        },
      });

      if (!parentCategory) {
        throw new Error('Parent category not found or does not belong to the same store');
      }
    }

    const category = await this.prisma.category.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        slug: validatedData.slug,
        imageUrl: validatedData.imageUrl,
        isActive: validatedData.isActive,
        isPublished: validatedData.isPublished,
        parentId: validatedData.parentId,
        sortOrder: validatedData.sortOrder,
        organizationId: validatedData.organizationId,
        storeId: validatedData.storeId,
        tenantId: tenantId || null,
        createdBy: validatedData.createdBy,
      },
    });

    return category;
  }

  /**
   * Find category by ID
   */
  async findById(id: string, tenantId?: string): Promise<Category | null> {
    const category = await this.prisma.category.findFirst({
      where: {
        id,
        tenantId: tenantId || null,
      },
      include: {
        parent: true,
        children: true,
        _count: {
          select: {
            children: true,
          },
        },
      },
    });

    return category;
  }

  /**
   * List categories with filtering and pagination
   */
  async list(query: CategoryQuery, tenantId?: string): Promise<{
    categories: Category[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const validatedQuery = categoryQuerySchema.parse(query);
    const { page, limit, search, isActive, isPublished, parentId, organizationId, storeId, sortBy, sortOrder } = validatedQuery;

    const where: any = {
      tenantId: tenantId || null,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (isPublished !== undefined) {
      where.isPublished = isPublished;
    }

    if (parentId) {
      where.parentId = parentId;
    }

    if (organizationId) {
      where.organizationId = organizationId;
    }

    if (storeId) {
      where.storeId = storeId;
    }

    const [categories, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        include: {
          parent: true,
          _count: {
            select: {
              children: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.category.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      categories,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Update category
   */
  async update(id: string, data: UpdateCategory, tenantId?: string): Promise<Category> {
    const validatedData = updateCategorySchema.parse({ ...data, id });

    // Check if category exists
    const existingCategory = await this.prisma.category.findFirst({
      where: {
        id,
        tenantId: tenantId || null,
      },
    });

    if (!existingCategory) {
      throw new Error('Category not found');
    }

    // Check if slug is unique (if being updated)
    if (validatedData.slug && validatedData.slug !== existingCategory.slug) {
      const slugExists = await this.prisma.category.findFirst({
        where: {
          slug: validatedData.slug,
          storeId: existingCategory.storeId,
          tenantId: tenantId || null,
          id: { not: id },
        },
      });

      if (slugExists) {
        throw new Error(`Category with slug "${validatedData.slug}" already exists in this store`);
      }
    }

    // Check if parent category exists and belongs to the same store
    if (validatedData.parentId && validatedData.parentId !== existingCategory.parentId) {
      const parentCategory = await this.prisma.category.findFirst({
        where: {
          id: validatedData.parentId,
          storeId: existingCategory.storeId,
          tenantId: tenantId || null,
        },
      });

      if (!parentCategory) {
        throw new Error('Parent category not found or does not belong to the same store');
      }

      // Prevent circular references
      if (validatedData.parentId === id) {
        throw new Error('Category cannot be its own parent');
      }
    }

    const category = await this.prisma.category.update({
      where: { id },
      data: validatedData,
      include: {
        parent: true,
        children: true,
      },
    });

    return category;
  }

  /**
   * Delete category (soft delete)
   */
  async delete(id: string, tenantId?: string): Promise<boolean> {
    const category = await this.prisma.category.findFirst({
      where: {
        id,
        tenantId: tenantId || null,
      },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    // Check if category has children
    const hasChildren = await this.prisma.category.findFirst({
      where: {
        parentId: id,
        tenantId: tenantId || null,
      },
    });

    if (hasChildren) {
      throw new Error('Cannot delete category with children. Please move or delete children first.');
    }

    await this.prisma.category.update({
      where: { id },
      data: { isActive: false, isPublished: false },
    });

    return true;
  }

  /**
   * Get category tree for hierarchical display
   */
  async getTree(storeId: string, tenantId?: string): Promise<CategoryTreeNode[]> {
    const categories = await this.prisma.category.findMany({
      where: {
        storeId,
        tenantId: tenantId || null,
        isActive: true,
      },
      include: {
        _count: {
          select: {
            children: true,
          },
        },
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    const buildTree = (parentId: string | null): CategoryTreeNode[] => {
      return categories
        .filter((cat: any) => cat.parentId === parentId)
        .map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          description: cat.description || undefined,
          imageUrl: cat.imageUrl,
          isActive: cat.isActive,
          isPublished: cat.isPublished,
          sortOrder: cat.sortOrder,
          children: buildTree(cat.id),
          productCount: 0, // TODO: Add product count logic
          level: parentId ? 1 : 0,
          path: [], // TODO: Build path array
        }));
    };

    return buildTree(null);
  }

  /**
   * Get category statistics
   */
  async getStats(tenantId?: string): Promise<CategoryStats> {
    const [
      totalCategories,
      activeCategories,
      publishedCategories,
      categoriesWithChildren,
      topCategories,
    ] = await Promise.all([
      this.prisma.category.count({
        where: { tenantId: tenantId || null },
      }),
      this.prisma.category.count({
        where: { 
          tenantId: tenantId || null,
          isActive: true,
        },
      }),
      this.prisma.category.count({
        where: { 
          tenantId: tenantId || null,
          isPublished: true,
        },
      }),
      this.prisma.category.count({
        where: { 
          tenantId: tenantId || null,
          children: { some: {} },
        },
      }),
      this.prisma.category.findMany({
        where: { tenantId: tenantId || null },
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              children: true,
            },
          },
        },
        orderBy: {
          children: {
            _count: 'desc',
          },
        },
        take: 10,
      }),
    ]);

    const averageProductsPerCategory = totalCategories > 0 ? categoriesWithChildren / totalCategories : 0;

    return {
      totalCategories,
      activeCategories,
      publishedCategories,
      categoriesWithProducts: categoriesWithChildren,
      averageProductsPerCategory,
      topCategories: topCategories.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        productCount: cat._count.children,
      })),
    };
  }

  /**
   * Bulk operations on categories
   */
  async bulkOperation(operation: CategoryBulkOperation, tenantId?: string): Promise<boolean> {
    const { ids, operation: op, targetParentId, targetStoreId } = operation;

    // Verify all categories exist and belong to the tenant
    const categories = await this.prisma.category.findMany({
      where: {
        id: { in: ids },
        tenantId: tenantId || null,
      },
    });

    if (categories.length !== ids.length) {
      throw new Error('Some categories not found or do not belong to the tenant');
    }

    switch (op) {
      case 'activate':
        await this.prisma.category.updateMany({
          where: { id: { in: ids } },
          data: { isActive: true },
        });
        break;

      case 'deactivate':
        await this.prisma.category.updateMany({
          where: { id: { in: ids } },
          data: { isActive: false, isPublished: false },
        });
        break;

      case 'publish':
        await this.prisma.category.updateMany({
          where: { id: { in: ids } },
          data: { isPublished: true },
        });
        break;

      case 'unpublish':
        await this.prisma.category.updateMany({
          where: { id: { in: ids } },
          data: { isPublished: false },
        });
        break;

      case 'delete':
        await this.prisma.category.updateMany({
          where: { id: { in: ids } },
          data: { isActive: false, isPublished: false },
        });
        break;

      case 'move':
        if (!targetParentId && !targetStoreId) {
          throw new Error('Target parent ID or store ID is required for move operation');
        }
        
        const updateData: any = {};
        if (targetParentId) updateData.parentId = targetParentId;
        if (targetStoreId) updateData.storeId = targetStoreId;

        await this.prisma.category.updateMany({
          where: { id: { in: ids } },
          data: updateData,
        });
        break;

      default:
        throw new Error(`Unknown operation: ${op}`);
    }

    return true;
  }

  /**
   * Import categories from external data
   */
  async import(data: CategoryImportData[], organizationId: string, storeId: string, tenantId?: string): Promise<Category[]> {
    const importedCategories: Category[] = [];

    for (const item of data) {
      try {
        // Find parent category by slug if provided
        let parentId = null;
        if (item.parentSlug) {
          const parentCategory = await this.prisma.category.findFirst({
            where: {
              slug: item.parentSlug,
              storeId,
              tenantId: tenantId || null,
            },
          });
          parentId = parentCategory?.id || null;
        }

        const category = await this.create({
          name: item.name,
          slug: item.slug,
          description: item.description ?? null,
          imageUrl: null,
          parentId,
          sortOrder: item.sortOrder || 0,
          isActive: item.isActive ?? true,
          isPublished: item.isPublished ?? false,
          organizationId,
          storeId,
          tenantId: tenantId ?? null,
          createdBy: null,
        }, tenantId);

        importedCategories.push(category);
      } catch (error) {
        console.error(`Failed to import category ${item.name}:`, error);
        throw new Error(`Failed to import category ${item.name}: ${error}`);
      }
    }

    return importedCategories;
  }

  /**
   * Export categories to external format
   */
  async export(storeId: string, tenantId?: string): Promise<CategoryExportData[]> {
    const categories = await this.prisma.category.findMany({
      where: {
        storeId,
        tenantId: tenantId || null,
      },
      include: {
        parent: true,
        _count: {
          select: {
            children: true,
          },
        },
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    return categories.map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description || undefined,
      parentSlug: cat.parent?.slug,
      sortOrder: cat.sortOrder,
      isActive: cat.isActive,
      isPublished: cat.isPublished,
      organizationId: cat.organizationId,
      storeId: cat.storeId,
      createdAt: cat.createdAt.toISOString(),
      updatedAt: cat.updatedAt.toISOString(),
      productCount: cat._count.children,
    }));
  }
} 