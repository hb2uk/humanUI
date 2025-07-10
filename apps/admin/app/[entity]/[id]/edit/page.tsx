import { notFound } from 'next/navigation';
import { getEntityConfig, getEntityFormConfig } from '../../../../lib/entity-registry';
import { EntityEditForm } from './EntityEditForm';

interface EntityEditPageProps {
  params: Promise<{
    entity: string;
    id: string;
  }>;
}

export default async function EntityEditPage({ params }: EntityEditPageProps) {
  const { entity, id } = await params;
  const entityConfig = getEntityConfig(entity);
  const formConfig = getEntityFormConfig(entity);

  if (!entityConfig || !formConfig) {
    notFound();
  }

  // TODO: Fetch existing data using entityConfig.service
  const initialValues = {
    // This would be fetched from the API
    id,
    // ... other fields
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Edit {entityConfig.displayName}
        </h1>
        <p className="text-gray-600 mt-2">
          Update the {entityConfig.displayName.toLowerCase()} information
        </p>
      </div>

      <div className="max-w-2xl">
        <div className="bg-white p-6 rounded-lg shadow">
          <EntityEditForm 
            entityConfig={entityConfig} 
            formConfig={formConfig}
            id={id}
          />
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