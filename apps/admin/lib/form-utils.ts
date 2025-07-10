import { z } from 'zod';

/**
 * Extract default values from a Zod schema
 */
export function getDefaultValuesFromSchema<T extends z.ZodSchema>(
  schema: T,
  initialValues?: Partial<z.infer<T>>
): Partial<z.infer<T>> {
  // For now, return initial values or empty object
  // In a real implementation, you would parse the schema to extract defaults
  return { ...initialValues };
}

/**
 * Validate form data against a schema
 */
export function validateFormData<T extends z.ZodSchema>(
  schema: T,
  data: any
): { success: true; data: z.infer<T> } | { success: false; errors: z.ZodError } {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(errors: z.ZodError): Record<string, string> {
  const formattedErrors: Record<string, string> = {};
  
  errors.errors.forEach(error => {
    const fieldName = error.path.join('.');
    formattedErrors[fieldName] = error.message;
  });
  
  return formattedErrors;
}

/**
 * Create a simple field configuration
 */
export function createFieldConfig(
  fieldName: string,
  options?: {
    label?: string;
    placeholder?: string;
    description?: string;
    type?: string;
    required?: boolean;
  }
) {
  return {
    name: fieldName,
    label: options?.label || fieldName.replace(/([A-Z])/g, ' $1').trim(),
    type: options?.type || 'text',
    required: options?.required || false,
    placeholder: options?.placeholder,
    description: options?.description,
  };
} 