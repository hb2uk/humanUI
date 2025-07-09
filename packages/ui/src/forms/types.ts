import { z } from 'zod';

export type FieldType = 
  | 'text' 
  | 'textarea' 
  | 'number' 
  | 'email' 
  | 'password' 
  | 'select' 
  | 'multiselect' 
  | 'checkbox' 
  | 'radio' 
  | 'date' 
  | 'datetime' 
  | 'tags' 
  | 'json' 
  | 'file';

export interface FormFieldOption {
  label: string;
  value: string | number | boolean;
  disabled?: boolean;
}

export interface FormField {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  hidden?: boolean;
  defaultValue?: any;
  options?: FormFieldOption[];
  validation?: z.ZodTypeAny;
  dependencies?: string[]; // Fields this field depends on
  conditional?: {
    field: string;
    value: any;
    operator?: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  };
  fieldProps?: Record<string, any>; // Additional props for the field component
}

export interface EntityFormConfig<T = any> {
  schema: z.ZodSchema<T>;
  fields: FormField[];
  title?: string;
  description?: string;
  submitLabel?: string;
  cancelLabel?: string;
  layout?: 'single' | 'two-column' | 'three-column';
  sections?: {
    title: string;
    fields: string[];
    collapsible?: boolean;
    defaultExpanded?: boolean;
  }[];
}

export interface CreateOrUpdateEntityFormProps<T = any> {
  mode: 'create' | 'edit';
  entityConfig: EntityFormConfig<T>;
  initialValues?: Partial<T>;
  onSubmit: (data: T) => Promise<void> | void;
  onCancel?: () => void;
  isLoading?: boolean;
  className?: string;
}

export interface FormFieldRendererProps {
  field: FormField;
  form: any; // react-hook-form form instance
  disabled?: boolean;
  className?: string;
}

// Utility type to extract the form data type from a schema
export type FormDataFromSchema<T extends z.ZodSchema> = z.infer<T>;

// Utility type to get default values from a schema
export type DefaultValuesFromSchema<T extends z.ZodSchema> = Partial<z.infer<T>>; 