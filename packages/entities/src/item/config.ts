import { ItemStatus, Priority } from '@humanui/db';
import { z } from 'zod';
import { itemSchema } from './schema';

export const itemTableColumns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'priority', label: 'Priority', sortable: true },
  { key: 'tags', label: 'Tags', sortable: false },
  { key: 'createdBy', label: 'Created By', sortable: true },
  { key: 'createdAt', label: 'Created At', sortable: true },
  { key: 'updatedAt', label: 'Updated At', sortable: true },
];

export const itemFormFields = [
  {
    key: 'name',
    label: 'Name',
    type: 'text',
    required: true,
    placeholder: 'Enter item name',
  },
  {
    key: 'description',
    label: 'Description',
    type: 'textarea',
    required: false,
    placeholder: 'Enter description',
  },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: Object.values(ItemStatus).map((v) => ({ label: v, value: v })),
    required: true,
    default: ItemStatus.DRAFT,
  },
  {
    key: 'priority',
    label: 'Priority',
    type: 'select',
    options: Object.values(Priority).map((v) => ({ label: v, value: v })),
    required: true,
    default: Priority.MEDIUM,
  },
  {
    key: 'tags',
    label: 'Tags',
    type: 'tags',
    required: false,
    placeholder: 'Add tags',
  },
  {
    key: 'metadata',
    label: 'Metadata',
    type: 'json',
    required: false,
    placeholder: 'Enter metadata as JSON',
  },
];

export const itemFormSchema = itemSchema.omit({ id: true, createdAt: true, updatedAt: true });

export type ItemTableColumn = typeof itemTableColumns[number];
export type ItemFormField = typeof itemFormFields[number]; 