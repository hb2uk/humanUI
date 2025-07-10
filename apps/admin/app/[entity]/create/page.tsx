import { notFound } from 'next/navigation';
import { getEntityConfig, getEntityFormConfig } from '../../../lib/entity-registry';
import { EntityCreateForm } from './EntityCreateForm';

interface EntityCreatePageProps {
  params: Promise<{
    entity: string;
  }>;
}

export default async function EntityCreatePage({ params }: EntityCreatePageProps) {
  const { entity } = await params;
  const entityConfig = getEntityConfig(entity);
  const formConfig = getEntityFormConfig(entity);

  if (!entityConfig || !formConfig) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Create {entityConfig.displayName}
        </h1>
        <p className="text-gray-600 mt-2">
          Add a new {entityConfig.displayName.toLowerCase()} to the system
        </p>
      </div>

      <div className="max-w-2xl">
        <div className="bg-white p-6 rounded-lg shadow">
          <EntityCreateForm 
            entityConfig={entityConfig} 
            formConfig={formConfig} 
          />
        </div>
      </div>
    </div>
  );
}

// Generate static params for all entities
export async function generateStaticParams() {
  return [
    { entity: 'items' },
    { entity: 'categories' },
    { entity: 'stores' },
    { entity: 'organizations' },
    { entity: 'item-attributes' },
  ];
} 