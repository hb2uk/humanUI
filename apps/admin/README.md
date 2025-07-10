# HumanUI Admin - Entity-Agnostic CRUD Architecture

This admin application implements a fully generic, entity-agnostic CRUD system that automatically generates list, create, edit, and detail views for any entity based on configuration.

## Architecture Overview

### Core Components

1. **Entity Registry** (`lib/entity-registry.ts`)
   - Central registry mapping entity names to their configurations
   - Provides utility functions for entity lookup and validation

2. **Generic Pages** (`app/[entity]/`)
   - `page.tsx` - List view with search and pagination
   - `create/page.tsx` - Create form
   - `[id]/page.tsx` - Detail view
   - `[id]/edit/page.tsx` - Edit form

3. **Generic Components**
   - `EntityTable` - Renders data tables for any entity
   - `EntityNavigation` - Navigation bar with all entities
   - `CreateOrUpdateEntityForm` - Generic form component

4. **Hooks**
   - `useEntity` - Generic CRUD operations hook

## How It Works

### 1. Entity Configuration

Each entity defines two configurations:

```typescript
// API Configuration (packages/entities/src/{entity}/config.ts)
export const itemConfig: EntityConfig = {
  name: "item",
  displayName: "Item",
  path: "item",
  service: itemService,
  schemas: {
    /* ... */
  },
  features: {
    /* ... */
  },
  ui: {
    display: {
      listFields: ["name", "description", "price"],
      detailFields: ["name", "description", "price", "createdAt"],
    },
  },
};

// Form Configuration (packages/entities/src/{entity}/config.ts)
export const itemFormConfig: EntityFormConfig = {
  schema: itemCreateSchema,
  fields: [
    { name: "name", label: "Name", type: "text", required: true },
    { name: "description", label: "Description", type: "textarea" },
    { name: "price", label: "Price", type: "number", required: true },
  ],
};
```

### 2. Dynamic Routing

The system uses Next.js dynamic routes:

- `/item` → `app/[entity]/page.tsx` (list)
- `/item/create` → `app/[entity]/create/page.tsx` (create)
- `/item/123` → `app/[entity]/[id]/page.tsx` (detail)
- `/item/123/edit` → `app/[entity]/[id]/edit/page.tsx` (edit)

### 3. Generic Components

#### EntityTable

```typescript
<EntityTable
  entityConfig={entityConfig}
  data={items}
  onRefresh={handleRefresh}
/>
```

#### CreateOrUpdateEntityForm

```typescript
<CreateOrUpdateEntityForm
  entityConfig={formConfig}
  mode="create"
  onSubmit={handleSubmit}
  onCancel={handleCancel}
/>
```

### 4. Entity Registry

```typescript
// Register all entities
export const entityRegistry: Record<string, EntityRegistryEntry> = {
  item: {
    config: itemConfig,
    formConfig: itemFormConfig,
  },
  category: {
    config: categoryConfig,
    formConfig: categoryFormConfig,
  },
  // ... more entities
};

// Utility functions
getEntityConfig("item"); // Returns itemConfig
getEntityFormConfig("item"); // Returns itemFormConfig
getAllEntities(); // Returns ['item', 'category', ...]
```

## Adding a New Entity

1. **Create Entity Package** (`packages/entities/src/{entity}/`)
   - `config.ts` - API and form configurations
   - `schema.ts` - Zod schemas
   - `service.ts` - CRUD operations
   - `types.ts` - TypeScript types

2. **Update Entity Registry**

   ```typescript
   // In lib/entity-registry.ts
   import { newEntityConfig, newEntityFormConfig } from "@humanui/entities";

   export const entityRegistry = {
     // ... existing entities
     newEntity: {
       config: newEntityConfig,
       formConfig: newEntityFormConfig,
     },
   };
   ```

3. **Update Static Params** (optional)
   ```typescript
   // In each page component
   export async function generateStaticParams() {
     return [
       // ... existing entities
       { entity: "newEntity" },
     ];
   }
   ```

## Features

### Automatic Features

- ✅ List views with search and pagination
- ✅ Create forms with validation
- ✅ Edit forms with pre-populated data
- ✅ Detail views with all fields
- ✅ Delete operations with confirmation
- ✅ Navigation between all entities
- ✅ Responsive design

### Configurable Features

- ✅ Field display in lists and details
- ✅ Form field types and validation
- ✅ Required/optional fields
- ✅ Field descriptions and placeholders
- ✅ Multi-column form layouts
- ✅ Sectioned forms
- ✅ Feature flags (create, read, update, delete, etc.)

### Extensible Features

- ✅ Custom field types
- ✅ Conditional field display
- ✅ Field dependencies
- ✅ Bulk operations
- ✅ Import/export functionality
- ✅ Statistics and analytics

## Usage Examples

### Basic Entity List

```typescript
// Automatically renders table with search, pagination, and actions
<EntityTable entityConfig={itemConfig} />
```

### Custom Form

```typescript
// Renders form based on field configuration
<CreateOrUpdateEntityForm
  entityConfig={itemFormConfig}
  mode="create"
  onSubmit={async (data) => {
    await itemService.create(data);
  }}
/>
```

### Entity Navigation

```typescript
// Automatically shows all registered entities
<EntityNavigation />
```

## Benefits

1. **Zero Boilerplate** - No need to create individual pages for each entity
2. **Consistent UI** - All entities follow the same design patterns
3. **Type Safety** - Full TypeScript support with Zod validation
4. **Scalable** - Easy to add new entities without code changes
5. **Maintainable** - Single source of truth for entity behavior
6. **Flexible** - Highly configurable while maintaining consistency

## Future Enhancements

- [ ] CLI generator for scaffolding new entities
- [ ] Advanced filtering and sorting
- [ ] Bulk operations UI
- [ ] Import/export functionality
- [ ] Advanced field types (file upload, rich text, etc.)
- [ ] Role-based access control
- [ ] Audit logging
- [ ] Real-time updates
- [ ] Mobile-optimized views
