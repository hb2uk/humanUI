import { getAdminRoutes, getEntityStats, entityRegistry } from '@humanui/entities';

export interface EntityConfig {
  name: string;
  displayName: string;
  description?: string;
  icon?: string;
  color?: string;
  schema: any;
  updateSchema: any;
  querySchema: any;
  fields?: any[];
  zodSchema?: any;
  zodUpdateSchema?: any;
  zodQuerySchema?: any;
  // Private Zod schemas for server-side use only
  _zodSchema?: any;
  _zodUpdateSchema?: any;
  _zodQuerySchema?: any;
}

export class AdminEntityRegistry {
  private entities: Map<string, EntityConfig> = new Map();

  constructor() {
    this.initializeEntities();
  }

  private initializeEntities() {
    const adminRoutes = getAdminRoutes();
    console.log('Admin routes from entities package:', adminRoutes);
    
    for (const route of adminRoutes) {
      console.log('Processing route:', route.name, 'with properties:', Object.keys(route));
      
      // Only include serializable properties, exclude Zod schemas
      const { zodSchema, zodUpdateSchema, zodQuerySchema, ...serializableRoute } = route;
      
      this.entities.set(route.name, {
        name: serializableRoute.name,
        displayName: serializableRoute.displayName,
        description: serializableRoute.description,
        icon: serializableRoute.icon,
        color: serializableRoute.color,
        schema: serializableRoute.schema,
        updateSchema: serializableRoute.updateSchema,
        querySchema: serializableRoute.querySchema,
        fields: serializableRoute.fields,
        // Store Zod schemas separately for server-side use only
        _zodSchema: zodSchema,
        _zodUpdateSchema: zodUpdateSchema,
        _zodQuerySchema: zodQuerySchema,
      });
    }
  }

  getEntity(name: string): EntityConfig | undefined {
    return this.entities.get(name);
  }

  getAllEntities(): EntityConfig[] {
    return Array.from(this.entities.values());
  }

  getEntityNames(): string[] {
    return Array.from(this.entities.keys());
  }

  getEntityStats() {
    return getEntityStats();
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

    if (!config.displayName) {
      errors.push(`Display name is required for entity '${name}'`);
    }

    return errors;
  }

  // Get entity by URL path
  getEntityByPath(path: string): EntityConfig | undefined {
    const entityName = path.split('/')[1]; // Extract entity name from path
    return this.getEntity(entityName);
  }

  // Get navigation items for sidebar
  getNavigationItems() {
    return this.getAllEntities().map(entity => ({
      name: entity.name,
      displayName: entity.displayName,
      description: entity.description,
      icon: entity.icon,
      color: entity.color,
      href: `/${entity.name.toLowerCase()}`,
    }));
  }
}

// Global admin entity registry instance
export const adminEntityRegistry = new AdminEntityRegistry();

// Export convenience functions for backward compatibility
export const getEntityConfig = (name: string) => adminEntityRegistry.getEntity(name);
export const getEntityFormConfig = (name: string) => {
  console.log('getEntityFormConfig called with name:', name);
  
  const config = adminEntityRegistry.getEntity(name);
  console.log('Raw entity config:', config);
  
  if (!config) {
    console.error('No entity config found for:', name);
    return null;
  }
  
  console.log('Entity config for', name, ':', config);
  console.log('Config schema:', config.schema);
  console.log('Config _zodSchema:', config._zodSchema);
  
  // Convert serialized schema back to UI package format
  const convertFieldType = (type: string): import('@humanui/ui').FieldType => {
    switch (type) {
      case 'ZodString': return 'text';
      case 'ZodNumber': return 'number';
      case 'ZodBoolean': return 'checkbox';
      case 'ZodDate': return 'date';
      case 'ZodArray': return 'multiselect';
      case 'ZodObject': return 'json';
      default: return 'text';
    }
  };

  if (!config.schema || !config.schema.fields) {
    console.error('Schema or fields missing from config:', config);
    return null;
  }

  const fields = config.schema.fields.map((field: any) => ({
    name: field.name,
    label: field.name.charAt(0).toUpperCase() + field.name.slice(1).replace(/([A-Z])/g, ' $1'),
    type: convertFieldType(field.type),
    required: field.required,
    placeholder: `Enter ${field.name}`,
    description: field.description,
  }));

  // Don't pass Zod schemas to client - they're not serializable
  // Instead, create a simple schema object for the UI
  const simpleSchema = {
    fields: config.schema.fields,
    required: config.schema.required || [],
    optional: config.schema.optional || [],
  };

  const result = {
    schema: simpleSchema, // Use serialized schema instead of Zod schema
    fields,
    title: config.displayName,
    description: config.description,
    submitLabel: 'Create',
    cancelLabel: 'Cancel',
    layout: 'single' as const,
  };

  console.log('Form config result for', name, ':', result);
  return result;
}; 