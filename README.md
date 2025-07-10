# HumanUI - Multi-Tenant Admin Framework

A modern, zero-code entity management system built with Next.js, Prisma, and TypeScript.

## 🚀 Features

### SchemaBuilder - Zero-Code Entity Creation

- **Auto-generated CRUD operations** - Define a schema, get full CRUD functionality
- **Multi-tenant support** - Built-in tenant isolation with configurable rules
- **Business logic hooks** - Before/after hooks for create, update, and delete operations
- **Schema validation** - Zod-based validation with proper nullable field handling
- **Auto-generated admin interface** - Forms and tables generated from schemas
- **API endpoint generation** - RESTful APIs auto-generated for each entity

### Core Architecture

- **Monorepo structure** - Organized with pnpm workspaces and Turbo
- **Multi-tenant design** - Tenant isolation at the database and application level
- **Type-safe development** - Full TypeScript support with Zod validation
- **Modern UI** - Built with Tailwind CSS and React Hook Form
- **Database-first** - Prisma schema with proper migrations

## 📦 Project Structure

```
humanUI/
├── apps/
│   ├── admin/          # Next.js admin interface
│   └── api/            # API server
├── packages/
│   ├── config/         # Shared configuration
│   ├── db/            # Database schema and migrations
│   ├── entities/      # Entity definitions and services
│   ├── ui/            # Shared UI components
│   └── utils/         # Utility functions
```

## 🏗️ Entity System

### Creating a New Entity

1. **Define the Schema**:

```typescript
import { z } from "zod";
import { entityRegistry } from "../core/EntityRegistry";

const productSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1).max(255),
  description: z.string().nullable(),
  price: z.number().positive(),
  categoryId: z.string().cuid().nullable(),
  isActive: z.boolean().default(true),
  tenantId: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
```

2. **Configure Tenant Rules**:

```typescript
const productTenantRules = {
  requiredFields: ["name", "price"],
  optionalFields: ["description", "categoryId"],
  uniqueConstraints: ["name"],
  validationRules: {
    name: { minLength: 1, maxLength: 255 },
    price: { min: 0 },
  },
};
```

3. **Add Business Logic**:

```typescript
const productBusinessLogic = {
  beforeCreate: async (data, tenantId) => {
    // Auto-generate SKU, validate inventory, etc.
    return data;
  },
  beforeUpdate: async (id, data, tenantId) => {
    // Validate changes, update related entities
    return data;
  },
};
```

4. **Register the Entity**:

```typescript
entityRegistry.registerEntity({
  name: "Product",
  schema: productSchema,
  tenantRules: productTenantRules,
  businessLogic: productBusinessLogic,
  displayName: "Products",
  description: "Inventory products",
  icon: "package",
  color: "blue",
});
```

### Auto-Generated Features

Once registered, each entity automatically gets:

- ✅ **CRUD Service** - Complete database operations
- ✅ **REST API** - Full RESTful endpoints
- ✅ **Admin Forms** - Create/update forms
- ✅ **Data Tables** - List views with search and pagination
- ✅ **Validation** - Zod-based input validation
- ✅ **Tenant Isolation** - Multi-tenant data separation
- ✅ **Business Logic** - Custom hooks for operations

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL

### Installation

1. **Clone the repository**:

```bash
git clone <repository-url>
cd humanUI
```

2. **Install dependencies**:

```bash
pnpm install
```

3. **Set up the database**:

```bash
cd packages/db
pnpm prisma generate
pnpm prisma db push
```

4. **Start the development servers**:

```bash
pnpm dev
```

### Development

- **Admin Interface**: http://localhost:3000
- **API Server**: http://localhost:3001
- **Demo Page**: http://localhost:3000/demo

## 📊 Current Entities

| Entity            | Description                | Fields    | Business Logic |
| ----------------- | -------------------------- | --------- | -------------- |
| **Organization**  | Multi-tenant organizations | 8 fields  | ✓              |
| **Store**         | Physical and online stores | 10 fields | ✓              |
| **Category**      | Product categories         | 8 fields  | ✓              |
| **Item**          | Inventory items            | 15 fields | ✓              |
| **ItemAttribute** | Custom item attributes     | 12 fields | ✓              |
| **User**          | System users               | 12 fields | ✓              |

## 🔧 Configuration

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/humanui"

# API
API_PORT=3001
API_HOST=localhost

# Admin
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Tenant Configuration

```typescript
// packages/config/src/tenant.ts
export const tenantConfig = {
  isolation: "database", // 'database' | 'schema' | 'row'
  defaultTenant: "public",
  tenantHeader: "x-tenant-id",
};
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm --filter @humanui/entities test

# Run tests with coverage
pnpm test:coverage
```

## 📈 Performance

- **Zero-code entities** - 90% reduction in boilerplate
- **Auto-generated APIs** - Consistent REST endpoints
- **Type-safe operations** - Compile-time validation
- **Multi-tenant isolation** - Secure data separation
- **Optimized queries** - Efficient database operations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

- **Documentation**: See `/docs` folder
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions

---

**Built with ❤️ using Next.js, Prisma, and TypeScript**
