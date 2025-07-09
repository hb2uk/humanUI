# HumanUI API Documentation

## Overview

The HumanUI API provides RESTful endpoints for managing items with multi-tenant support and internationalization. All endpoints follow JSON API conventions and include proper error handling.

## Base URL

```
http://localhost:3001
```

## Authentication & Headers

### Required Headers

- `X-Tenant-ID`: Tenant identifier (required for all endpoints)
- `X-User-ID`: User identifier (required for create/update operations)

### Optional Headers

- `Accept-Language`: Locale preference (e.g., `en-US`, `es-ES`, `fr-FR`)
- `X-Locale`: Alternative locale header

## Item Endpoints

### List Items

**GET** `/api/items`

Retrieve a paginated list of items with filtering and sorting options.

#### Query Parameters

| Parameter   | Type   | Description                      | Default     |
| ----------- | ------ | -------------------------------- | ----------- |
| `page`      | number | Page number                      | 1           |
| `limit`     | number | Items per page (1-100)           | 20          |
| `sortBy`    | string | Sort field                       | `createdAt` |
| `sortOrder` | string | Sort direction (`asc`/`desc`)    | `desc`      |
| `search`    | string | Search in name and description   | -           |
| `status`    | string | Filter by status                 | -           |
| `priority`  | string | Filter by priority               | -           |
| `tags`      | string | Filter by tags (comma-separated) | -           |

#### Example Request

```http
GET /api/items?page=1&limit=10&sortBy=name&sortOrder=asc&status=ACTIVE
X-Tenant-ID: tenant-1
Accept-Language: en-US
```

#### Example Response

```json
{
  "data": [
    {
      "id": "item-1",
      "name": "Sample Item",
      "description": "A sample item",
      "status": "ACTIVE",
      "priority": "MEDIUM",
      "tags": ["sample", "demo"],
      "metadata": {},
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  },
  "links": {
    "self": "http://localhost:3001/api/items?page=1&limit=10",
    "first": "http://localhost:3001/api/items?page=1&limit=10",
    "last": "http://localhost:3001/api/items?page=3&limit=10",
    "next": "http://localhost:3001/api/items?page=2&limit=10",
    "prev": null
  }
}
```

### Create Item

**POST** `/api/items`

Create a new item.

#### Request Body

```json
{
  "name": "New Item",
  "description": "Item description",
  "status": "ACTIVE",
  "priority": "MEDIUM",
  "tags": ["tag1", "tag2"],
  "metadata": {
    "category": "electronics",
    "price": 99.99
  }
}
```

#### Example Request

```http
POST /api/items
Content-Type: application/json
X-Tenant-ID: tenant-1
X-User-ID: user-1

{
  "name": "New Item",
  "description": "A new item",
  "status": "ACTIVE",
  "priority": "HIGH",
  "tags": ["new", "featured"]
}
```

#### Example Response

```json
{
  "data": {
    "id": "item-2",
    "name": "New Item",
    "description": "A new item",
    "status": "ACTIVE",
    "priority": "HIGH",
    "tags": ["new", "featured"],
    "metadata": {},
    "createdAt": "2024-01-15T11:00:00Z",
    "updatedAt": "2024-01-15T11:00:00Z"
  },
  "meta": {
    "created": true,
    "timestamp": "2024-01-15T11:00:00Z"
  },
  "links": {
    "self": "http://localhost:3001/api/items/item-2",
    "collection": "http://localhost:3001/api/items"
  }
}
```

### Get Item by ID

**GET** `/api/items/{id}`

Retrieve a specific item by ID.

#### Example Request

```http
GET /api/items/item-1
X-Tenant-ID: tenant-1
```

#### Example Response

```json
{
  "data": {
    "id": "item-1",
    "name": "Sample Item",
    "description": "A sample item",
    "status": "ACTIVE",
    "priority": "MEDIUM",
    "tags": ["sample", "demo"],
    "metadata": {},
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  "meta": {
    "retrieved": "2024-01-15T11:00:00Z",
    "tenant": "tenant-1"
  },
  "links": {
    "self": "http://localhost:3001/api/items/item-1",
    "collection": "http://localhost:3001/api/items"
  }
}
```

### Update Item

**PUT** `/api/items/{id}`

Update an existing item (full update).

#### Request Body

```json
{
  "name": "Updated Item",
  "description": "Updated description",
  "status": "ACTIVE",
  "priority": "HIGH",
  "tags": ["updated", "featured"],
  "metadata": {
    "category": "electronics",
    "price": 149.99
  }
}
```

#### Example Request

```http
PUT /api/items/item-1
Content-Type: application/json
X-Tenant-ID: tenant-1

{
  "name": "Updated Item",
  "description": "Updated description",
  "status": "ACTIVE",
  "priority": "HIGH"
}
```

### Patch Item

**PATCH** `/api/items/{id}`

Partially update an existing item.

#### Example Request

```http
PATCH /api/items/item-1
Content-Type: application/json
X-Tenant-ID: tenant-1

{
  "status": "ARCHIVED"
}
```

### Delete Item

**DELETE** `/api/items/{id}`

Soft delete an item (sets status to DELETED).

#### Example Request

```http
DELETE /api/items/item-1
X-Tenant-ID: tenant-1
```

### Hard Delete Item

**DELETE** `/api/items/{id}/hard`

Permanently delete an item from the database.

#### Example Request

```http
DELETE /api/items/item-1/hard
X-Tenant-ID: tenant-1
```

### Get Item Statistics

**GET** `/api/items/stats`

Retrieve statistics about items for the current tenant.

#### Example Request

```http
GET /api/items/stats
X-Tenant-ID: tenant-1
```

#### Example Response

```json
{
  "data": {
    "total": 25,
    "active": 20,
    "archived": 3,
    "deleted": 2,
    "byPriority": {
      "HIGH": 5,
      "MEDIUM": 15,
      "LOW": 5
    },
    "byStatus": {
      "ACTIVE": 20,
      "ARCHIVED": 3,
      "DELETED": 2
    }
  },
  "meta": {
    "generated": "2024-01-15T11:00:00Z",
    "tenant": "tenant-1"
  }
}
```

### Get Item Tags

**GET** `/api/items/tags`

Retrieve all unique tags used by items in the current tenant.

#### Example Request

```http
GET /api/items/tags
X-Tenant-ID: tenant-1
```

#### Example Response

```json
{
  "data": ["featured", "new", "demo", "sample", "updated"],
  "meta": {
    "count": 5,
    "tenant": "tenant-1"
  }
}
```

### Bulk Operations

**POST** `/api/items/bulk`

Perform bulk operations on multiple items.

#### Request Body

```json
{
  "ids": ["item-1", "item-2", "item-3"],
  "operation": "updateStatus",
  "data": {
    "status": "ARCHIVED"
  }
}
```

#### Supported Operations

- `delete`: Soft delete items
- `archive`: Set status to ARCHIVED
- `activate`: Set status to ACTIVE
- `updateStatus`: Update status field
- `updatePriority`: Update priority field

#### Example Request

```http
POST /api/items/bulk
Content-Type: application/json
X-Tenant-ID: tenant-1

{
  "ids": ["item-1", "item-2"],
  "operation": "archive"
}
```

#### Example Response

```json
{
  "data": {
    "affectedCount": 2
  },
  "meta": {
    "operation": "archive",
    "timestamp": "2024-01-15T11:00:00Z",
    "tenant": "tenant-1"
  }
}
```

## Error Responses

All endpoints return consistent error responses:

### Validation Error (400)

```json
{
  "error": "Validation Error",
  "code": "VALIDATION_ERROR",
  "message": "Invalid item data",
  "details": [
    {
      "path": ["name"],
      "message": "Name is required"
    }
  ]
}
```

### Not Found (404)

```json
{
  "error": "Not Found",
  "code": "ITEM_NOT_FOUND",
  "message": "Item not found"
}
```

### Tenant Required (400)

```json
{
  "error": "Tenant ID is required",
  "code": "TENANT_REQUIRED",
  "message": "Please provide a tenant ID via header, query parameter, or body"
}
```

### Internal Server Error (500)

```json
{
  "error": "Internal Server Error",
  "code": "INTERNAL_ERROR",
  "message": "Failed to fetch items"
}
```

## Data Models

### Item Status

- `ACTIVE`: Item is active and visible
- `ARCHIVED`: Item is archived but recoverable
- `DELETED`: Item is soft deleted

### Item Priority

- `HIGH`: High priority item
- `MEDIUM`: Medium priority item
- `LOW`: Low priority item

### Supported Locales

- `en-US`: English (United States)
- `en-GB`: English (United Kingdom)
- `es-ES`: Spanish (Spain)
- `fr-FR`: French (France)
- `de-DE`: German (Germany)
- `ja-JP`: Japanese (Japan)
- `zh-CN`: Chinese (China)

## Testing

Use the provided `test-api.http` file to test all endpoints with various scenarios including:

- Different tenants
- Various locales
- Error conditions
- Bulk operations
- Pagination and filtering

## Rate Limiting

Currently, no rate limiting is implemented. Consider adding rate limiting for production use.

## Security Considerations

- All endpoints require tenant authentication
- User ID is required for create/update operations
- Tenant isolation is enforced at the database level
- Input validation is performed using Zod schemas
