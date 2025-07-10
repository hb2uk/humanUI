'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { CreateOrUpdateEntityForm } from '@humanui/ui';
import { useEntity } from '../../../hooks/useEntity';
import { EntityConfig } from '../../../lib/entity-registry';
import { EntityFormConfig } from '@humanui/ui';

interface EntityCreateFormProps {
  entityConfig: EntityConfig;
  formConfig: EntityFormConfig;
}

export function EntityCreateForm({ entityConfig, formConfig }: EntityCreateFormProps) {
  const router = useRouter();
  
  const { createEntity, loading } = useEntity(entityConfig.name);

  const handleSubmit = async (data: any) => {
    try {
      await createEntity(data);
      router.push(`/${entityConfig.name}`);
    } catch (error) {
      console.error('Failed to create entity:', error);
    }
  };

  const handleCancel = () => {
    router.push(`/${entityConfig.name}`);
  };

  return (
    <CreateOrUpdateEntityForm
      mode="create"
      entityConfig={formConfig}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLoading={loading}
    />
  );
} 