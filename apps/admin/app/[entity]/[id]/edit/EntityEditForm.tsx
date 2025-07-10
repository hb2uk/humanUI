'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { CreateOrUpdateEntityForm } from '@humanui/ui';
import { useEntity } from '../../../../hooks/useEntity';
import { EntityConfig } from '../../../../lib/entity-registry';
import { EntityFormConfig } from '@humanui/ui';

interface EntityEditFormProps {
  entityConfig: EntityConfig;
  formConfig: EntityFormConfig;
  id: string;
}

export function EntityEditForm({ entityConfig, formConfig, id }: EntityEditFormProps) {
  const router = useRouter();
  
  const { getEntity, updateEntity, loading } = useEntity(entityConfig.name);

  const [initialValues, setInitialValues] = React.useState<any>(null);
  const [isLoadingData, setIsLoadingData] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getEntity(id);
        setInitialValues(data);
      } catch (error) {
        console.error('Failed to fetch entity:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [id, getEntity]);

  const handleSubmit = async (data: any) => {
    try {
      await updateEntity(id, data);
      router.push(`/${entityConfig.name}`);
    } catch (error) {
      console.error('Failed to update entity:', error);
    }
  };

  const handleCancel = () => {
    router.push(`/${entityConfig.name}`);
  };

  if (isLoadingData) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <CreateOrUpdateEntityForm
      mode="edit"
      entityConfig={formConfig}
      initialValues={initialValues}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLoading={loading}
    />
  );
} 