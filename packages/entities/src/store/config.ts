import { z } from 'zod';
import { storeSchema } from './schema';

export const storeTableColumns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'displayName', label: 'Display Name', sortable: true },
  { key: 'isActive', label: 'Active', sortable: true },
  { key: 'storeType', label: 'Type', sortable: true },
  { key: 'address', label: 'Address', sortable: false },
  { key: 'phone', label: 'Phone', sortable: false },
  { key: 'email', label: 'Email', sortable: false },
  { key: 'createdAt', label: 'Created At', sortable: true },
  { key: 'updatedAt', label: 'Updated At', sortable: true },
];

export const storeFormFields = [
  {
    key: 'name',
    label: 'Name',
    type: 'text',
    required: true,
    placeholder: 'Enter store name',
  },
  {
    key: 'displayName',
    label: 'Display Name',
    type: 'text',
    required: false,
    placeholder: 'Enter display name',
  },
  {
    key: 'description',
    label: 'Description',
    type: 'textarea',
    required: false,
    placeholder: 'Enter description',
  },
  {
    key: 'address.street',
    label: 'Street Address',
    type: 'text',
    required: true,
    placeholder: 'Enter street address',
  },
  {
    key: 'address.city',
    label: 'City',
    type: 'text',
    required: true,
    placeholder: 'Enter city',
  },
  {
    key: 'address.state',
    label: 'State/Province',
    type: 'text',
    required: true,
    placeholder: 'Enter state or province',
  },
  {
    key: 'address.postalCode',
    label: 'Postal Code',
    type: 'text',
    required: true,
    placeholder: 'Enter postal code',
  },
  {
    key: 'address.country',
    label: 'Country',
    type: 'text',
    required: true,
    placeholder: 'Enter country',
  },
  {
    key: 'phone',
    label: 'Phone',
    type: 'tel',
    required: false,
    placeholder: 'Enter phone number',
  },
  {
    key: 'email',
    label: 'Email',
    type: 'email',
    required: false,
    placeholder: 'Enter email address',
  },
  {
    key: 'timezone',
    label: 'Timezone',
    type: 'select',
    required: false,
    placeholder: 'Select timezone',
    options: [
      { label: 'UTC', value: 'UTC' },
      { label: 'America/New_York', value: 'America/New_York' },
      { label: 'America/Chicago', value: 'America/Chicago' },
      { label: 'America/Denver', value: 'America/Denver' },
      { label: 'America/Los_Angeles', value: 'America/Los_Angeles' },
      { label: 'Europe/London', value: 'Europe/London' },
      { label: 'Europe/Paris', value: 'Europe/Paris' },
      { label: 'Asia/Tokyo', value: 'Asia/Tokyo' },
      { label: 'Asia/Shanghai', value: 'Asia/Shanghai' },
    ],
  },
  {
    key: 'isActive',
    label: 'Active',
    type: 'checkbox',
    required: false,
    default: true,
  },
  {
    key: 'storeType',
    label: 'Store Type',
    type: 'select',
    required: false,
    placeholder: 'Select store type',
    options: [
      { label: 'Retail', value: 'RETAIL' },
      { label: 'Online', value: 'ONLINE' },
      { label: 'Hybrid', value: 'HYBRID' },
      { label: 'Wholesale', value: 'WHOLESALE' },
      { label: 'Pop-up', value: 'POPUP' },
      { label: 'Marketplace', value: 'MARKETPLACE' },
    ],
  },
  {
    key: 'organizationId',
    label: 'Organization',
    type: 'select',
    required: true,
    placeholder: 'Select organization',
    options: [], // Will be populated dynamically
  },
];

export const storeFormSchema = storeSchema.omit({ id: true, createdAt: true, updatedAt: true });

export type StoreTableColumn = typeof storeTableColumns[number];
export type StoreFormField = typeof storeFormFields[number]; 