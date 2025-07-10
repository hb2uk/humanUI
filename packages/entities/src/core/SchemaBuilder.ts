import { z } from 'zod';
import { PrismaClient } from '@humanui/db';

// Enhanced tenant validation rules
export interface TenantValidationRules {
  maxNameLength?: number;
  maxDescriptionLength?: number;
  allowedTypes?: string[];
  customValidators?: Record<string, (value: any) => boolean>;
  requiredFields?: string[];
  optionalFields?: string[];
  uniqueConstraints?: string[];
  validationRules?: Record<string, any>;
}

// Types for tenant rules and business logic
export interface TenantRules extends TenantValidationRules {
  requiredFields?: string[];
  optionalFields?: string[];
  uniqueConstraints?: string[];
  validationRules?: Record<string, any>;
}

export interface BusinessLogic {
  beforeCreate?: (data: any, tenantId?: string) => Promise<any>;
  afterCreate?: (entity: any, tenantId?: string) => Promise<any>;
  beforeUpdate?: (id: string, data: any, tenantId?: string) => Promise<any>;
  afterUpdate?: (entity: any, tenantId?: string) => Promise<any>;
  beforeDelete?: (id: string, tenantId?: string) => Promise<boolean>;
  afterDelete?: (id: string, tenantId?: string) => Promise<void>;
}

// Enhanced error handling
export interface ValidationError {
  code: 'VALIDATION_ERROR' | 'TENANT_ERROR' | 'BUSINESS_LOGIC_ERROR';
  message: string;
  details?: any;
  field?: string;
}

// Base service class with common CRUD operations
export class BaseService {
  private prisma!: PrismaClient;
  private schema: z.ZodObject<any>;
  private tenantRules: TenantRules;
  private businessLogic?: BusinessLogic;
  private entityName: string;

  constructor(
    schema: z.ZodObject<any>,
    tenantRules: TenantRules,
    businessLogic: BusinessLogic | undefined,
    entityName: string
  ) {
    this.schema = schema;
    this.tenantRules = tenantRules;
    this.businessLogic = businessLogic;
    this.entityName = entityName;
  }

  setPrisma(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // Enhanced error handling
  protected handleValidationError(error: z.ZodError): ValidationError {
    return {
      code: 'VALIDATION_ERROR',
      message: 'Invalid data provided',
      details: error.errors,
    };
  }

  protected handleTenantError(message: string, field?: string): ValidationError {
    return {
      code: 'TENANT_ERROR',
      message,
      field,
    };
  }

  protected handleBusinessLogicError(message: string): ValidationError {
    return {
      code: 'BUSINESS_LOGIC_ERROR',
      message,
    };
  }

  // Apply tenant-specific validation rules
  protected applyTenantRules(data: any, tenantId?: string): any {
    const rules = this.tenantRules;
    
    // Apply custom validators
    if (rules.customValidators) {
      for (const [field, validator] of Object.entries(rules.customValidators)) {
        if (data[field] !== undefined && !validator(data[field])) {
          throw new Error(`Validation failed for field: ${field}`);
        }
      }
    }

    // Apply field length restrictions
    if (rules.maxNameLength && data.name && data.name.length > rules.maxNameLength) {
      throw new Error(`Name cannot exceed ${rules.maxNameLength} characters`);
    }

    if (rules.maxDescriptionLength && data.description && data.description.length > rules.maxDescriptionLength) {
      throw new Error(`Description cannot exceed ${rules.maxDescriptionLength} characters`);
    }

    // Apply type restrictions
    if (rules.allowedTypes && data.type && !rules.allowedTypes.includes(data.type)) {
      throw new Error(`Type must be one of: ${rules.allowedTypes.join(', ')}`);
    }

    return data;
  }

  async create(data: any, tenantId?: string): Promise<any> {
    try {
      // Apply tenant rules
      data = this.applyTenantRules(data, tenantId);

      // Apply business logic hooks
      if (this.businessLogic?.beforeCreate) {
        data = await this.businessLogic.beforeCreate(data, tenantId);
      }

      const validatedData = this.schema.parse(data);
      
      const entity = await (this.prisma as any)[this.entityName.toLowerCase()].create({
        data: {
          ...validatedData,
          tenantId: tenantId ?? null,
        },
      });

      // Apply after create hooks
      if (this.businessLogic?.afterCreate) {
        await this.businessLogic.afterCreate(entity, tenantId);
      }

      return entity;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw this.handleValidationError(error);
      }
      throw error;
    }
  }

  async findById(id: string, tenantId?: string): Promise<any | null> {
    return (this.prisma as any)[this.entityName.toLowerCase()].findFirst({
      where: {
        id,
        tenantId: tenantId ?? null,
      },
    });
  }

  async list(query: any, tenantId?: string): Promise<{
    items: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 20, search, sortBy = 'createdAt', sortOrder = 'desc' } = query;

    const where: any = {
      tenantId: tenantId ?? null,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      (this.prisma as any)[this.entityName.toLowerCase()].findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      (this.prisma as any)[this.entityName.toLowerCase()].count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id: string, data: any, tenantId?: string): Promise<any> {
    try {
      // Apply tenant rules
      data = this.applyTenantRules(data, tenantId);

      // Apply business logic hooks
      if (this.businessLogic?.beforeUpdate) {
        data = await this.businessLogic.beforeUpdate(id, data, tenantId);
      }

      const validatedData = this.schema.partial().parse(data);

      const entity = await (this.prisma as any)[this.entityName.toLowerCase()].update({
        where: { id },
        data: validatedData,
      });

      // Apply after update hooks
      if (this.businessLogic?.afterUpdate) {
        await this.businessLogic.afterUpdate(entity, tenantId);
      }

      return entity;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw this.handleValidationError(error);
      }
      throw error;
    }
  }

  async delete(id: string, tenantId?: string): Promise<boolean> {
    try {
      // Apply business logic hooks
      if (this.businessLogic?.beforeDelete) {
        const canDelete = await this.businessLogic.beforeDelete(id, tenantId);
        if (!canDelete) return false;
      }

      await (this.prisma as any)[this.entityName.toLowerCase()].update({
        where: { id },
        data: { isActive: false },
      });

      // Apply after delete hooks
      if (this.businessLogic?.afterDelete) {
        await this.businessLogic.afterDelete(id, tenantId);
      }

      return true;
    } catch (error) {
      throw this.handleBusinessLogicError(`Failed to delete ${this.entityName}: ${error}`);
    }
  }

  async getStats(tenantId?: string): Promise<any> {
    const [total, active] = await Promise.all([
      (this.prisma as any)[this.entityName.toLowerCase()].count({
        where: { tenantId: tenantId ?? null },
      }),
      (this.prisma as any)[this.entityName.toLowerCase()].count({
        where: { 
          tenantId: tenantId ?? null,
          isActive: true,
        },
      }),
    ]);

    return {
      total,
      active,
      inactive: total - active,
    };
  }
}

export class SchemaBuilder {
  private baseSchema: z.ZodObject<any>;
  private tenantRules: TenantRules;
  private businessLogic?: BusinessLogic;
  private entityName: string;

  constructor(
    baseSchema: z.ZodObject<any>,
    tenantRules: TenantRules,
    businessLogic: BusinessLogic | undefined,
    entityName: string
  ) {
    this.baseSchema = baseSchema;
    this.tenantRules = tenantRules;
    this.businessLogic = businessLogic;
    this.entityName = entityName;
  }

  // Auto-generate CRUD schemas
  createSchema() {
    return this.baseSchema.omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      createdBy: true,
      updatedBy: true,
      tenantId: true,
      isActive: true,
    });
  }

  updateSchema() {
    return this.baseSchema.partial().omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      createdBy: true,
      updatedBy: true,
      tenantId: true,
      isActive: true,
    });
  }

  querySchema() {
    return z.object({
      page: z.number().min(1).optional(),
      limit: z.number().min(1).max(100).optional(),
      search: z.string().optional(),
      sortBy: z.string().optional(),
      sortOrder: z.enum(['asc', 'desc']).optional(),
    });
  }

  generateService(): BaseService {
    return new BaseService(this.baseSchema, this.tenantRules, this.businessLogic, this.entityName);
  }
} 