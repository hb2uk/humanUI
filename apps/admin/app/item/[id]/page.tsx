'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CreateOrUpdateEntityForm } from '@humanui/ui';
import { itemFormConfig } from '@humanui/entities';

// Mock data - replace with actual API calls
const mockItem = {
  id: '1',
  categoryType: 'Electronics',
  sku: 'ELEC-001',
  name: 'Sample Item 1',
  description: 'This is a sample item description',
  hasVariants: false,
  fulfillmentMethod: 'pickup',
  basePrice: 99.99,
  currency: 'THB',
  status: 'ACTIVE',
  priority: 'HIGH',
  tags: ['electronics', 'gadgets'],
  metadata: { color: 'black', weight: '500g' },
  organizationId: 'org-1',
  storeId: 'store-1',
  categoryId: 'cat-1',
  tenantId: 'tenant-1',
  createdBy: 'admin',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export default function EditItemPage() {
  const router = useRouter();
  const params = useParams();
  const itemId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(false);
  const [item, setItem] = useState<any>(null);
  const [isLoadingItem, setIsLoadingItem] = useState(true);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        // Mock API call - replace with actual API
        await new Promise(resolve => setTimeout(resolve, 500));
        setItem(mockItem);
      } catch (error) {
        console.error('Error fetching item:', error);
        // Handle error (show toast, redirect to 404, etc.)
      } finally {
        setIsLoadingItem(false);
      }
    };

    if (itemId) {
      fetchItem();
    }
  }, [itemId]);

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // Mock API call - replace with actual API
      console.log('Updating item:', { id: itemId, ...data });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to item list after successful update
      router.push('/item' as any);
    } catch (error) {
      console.error('Error updating item:', error);
      // Handle error (show toast, etc.)
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/item' as any);
  };

  if (isLoadingItem) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <p>Loading item...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <p>Item not found</p>
            <button
              onClick={() => router.push('/item' as any)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Back to Items
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <CreateOrUpdateEntityForm
          mode="edit"
          entityConfig={itemFormConfig}
          initialValues={item}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
} 