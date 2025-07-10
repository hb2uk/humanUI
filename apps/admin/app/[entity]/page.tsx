import { adminEntityRegistry } from '../../lib/entity-registry';
import { EntityTable } from '../../components/EntityTable';

interface EntityListPageProps {
  params: Promise<{
    entity: string;
  }>;
}

export default async function EntityListPage({ params }: EntityListPageProps) {
  const { entity } = await params;
  const entityConfig = adminEntityRegistry.getEntity(entity);

  if (!entityConfig) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Entity Not Found</h1>
          <p className="text-gray-600">The requested entity "{entity}" does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {entityConfig.displayName}
              </h1>
              {entityConfig.description && (
                <p className="text-gray-600 mt-2">{entityConfig.description}</p>
              )}
            </div>
            <a
              href={`/${entity}/create`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create New
            </a>
          </div>

          <EntityTable entityName={entity} />
        </div>
      </div>
    </div>
  );
}

// Generate static params for all entities
export async function generateStaticParams() {
  // This would be generated from the entity registry
  return [
    { entity: 'items' },
    { entity: 'categories' },
    { entity: 'stores' },
    { entity: 'organizations' },
    { entity: 'item-attributes' },
  ];
} 