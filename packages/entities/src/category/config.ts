import { z } from 'zod';
import { categorySchema } from './schema';

export const categoryTableColumns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'slug', label: 'Slug', sortable: true },
  { key: 'isActive', label: 'Active', sortable: true },
  { key: 'isPublished', label: 'Published', sortable: true },
  { key: 'sortOrder', label: 'Sort Order', sortable: true },
  { key: 'parentId', label: 'Parent', sortable: true },
  { key: 'createdAt', label: 'Created At', sortable: true },
  { key: 'updatedAt', label: 'Updated At', sortable: true },
];

export const categoryFormFields = [
  {
    key: 'name',
    label: 'Name',
    type: 'text',
    required: true,
    placeholder: 'Enter category name',
  },
  {
    key: 'slug',
    label: 'Slug',
    type: 'text',
    required: true,
    placeholder: 'Enter category slug',
  },
  {
    key: 'description',
    label: 'Description',
    type: 'textarea',
    required: false,
    placeholder: 'Enter description',
  },
  {
    key: 'imageUrl',
    label: 'Image URL',
    type: 'url',
    required: false,
    placeholder: 'Enter image URL',
  },
  {
    key: 'isActive',
    label: 'Active',
    type: 'checkbox',
    required: false,
    default: true,
  },
  {
    key: 'isPublished',
    label: 'Published',
    type: 'checkbox',
    required: false,
    default: false,
  },
  {
    key: 'parentId',
    label: 'Parent Category',
    type: 'select',
    required: false,
    placeholder: 'Select parent category',
    options: [], // Will be populated dynamically
  },
  {
    key: 'sortOrder',
    label: 'Sort Order',
    type: 'number',
    required: false,
    default: 0,
    min: 0,
  },
  {
    key: 'organizationId',
    label: 'Organization',
    type: 'select',
    required: true,
    placeholder: 'Select organization',
    options: [], // Will be populated dynamically
  },
  {
    key: 'storeId',
    label: 'Store',
    type: 'select',
    required: true,
    placeholder: 'Select store',
    options: [], // Will be populated dynamically
  },
];

export const categoryFormSchema = categorySchema.omit({ id: true, createdAt: true, updatedAt: true });

export type CategoryTableColumn = typeof categoryTableColumns[number];
export type CategoryFormField = typeof categoryFormFields[number]; 