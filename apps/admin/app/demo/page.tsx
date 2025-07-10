'use client';

import { useState, useEffect } from 'react';
import { 
  getEntityStats, 
  getAdminRoutes, 
  getAPIEndpoints,
  entityRegistry 
} from '@humanui/entities';

export default function DemoSchemaBuilder() {
  const [stats, setStats] = useState<any>(null);
  const [adminRoutes, setAdminRoutes] = useState<any[]>([]);
  const [apiEndpoints, setApiEndpoints] = useState<any[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);

  useEffect(() => {
    setStats(getEntityStats());
    setAdminRoutes(getAdminRoutes());
    setApiEndpoints(getAPIEndpoints());
  }, []);

  const getEntityDetails = (entityName: string) => {
    return entityRegistry.getEntity(entityName);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            SchemaBuilder Demo
          </h1>
          <p className="text-lg text-gray-600">
            Zero-code entity creation with auto-generated services, schemas, and API routes
          </p>
        </div>

        {/* Entity Statistics */}
        {stats && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Entity Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-blue-900">Total Entities</h3>
                <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-green-900">With Business Logic</h3>
                <p className="text-3xl font-bold text-green-600">
                  {stats.entities.filter((e: any) => e.hasBusinessLogic).length}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-purple-900">Average Fields</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {Math.round(stats.entities.reduce((acc: number, e: any) => 
                    acc + e.requiredFields.length + e.optionalFields.length, 0) / stats.total)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Entity List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Admin Routes */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold mb-4">Registered Entities</h2>
            <div className="space-y-3">
              {adminRoutes.map((entity) => (
                <div
                  key={entity.name}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedEntity === entity.name
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedEntity(entity.name)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{entity.displayName}</h3>
                      <p className="text-sm text-gray-600">{entity.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {entity.icon && (
                        <span className="text-lg">{entity.icon}</span>
                      )}
                      {entity.color && (
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: entity.color }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Entity Details */}
          {selectedEntity && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-semibold mb-4">Entity Details</h2>
              {(() => {
                const entity = getEntityDetails(selectedEntity);
                if (!entity) return <p>Entity not found</p>;

                return (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-900">Configuration</h3>
                      <div className="mt-2 space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Name:</span> {entity.name}
                        </div>
                        <div>
                          <span className="font-medium">Display Name:</span> {entity.displayName}
                        </div>
                        <div>
                          <span className="font-medium">Description:</span> {entity.description}
                        </div>
                        <div>
                          <span className="font-medium">Icon:</span> {entity.icon}
                        </div>
                        <div>
                          <span className="font-medium">Color:</span> {entity.color}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900">Tenant Rules</h3>
                      <div className="mt-2 space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Required Fields:</span>{' '}
                          {entity.tenantRules.requiredFields?.join(', ') || 'None'}
                        </div>
                        <div>
                          <span className="font-medium">Optional Fields:</span>{' '}
                          {entity.tenantRules.optionalFields?.join(', ') || 'None'}
                        </div>
                        <div>
                          <span className="font-medium">Unique Constraints:</span>{' '}
                          {entity.tenantRules.uniqueConstraints?.join(', ') || 'None'}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900">Business Logic</h3>
                      <div className="mt-2 space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Before Create:</span>{' '}
                          {entity.businessLogic?.beforeCreate ? '✓' : '✗'}
                        </div>
                        <div>
                          <span className="font-medium">Before Update:</span>{' '}
                          {entity.businessLogic?.beforeUpdate ? '✓' : '✗'}
                        </div>
                        <div>
                          <span className="font-medium">Before Delete:</span>{' '}
                          {entity.businessLogic?.beforeDelete ? '✓' : '✗'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* API Endpoints */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">Auto-Generated API Endpoints</h2>
          <div className="space-y-4">
            {apiEndpoints.map((endpoint) => (
              <div key={endpoint.entity} className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">{endpoint.entity}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Routes</h4>
                    <div className="space-y-1 text-sm">
                      {Object.entries(endpoint.routes).map(([method, route]) => (
                        <div key={method} className="flex items-center space-x-2">
                          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                            {method}
                          </span>
                          <span className="text-gray-600">{route as string}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Schemas</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs bg-blue-100 px-2 py-1 rounded">
                          Create
                        </span>
                        <span className="text-gray-600">Auto-generated</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs bg-green-100 px-2 py-1 rounded">
                          Update
                        </span>
                        <span className="text-gray-600">Auto-generated</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs bg-purple-100 px-2 py-1 rounded">
                          Query
                        </span>
                        <span className="text-gray-600">Auto-generated</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">SchemaBuilder Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Zero-Code Entities</h3>
              <p className="text-sm text-gray-600">
                Define entities with schemas, tenant rules, and business logic. Auto-generate everything else.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Multi-Tenant Support</h3>
              <p className="text-sm text-gray-600">
                Built-in tenant isolation with configurable rules and validation.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Business Logic Hooks</h3>
              <p className="text-sm text-gray-600">
                Before/after hooks for create, update, and delete operations.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Auto-Generated Services</h3>
              <p className="text-sm text-gray-600">
                Complete CRUD services with pagination, search, and filtering.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Schema Validation</h3>
              <p className="text-sm text-gray-600">
                Zod-based validation with proper nullable field handling.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Admin Interface</h3>
              <p className="text-sm text-gray-600">
                Auto-generated forms and tables for entity management.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 