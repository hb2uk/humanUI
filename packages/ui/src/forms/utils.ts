import { z } from 'zod';

/**
 * Extract default values from a Zod schema
 */
export const getDefaultValuesFromSchema = <T,>(schema: z.ZodSchema<T>, initialValues?: Partial<T>): Partial<T> => {
  const defaults: any = {};
  
  // Extract default values from schema
  if (schema._def && schema._def.shape) {
    Object.keys(schema._def.shape).forEach(key => {
      const field = schema._def.shape[key];
      if (field._def && field._def.defaultValue) {
        defaults[key] = field._def.defaultValue();
      }
    });
  }
  
  // Merge with initial values
  return { ...defaults, ...initialValues };
};

/**
 * Convert a Zod schema to a form field configuration
 */
export const schemaToFormFields = (schema: z.ZodSchema<any>): any[] => {
  const fields: any[] = [];
  
  if (schema._def && schema._def.shape) {
    Object.keys(schema._def.shape).forEach(key => {
      const field = schema._def.shape[key];
      const fieldType = getFieldTypeFromZod(field);
      
      fields.push({
        name: key,
        label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
        type: fieldType,
        required: !field._def.isOptional,
      });
    });
  }
  
  return fields;
};

/**
 * Determine field type from Zod schema
 */
const getFieldTypeFromZod = (field: any): string => {
  if (field._def.typeName === 'ZodString') {
    return 'text';
  } else if (field._def.typeName === 'ZodNumber') {
    return 'number';
  } else if (field._def.typeName === 'ZodBoolean') {
    return 'checkbox';
  } else if (field._def.typeName === 'ZodArray') {
    return 'tags';
  } else if (field._def.typeName === 'ZodObject') {
    return 'json';
  }
  
  return 'text';
};

/**
 * Validate form data against schema
 */
export const validateFormData = <T,>(schema: z.ZodSchema<T>, data: any): { success: true; data: T } | { success: false; errors: z.ZodError } => {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
};

/**
 * Format validation errors for display
 */
export const formatValidationErrors = (errors: z.ZodError): Record<string, string> => {
  const formatted: Record<string, string> = {};
  
  errors.errors.forEach(error => {
    const path = error.path.join('.');
    formatted[path] = error.message;
  });
  
  return formatted;
}; 