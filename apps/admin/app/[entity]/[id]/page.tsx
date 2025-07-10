import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@humanui/ui';
import { getEntityConfig } from '../../../lib/entity-registry';

interface EntityDetailPageProps {
  params: Promise<{
    entity: string;
    id: string;
  }>;
}

export default async function EntityDetailPage({ params }: EntityDetailPageProps) {
  const { entity, id } = await params;
  const entityConfig = getEntityConfig(entity);

  if (!entityConfig) {
    notFound();
  }

  // TODO: Fetch entity data using entityConfig.service
  const entityData = {
    id,
    // Mock data - would be fetched from API
    name: 'Sample Item',
    description: 'This is a sample item',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const getDetailFields = () => {
    // Return basic fields for now - this would be configurable
    return ['id', 'name', 'description', 'createdAt', 'updatedAt'];
  };

  const renderFieldValue = (fieldName: string) => {
    const value = entityData[fieldName as keyof typeof entityData];
    
    if (value === null || value === undefined) {
      return <span className="text-gray-400">-</span>;
    }
    
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    
    return String(value);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {entityConfig.displayName} Details
            </h1>
            <p className="text-gray-600 mt-2">
              View detailed information about this {entityConfig.displayName.toLowerCase()}
            </p>
          </div>
          <div className="flex space-x-2">
            <Link href={'/' + entity + '/' + id + '/edit'}>
              <Button variant="outline">
                Edit
              </Button>
            </Link>
            <Link href={'/' + entity}>
              <Button variant="outline">
                Back to List
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {entityData.name || `ID: ${id}`}
          </h2>
        </div>
        
        <div className="px-6 py-4">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            {getDetailFields().map((field) => (
              <div key={field}>
                <dt className="text-sm font-medium text-gray-500 capitalize">
                  {field.replace(/([A-Z])/g, ' $1').trim()}
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {renderFieldValue(field)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Additional sections based on entity config */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-sm text-gray-500">Total Records</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">0</div>
            <div className="text-sm text-gray-500">Active</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-yellow-600">0</div>
            <div className="text-sm text-gray-500">Pending</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Generate static params for all entities
export async function generateStaticParams() {
  return [
    { entity: 'items', id: '1' },
    { entity: 'categories', id: '1' },
    { entity: 'stores', id: '1' },
    { entity: 'organizations', id: '1' },
    { entity: 'item-attributes', id: '1' },
  ];
} 