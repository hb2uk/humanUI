import { Request, Response, NextFunction } from 'express';

export interface TenantRequest extends Request {
  tenantId?: string;
  tenant?: {
    id: string;
    name?: string;
    settings?: Record<string, any>;
  };
}

export interface TenantContext {
  tenantId: string;
  tenant?: {
    id: string;
    name?: string;
    settings?: Record<string, any>;
  };
}

/**
 * Middleware to extract and validate tenant information
 */
export function withTenant() {
  return (req: TenantRequest, res: Response, next: NextFunction) => {
    // Extract tenant ID from various sources (in order of preference)
    const tenantId = 
      req.headers['x-tenant-id'] as string ||
      req.headers['tenant-id'] as string ||
      req.query.tenantId as string ||
      req.body?.tenantId ||
      process.env.DEFAULT_TENANT_ID;

    if (!tenantId) {
      return res.status(400).json({
        error: 'Tenant ID is required',
        code: 'TENANT_REQUIRED',
        message: 'Please provide a tenant ID via header, query parameter, or body'
      });
    }

    // Validate tenant ID format (basic validation)
    if (typeof tenantId !== 'string' || tenantId.length < 1) {
      return res.status(400).json({
        error: 'Invalid tenant ID format',
        code: 'INVALID_TENANT_ID',
        message: 'Tenant ID must be a non-empty string'
      });
    }

    // Attach tenant information to request
    req.tenantId = tenantId;
    req.tenant = {
      id: tenantId,
      // In a real app, you might fetch tenant details from database here
      name: `Tenant ${tenantId}`,
      settings: {}
    };

    next();
  };
}

/**
 * Optional tenant middleware (doesn't require tenant ID)
 */
export function withOptionalTenant() {
  return (req: TenantRequest, res: Response, next: NextFunction) => {
    const tenantId = 
      req.headers['x-tenant-id'] as string ||
      req.headers['tenant-id'] as string ||
      req.query.tenantId as string ||
      req.body?.tenantId ||
      process.env.DEFAULT_TENANT_ID;

    if (tenantId) {
      req.tenantId = tenantId;
      req.tenant = {
        id: tenantId,
        name: `Tenant ${tenantId}`,
        settings: {}
      };
    }

    next();
  };
}

/**
 * Get tenant context from request
 */
export function getTenantContext(req: TenantRequest): TenantContext | null {
  if (!req.tenantId) return null;
  
  return {
    tenantId: req.tenantId,
    tenant: req.tenant
  };
} 