import { useState, useEffect } from 'react';
import { adminEntityRegistry } from '../lib/entity-registry';

export function useEntity(entityName: string) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const fetchData = async (page = 1, limit = 20, search?: string) => {
    try {
      setLoading(true);
      setError(null);

      // For now, we'll simulate API calls
      // In a real implementation, this would call the actual API
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      });

      // Simulate API response
      const mockData = Array.from({ length: limit }, (_, i) => ({
        id: `item-${page}-${i}`,
        name: `Item ${page}-${i}`,
        description: `Description for item ${page}-${i}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      setData(mockData);
      setPagination({
        page,
        limit,
        total: 100, // Mock total
        totalPages: Math.ceil(100 / limit),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const createEntity = async (entityData: any) => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API call
      const newEntity = {
        id: `new-${Date.now()}`,
        ...entityData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setData(prev => [newEntity, ...prev]);
      return newEntity;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create entity');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateEntity = async (id: string, entityData: any) => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API call
      const updatedEntity = {
        ...entityData,
        id,
        updatedAt: new Date().toISOString(),
      };

      setData(prev => prev.map(item => item.id === id ? updatedEntity : item));
      return updatedEntity;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update entity');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteEntity = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API call
      setData(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete entity');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getEntity = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API call
      const entity = data.find(item => item.id === id);
      if (!entity) {
        throw new Error('Entity not found');
      }

      return entity;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch entity');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [entityName]);

  return {
    data,
    loading,
    error,
    pagination,
    fetchData,
    createEntity,
    updateEntity,
    deleteEntity,
    getEntity,
  };
} 