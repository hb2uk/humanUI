import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '@humanui/db';
import { withTenant, TenantRequest } from '../middleware/tenant';
import { withOptionalLocale, LocaleRequest } from '../middleware/locale';

// Types for route generation
export interface EntityConfig {
  name: string;
  service: any;
  schemas: {
    create?: z.ZodSchema;
    update?: z.ZodSchema;
    query?: z.ZodSchema;
  };
  endpoints?: {
    list?: boolean;
    create?: boolean;
    getById?: boolean;
    update?: boolean;
    patch?: boolean;
    delete?: boolean;
    hardDelete?: boolean;
    stats?: boolean;
    bulk?: boolean;
  };
  middleware?: {
    tenant?: boolean;
    locale?: boolean;
    auth?: boolean;
  };
}

export interface GeneratedRoute {
  path: string;
  router: Router;
  config: EntityConfig;
}

/**
 * Auto-generates route handlers for entities based on their service and schema definitions
 */
export class RouteGenerator {
  private static instance: RouteGenerator;
  private entityConfigs: Map<string, EntityConfig> = new Map();

  static getInstance(): RouteGenerator {
    if (!RouteGenerator.instance) {
      RouteGenerator.instance = new RouteGenerator();
    }
    return RouteGenerator.instance;
  }

  /**
   * Register an entity configuration for route generation
   */
  registerEntity(config: EntityConfig): void {
    this.entityConfigs.set(config.name, config);
  }

  /**
   * Auto-discover entities from @humanui/entities and register them
   */
  async discoverEntities(): Promise<void> {
    try {
      // Import entities dynamically
      const entities = await import('@humanui/entities');
      
      // Look for service classes and schemas
      const entityNames = Object.keys(entities).filter(key => {
        const entity = entities[key];
        return (
          typeof entity === 'function' && 
          entity.prototype && 
          (entity.prototype.constructor.name.includes('Service') || 
           key.includes('Service'))
        );
      });

      for (const entityName of entityNames) {
        const serviceClass = entities[entityName];
        const baseName = entityName.replace('Service', '').toLowerCase();
        
        // Try to find corresponding schemas
        const createSchema = entities[`create${baseName.charAt(0).toUpperCase() + baseName.slice(1)}Schema`] || 
                           entities[`create${entityName.replace('Service', '')}Schema`];
        const updateSchema = entities[`update${baseName.charAt(0).toUpperCase() + baseName.slice(1)}Schema`] || 
                           entities[`update${entityName.replace('Service', '')}Schema`];
        const querySchema = entities[`${baseName}QuerySchema`] || 
                          entities[`${entityName.replace('Service', '')}QuerySchema`];

        const config: EntityConfig = {
          name: baseName,
          service: new serviceClass(prisma),
          schemas: {
            create: createSchema,
            update: updateSchema,
            query: querySchema,
          },
          endpoints: {
            list: true,
            create: true,
            getById: true,
            update: true,
            patch: true,
            delete: true,
            hardDelete: true,
            stats: true,
            bulk: true,
          },
          middleware: {
            tenant: true,
            locale: true,
            auth: false,
          },
        };

        this.registerEntity(config);
      }
    } catch (error) {
      console.warn('Could not auto-discover entities:', error);
    }
  }

  /**
   * Generate routes for a specific entity
   */
  generateRoutes(entityName: string): GeneratedRoute | null {
    const config = this.entityConfigs.get(entityName);
    if (!config) {
      console.warn(`No configuration found for entity: ${entityName}`);
      return null;
    }

    const router = Router();
    const { service, schemas, endpoints, middleware } = config;

    // Combined request type for tenant and locale
    interface EntityRequest extends TenantRequest, LocaleRequest {}

    // Helper function to format dates based on locale
    const formatDate = (date: Date, dateFormat?: string): string => {
      if (!dateFormat) return date.toISOString();
      
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
    };

    // Helper function to create middleware chain
    const createMiddleware = () => {
      const middlewareChain = [];
      if (middleware?.tenant) {
        middlewareChain.push(withTenant());
      }
      if (middleware?.locale) {
        middlewareChain.push(withOptionalLocale());
      }
      return middlewareChain;
    };

    // GET /api/{entity} - List entities
    if (endpoints?.list) {
      router.get('/', ...createMiddleware(), async (req: EntityRequest, res) => {
        try {
          const queryParams = schemas.query ? schemas.query.parse(req.query) : req.query;
          const result = await service.list(queryParams, req.tenantId);

          const formattedItems = result.items?.map((item: any) => ({
            ...item,
            createdAt: formatDate(item.createdAt, req.localeSettings?.dateFormat),
            updatedAt: formatDate(item.updatedAt, req.localeSettings?.dateFormat),
          })) || [];

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
          console.error(`Error fetching ${entityName}:`, error);
          res.status(500).json({
            error: 'Internal Server Error',
            code: 'INTERNAL_ERROR',
            message: `Failed to fetch ${entityName}`
          });
        }
      });
    }

    // POST /api/{entity} - Create entity
    if (endpoints?.create) {
      router.post('/', ...createMiddleware(), async (req: EntityRequest, res) => {
        try {
          const entityData = schemas.create ? schemas.create.parse(req.body) : req.body;
          const newEntity = await service.create(
            entityData, 
            req.tenantId, 
            req.headers['x-user-id'] as string
          );

          const formattedEntity = {
            ...newEntity,
            createdAt: formatDate(newEntity.createdAt, req.localeSettings?.dateFormat),
            updatedAt: formatDate(newEntity.updatedAt, req.localeSettings?.dateFormat),
          };

          res.status(201).json({
            data: formattedEntity,
            meta: {
              created: true,
              timestamp: new Date().toISOString()
            },
            links: {
              self: `${req.protocol}://${req.get('host')}/api/${entityName}/${newEntity.id}`,
              collection: `${req.protocol}://${req.get('host')}/api/${entityName}`
            }
          });
        } catch (error) {
          if (error instanceof z.ZodError) {
            return res.status(400).json({
              error: 'Validation Error',
              code: 'VALIDATION_ERROR',
              message: 'Invalid entity data',
              details: error.errors
            });
          }
          console.error(`Error creating ${entityName}:`, error);
          res.status(500).json({
            error: 'Internal Server Error',
            code: 'INTERNAL_ERROR',
            message: `Failed to create ${entityName}`
          });
        }
      });
    }

    // GET /api/{entity}/:id - Get entity by ID
    if (endpoints?.getById) {
      router.get('/:id', ...createMiddleware(), async (req: EntityRequest, res) => {
        try {
          const { id } = req.params;
          const entity = await service.getById(id, req.tenantId);

          if (!entity) {
            return res.status(404).json({
              error: 'Not Found',
              code: 'ENTITY_NOT_FOUND',
              message: `${entityName} not found`
            });
          }

          const formattedEntity = {
            ...entity,
            createdAt: formatDate(entity.createdAt, req.localeSettings?.dateFormat),
            updatedAt: formatDate(entity.updatedAt, req.localeSettings?.dateFormat),
          };

          res.json({
            data: formattedEntity,
            meta: {
              retrieved: new Date().toISOString(),
              tenant: req.tenantId
            },
            links: {
              self: `${req.protocol}://${req.get('host')}/api/${entityName}/${id}`,
              collection: `${req.protocol}://${req.get('host')}/api/${entityName}`
            }
          });
        } catch (error) {
          console.error(`Error fetching ${entityName}:`, error);
          res.status(500).json({
            error: 'Internal Server Error',
            code: 'INTERNAL_ERROR',
            message: `Failed to fetch ${entityName}`
          });
        }
      });
    }

    // PUT /api/{entity}/:id - Update entity
    if (endpoints?.update) {
      router.put('/:id', ...createMiddleware(), async (req: EntityRequest, res) => {
        try {
          const { id } = req.params;
          const updateData = schemas.update ? schemas.update.parse({ id, ...req.body }) : { id, ...req.body };

          const existingEntity = await service.getById(id, req.tenantId);
          if (!existingEntity) {
            return res.status(404).json({
              error: 'Not Found',
              code: 'ENTITY_NOT_FOUND',
              message: `${entityName} not found`
            });
          }

          const updatedEntity = await service.update(updateData, req.tenantId);

          const formattedEntity = {
            ...updatedEntity,
            createdAt: formatDate(updatedEntity.createdAt, req.localeSettings?.dateFormat),
            updatedAt: formatDate(updatedEntity.updatedAt, req.localeSettings?.dateFormat),
          };

          res.json({
            data: formattedEntity,
            meta: {
              updated: true,
              timestamp: new Date().toISOString(),
              tenant: req.tenantId
            },
            links: {
              self: `${req.protocol}://${req.get('host')}/api/${entityName}/${id}`,
              collection: `${req.protocol}://${req.get('host')}/api/${entityName}`
            }
          });
        } catch (error) {
          if (error instanceof z.ZodError) {
            return res.status(400).json({
              error: 'Validation Error',
              code: 'VALIDATION_ERROR',
              message: 'Invalid entity data',
              details: error.errors
            });
          }
          console.error(`Error updating ${entityName}:`, error);
          res.status(500).json({
            error: 'Internal Server Error',
            code: 'INTERNAL_ERROR',
            message: `Failed to update ${entityName}`
          });
        }
      });
    }

    // PATCH /api/{entity}/:id - Partially update entity
    if (endpoints?.patch) {
      router.patch('/:id', ...createMiddleware(), async (req: EntityRequest, res) => {
        try {
          const { id } = req.params;
          const updateData = { id, ...req.body };

          const existingEntity = await service.getById(id, req.tenantId);
          if (!existingEntity) {
            return res.status(404).json({
              error: 'Not Found',
              code: 'ENTITY_NOT_FOUND',
              message: `${entityName} not found`
            });
          }

          const updatedEntity = await service.update(updateData, req.tenantId);

          const formattedEntity = {
            ...updatedEntity,
            createdAt: formatDate(updatedEntity.createdAt, req.localeSettings?.dateFormat),
            updatedAt: formatDate(updatedEntity.updatedAt, req.localeSettings?.dateFormat),
          };

          res.json({
            data: formattedEntity,
            meta: {
              updated: true,
              timestamp: new Date().toISOString(),
              tenant: req.tenantId
            },
            links: {
              self: `${req.protocol}://${req.get('host')}/api/${entityName}/${id}`,
              collection: `${req.protocol}://${req.get('host')}/api/${entityName}`
            }
          });
        } catch (error) {
          console.error(`Error updating ${entityName}:`, error);
          res.status(500).json({
            error: 'Internal Server Error',
            code: 'INTERNAL_ERROR',
            message: `Failed to update ${entityName}`
          });
        }
      });
    }

    // DELETE /api/{entity}/:id - Delete entity (soft delete)
    if (endpoints?.delete) {
      router.delete('/:id', ...createMiddleware(), async (req: EntityRequest, res) => {
        try {
          const { id } = req.params;
          const existingEntity = await service.getById(id, req.tenantId);
          if (!existingEntity) {
            return res.status(404).json({
              error: 'Not Found',
              code: 'ENTITY_NOT_FOUND',
              message: `${entityName} not found`
            });
          }

          const deletedEntity = await service.delete(id, req.tenantId);

          const formattedEntity = {
            ...deletedEntity,
            createdAt: formatDate(deletedEntity.createdAt, req.localeSettings?.dateFormat),
            updatedAt: formatDate(deletedEntity.updatedAt, req.localeSettings?.dateFormat),
          };

          res.json({
            data: formattedEntity,
            meta: {
              deleted: true,
              timestamp: new Date().toISOString(),
              tenant: req.tenantId
            },
            links: {
              collection: `${req.protocol}://${req.get('host')}/api/${entityName}`
            }
          });
        } catch (error) {
          console.error(`Error deleting ${entityName}:`, error);
          res.status(500).json({
            error: 'Internal Server Error',
            code: 'INTERNAL_ERROR',
            message: `Failed to delete ${entityName}`
          });
        }
      });
    }

    // DELETE /api/{entity}/:id/hard - Hard delete entity
    if (endpoints?.hardDelete) {
      router.delete('/:id/hard', ...createMiddleware(), async (req: EntityRequest, res) => {
        try {
          const { id } = req.params;
          const existingEntity = await service.getById(id, req.tenantId);
          if (!existingEntity) {
            return res.status(404).json({
              error: 'Not Found',
              code: 'ENTITY_NOT_FOUND',
              message: `${entityName} not found`
            });
          }

          const deletedEntity = await service.hardDelete(id, req.tenantId);

          res.json({
            data: { id: deletedEntity.id },
            meta: {
              hardDeleted: true,
              timestamp: new Date().toISOString(),
              tenant: req.tenantId
            },
            links: {
              collection: `${req.protocol}://${req.get('host')}/api/${entityName}`
            }
          });
        } catch (error) {
          console.error(`Error hard deleting ${entityName}:`, error);
          res.status(500).json({
            error: 'Internal Server Error',
            code: 'INTERNAL_ERROR',
            message: `Failed to hard delete ${entityName}`
          });
        }
      });
    }

    // GET /api/{entity}/stats - Get entity statistics
    if (endpoints?.stats) {
      router.get('/stats', ...createMiddleware(), async (req: EntityRequest, res) => {
        try {
          const stats = await service.getStats(req.tenantId);

          res.json({
            data: stats,
            meta: {
              generated: new Date().toISOString(),
              tenant: req.tenantId
            }
          });
        } catch (error) {
          console.error(`Error fetching ${entityName} stats:`, error);
          res.status(500).json({
            error: 'Internal Server Error',
            code: 'INTERNAL_ERROR',
            message: `Failed to fetch ${entityName} statistics`
          });
        }
      });
    }

    // POST /api/{entity}/bulk - Bulk operations
    if (endpoints?.bulk) {
      router.post('/bulk', ...createMiddleware(), async (req: EntityRequest, res) => {
        try {
          const { ids, operation, data } = req.body;

          if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
              error: 'Validation Error',
              code: 'VALIDATION_ERROR',
              message: 'IDs array is required and must not be empty'
            });
          }

          const affectedCount = await service.bulkOperation(
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
          console.error(`Error performing bulk operation on ${entityName}:`, error);
          res.status(500).json({
            error: 'Internal Server Error',
            code: 'INTERNAL_ERROR',
            message: `Failed to perform bulk operation on ${entityName}`
          });
        }
      });
    }

    return {
      path: entityName,
      router,
      config
    };
  }

  /**
   * Generate routes for all registered entities
   */
  generateAllRoutes(): GeneratedRoute[] {
    const routes: GeneratedRoute[] = [];
    
    for (const [entityName] of this.entityConfigs) {
      const route = this.generateRoutes(entityName);
      if (route) {
        routes.push(route);
      }
    }

    return routes;
  }

  /**
   * Get all registered entity configurations
   */
  getEntityConfigs(): Map<string, EntityConfig> {
    return new Map(this.entityConfigs);
  }
} 