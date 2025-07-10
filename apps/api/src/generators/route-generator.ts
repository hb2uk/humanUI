import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '@humanui/db';
import { withTenant, TenantRequest } from '../middleware/tenant';
import { withOptionalLocale, LocaleRequest } from '../middleware/locale';
import { entityRegistry, getAPIEndpoints } from '@humanui/entities';

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
      // Get API endpoints from the entity registry
      const apiEndpoints = getAPIEndpoints();
      
      for (const endpoint of apiEndpoints) {
        const entityName = endpoint.entity.toLowerCase();
        const builder = entityRegistry.getBuilder(endpoint.entity);
        
        if (!builder) {
          console.warn(`No builder found for entity: ${endpoint.entity}`);
          continue;
        }

        // Generate service instance
        const service = builder.generateService();
        service.setPrisma(prisma);

        const config: EntityConfig = {
          name: entityName,
          service,
          schemas: {
            create: endpoint.schemas.create,
            update: endpoint.schemas.update,
            query: endpoint.schemas.query,
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

          // Handle different property names for the items array
          const itemsKey = Object.keys(result).find(key => 
            Array.isArray(result[key]) && 
            key !== 'total' && 
            key !== 'page' && 
            key !== 'limit' && 
            key !== 'totalPages'
          );
          
          const items = itemsKey ? result[itemsKey] : [];

          const formattedItems = items.map((item: any) => ({
            ...item,
            createdAt: formatDate(item.createdAt, req.localeSettings?.dateFormat),
            updatedAt: formatDate(item.updatedAt, req.localeSettings?.dateFormat),
          }));

          res.json({
            data: formattedItems,
            pagination: {
              total: result.total || 0,
              page: result.page || 1,
              limit: result.limit || 20,
              totalPages: result.totalPages || 1,
            },
          });
        } catch (error) {
          console.error(`Error listing ${entityName}:`, error);
          res.status(500).json({ 
            error: `Failed to list ${entityName}`,
            details: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      });
    }

    // POST /api/{entity} - Create entity
    if (endpoints?.create) {
      router.post('/', ...createMiddleware(), async (req: EntityRequest, res) => {
        try {
          const validatedData = schemas.create ? schemas.create.parse(req.body) : req.body;
          const result = await service.create(validatedData, req.tenantId);
          
          res.status(201).json({
            data: {
              ...result,
              createdAt: formatDate(result.createdAt, req.localeSettings?.dateFormat),
              updatedAt: formatDate(result.updatedAt, req.localeSettings?.dateFormat),
            },
          });
        } catch (error) {
          console.error(`Error creating ${entityName}:`, error);
          res.status(400).json({ 
            error: `Failed to create ${entityName}`,
            details: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      });
    }

    // GET /api/{entity}/:id - Get entity by ID
    if (endpoints?.getById) {
      router.get('/:id', ...createMiddleware(), async (req: EntityRequest, res) => {
        try {
          const result = await service.findById(req.params.id, req.tenantId);
          
          if (!result) {
            return res.status(404).json({ 
              error: `${entityName} not found` 
            });
          }

          res.json({
            data: {
              ...result,
              createdAt: formatDate(result.createdAt, req.localeSettings?.dateFormat),
              updatedAt: formatDate(result.updatedAt, req.localeSettings?.dateFormat),
            },
          });
        } catch (error) {
          console.error(`Error getting ${entityName}:`, error);
          res.status(500).json({ 
            error: `Failed to get ${entityName}`,
            details: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      });
    }

    // PUT /api/{entity}/:id - Update entity
    if (endpoints?.update) {
      router.put('/:id', ...createMiddleware(), async (req: EntityRequest, res) => {
        try {
          const validatedData = schemas.update ? schemas.update.parse(req.body) : req.body;
          const result = await service.update(req.params.id, validatedData, req.tenantId);
          
          res.json({
            data: {
              ...result,
              createdAt: formatDate(result.createdAt, req.localeSettings?.dateFormat),
              updatedAt: formatDate(result.updatedAt, req.localeSettings?.dateFormat),
            },
          });
        } catch (error) {
          console.error(`Error updating ${entityName}:`, error);
          res.status(400).json({ 
            error: `Failed to update ${entityName}`,
            details: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      });
    }

    // PATCH /api/{entity}/:id - Partial update entity
    if (endpoints?.patch) {
      router.patch('/:id', ...createMiddleware(), async (req: EntityRequest, res) => {
        try {
          const validatedData = schemas.update ? (schemas.update as z.ZodObject<any>).partial().parse(req.body) : req.body;
          const result = await service.update(req.params.id, validatedData, req.tenantId);
          
          res.json({
            data: {
              ...result,
              createdAt: formatDate(result.createdAt, req.localeSettings?.dateFormat),
              updatedAt: formatDate(result.updatedAt, req.localeSettings?.dateFormat),
            },
          });
        } catch (error) {
          console.error(`Error patching ${entityName}:`, error);
          res.status(400).json({ 
            error: `Failed to patch ${entityName}`,
            details: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      });
    }

    // DELETE /api/{entity}/:id - Soft delete entity
    if (endpoints?.delete) {
      router.delete('/:id', ...createMiddleware(), async (req: EntityRequest, res) => {
        try {
          const result = await service.delete(req.params.id, req.tenantId);
          
          if (!result) {
            return res.status(404).json({ 
              error: `${entityName} not found or cannot be deleted` 
            });
          }

          res.status(204).send();
        } catch (error) {
          console.error(`Error deleting ${entityName}:`, error);
          res.status(500).json({ 
            error: `Failed to delete ${entityName}`,
            details: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      });
    }

    // GET /api/{entity}/stats - Get entity statistics
    if (endpoints?.stats) {
      router.get('/stats', ...createMiddleware(), async (req: EntityRequest, res) => {
        try {
          const stats = await service.getStats(req.tenantId);
          res.json({ data: stats });
        } catch (error) {
          console.error(`Error getting ${entityName} stats:`, error);
          res.status(500).json({ 
            error: `Failed to get ${entityName} stats`,
            details: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      });
    }

    return {
      path: `/api/${entityName}`,
      router,
      config,
    };
  }

  /**
   * Generate all routes for all registered entities
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
    return this.entityConfigs;
  }
} 