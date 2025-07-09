'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreateOrUpdateEntityForm } from '@humanui/ui';
import { itemFormConfig } from '@humanui/entities';

export default function CreateItemPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // Mock API call - replace with actual API
      console.log('Creating item:', data);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to item list after successful creation
      router.push('/item' as any);
    } catch (error) {
      console.error('Error creating item:', error);
      // Handle error (show toast, etc.)
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/item' as any);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <CreateOrUpdateEntityForm
          mode="create"
          entityConfig={itemFormConfig}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
} 