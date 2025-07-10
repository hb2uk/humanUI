import { z } from 'zod';
import { SchemaBuilder, BaseService, TenantRules, BusinessLogic } from './SchemaBuilder';

export interface EntityConfig {
  name: string;
  schema: z.ZodObject<any>;
  tenantRules: TenantRules;
  businessLogic?: BusinessLogic;
  displayName?: string;
  description?: string;
  icon?: string;
  color?: string;
}

export class EntityRegistry {
  private entities: Map<string, EntityConfig> = new Map();
  private builders: Map<string, SchemaBuilder> = new Map();

  registerEntity(config: EntityConfig): void {
    this.entities.set(config.name, config);
    
    const builder = new SchemaBuilder(
      config.schema,
      config.tenantRules,
      config.businessLogic,
      config.name
    );
    
    this.builders.set(config.name, builder);
  }

  getEntity(name: string): EntityConfig | undefined {
    return this.entities.get(name);
  }

  getBuilder(name: string): SchemaBuilder | undefined {
    return this.builders.get(name);
  }

  generateService(name: string): BaseService | undefined {
    const builder = this.builders.get(name);
    return builder?.generateService();
  }

  getAllEntities(): EntityConfig[] {
    return Array.from(this.entities.values());
  }

  getEntityNames(): string[] {
    return Array.from(this.entities.keys());
  }

  // Helper function to convert Zod schema to plain object
  private serializeZodSchema(schema: z.ZodObject<any>) {
    const shape = schema.shape;
    const fields: any[] = [];
    
    for (const [key, field] of Object.entries(shape)) {
      const fieldDef = (field as any)._def;
      fields.push({
        name: key,
        type: fieldDef.typeName || 'unknown',
        required: !fieldDef.isOptional,
        description: fieldDef.description,
      });
    }
    
    return {
      fields,
      required: Object.keys(shape).filter(key => !(shape[key] as any)._def.isOptional),
      optional: Object.keys(shape).filter(key => (shape[key] as any)._def.isOptional),
    };
  }

  // Auto-generate admin routes
  generateAdminRoutes() {
    const routes: any[] = [];
    
    for (const [name, config] of this.entities) {
      const builder = this.builders.get(name);
      if (!builder) continue;

      routes.push({
        name,
        displayName: config.displayName || name,
        description: config.description,
        icon: config.icon,
        color: config.color,
        schema: this.serializeZodSchema(builder.createSchema()),
        updateSchema: this.serializeZodSchema(builder.updateSchema()),
        querySchema: this.serializeZodSchema(builder.querySchema()),
        // Exclude Zod schemas to prevent serialization issues
        // zodSchema: builder.createSchema(),
        // zodUpdateSchema: builder.updateSchema(),
        // zodQuerySchema: builder.querySchema(),
      });
    }

    return routes;
  }

  // Auto-generate API endpoints
  generateAPIEndpoints() {
    const endpoints: any[] = [];
    
    for (const [name, config] of this.entities) {
      const builder = this.builders.get(name);
      if (!builder) continue;

      endpoints.push({
        entity: name,
        routes: {
          create: `POST /api/${name}`,
          list: `GET /api/${name}`,
          get: `GET /api/${name}/:id`,
          update: `PUT /api/${name}/:id`,
          delete: `DELETE /api/${name}/:id`,
          stats: `GET /api/${name}/stats`,
        },
        schemas: {
          create: builder.createSchema(),
          update: builder.updateSchema(),
          query: builder.querySchema(),
        },
      });
    }

    return endpoints;
  }

  // Validate entity configuration
  validateEntity(name: string): string[] {
    const errors: string[] = [];
    const config = this.entities.get(name);
    
    if (!config) {
      errors.push(`Entity '${name}' not found`);
      return errors;
    }

    // Validate required fields
    if (!config.schema) {
      errors.push(`Schema is required for entity '${name}'`);
    }

    if (!config.tenantRules) {
      errors.push(`Tenant rules are required for entity '${name}'`);
    }

    // Validate schema has required fields
    const schemaKeys = Object.keys(config.schema.shape);
    const requiredFields = ['id', 'createdAt', 'updatedAt', 'tenantId', 'isActive'];
    
    for (const field of requiredFields) {
      if (!schemaKeys.includes(field)) {
        errors.push(`Schema for '${name}' must include field '${field}'`);
      }
    }

    return errors;
  }

  // Get entity statistics
  getEntityStats() {
    return {
      total: this.entities.size,
      entities: this.getAllEntities().map(config => ({
        name: config.name,
        displayName: config.displayName || config.name,
        hasBusinessLogic: !!config.businessLogic,
        requiredFields: config.tenantRules.requiredFields || [],
        optionalFields: config.tenantRules.optionalFields || [],
      })),
    };
  }
}

// Global entity registry instance
export const entityRegistry = new EntityRegistry(); 