import { z } from 'zod';
import { organizationSchema } from './schema';

export const organizationTableColumns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'slug', label: 'Slug', sortable: true },
  { key: 'isActive', label: 'Active', sortable: true },
  { key: 'isPublic', label: 'Public', sortable: true },
  { key: 'email', label: 'Email', sortable: false },
  { key: 'phone', label: 'Phone', sortable: false },
  { key: 'createdAt', label: 'Created At', sortable: true },
  { key: 'updatedAt', label: 'Updated At', sortable: true },
];

export const organizationFormFields = [
  {
    key: 'name',
    label: 'Name',
    type: 'text',
    required: true,
    placeholder: 'Enter organization name',
  },
  {
    key: 'slug',
    label: 'Slug',
    type: 'text',
    required: true,
    placeholder: 'Enter organization slug',
  },
  {
    key: 'description',
    label: 'Description',
    type: 'textarea',
    required: false,
    placeholder: 'Enter description',
  },
  {
    key: 'logoUrl',
    label: 'Logo URL',
    type: 'url',
    required: false,
    placeholder: 'Enter logo URL',
  },
  {
    key: 'website',
    label: 'Website',
    type: 'url',
    required: false,
    placeholder: 'Enter website URL',
  },
  {
    key: 'email',
    label: 'Email',
    type: 'email',
    required: false,
    placeholder: 'Enter email address',
  },
  {
    key: 'phone',
    label: 'Phone',
    type: 'tel',
    required: false,
    placeholder: 'Enter phone number',
  },
  {
    key: 'address.street',
    label: 'Street Address',
    type: 'text',
    required: false,
    placeholder: 'Enter street address',
  },
  {
    key: 'address.city',
    label: 'City',
    type: 'text',
    required: false,
    placeholder: 'Enter city',
  },
  {
    key: 'address.state',
    label: 'State/Province',
    type: 'text',
    required: false,
    placeholder: 'Enter state or province',
  },
  {
    key: 'address.postalCode',
    label: 'Postal Code',
    type: 'text',
    required: false,
    placeholder: 'Enter postal code',
  },
  {
    key: 'address.country',
    label: 'Country',
    type: 'text',
    required: false,
    placeholder: 'Enter country',
  },
  {
    key: 'isActive',
    label: 'Active',
    type: 'checkbox',
    required: false,
    default: true,
  },
  {
    key: 'isPublic',
    label: 'Public',
    type: 'checkbox',
    required: false,
    default: false,
  },
];

export const organizationFormSchema = organizationSchema.omit({ id: true, createdAt: true, updatedAt: true });

export type OrganizationTableColumn = typeof organizationTableColumns[number];
export type OrganizationFormField = typeof organizationFormFields[number]; 