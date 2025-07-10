import React from 'react';
import { useForm, FormProvider, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '../lib/utils';
import { Button } from '../components/button';
import { FormFieldRenderer } from './FormFieldRenderer';
import { CreateOrUpdateEntityFormProps, EntityFormConfig } from './types';

// Utility function to get default values from schema
const getDefaultValuesFromSchema = <T,>(schema: any, initialValues?: Partial<T>): Partial<T> => {
  const defaults: any = {};
  
  if (!schema) {
    console.warn('Schema is undefined in getDefaultValuesFromSchema');
    return { ...defaults, ...initialValues };
  }
  
  // Handle serialized schema format
  if (schema.fields && Array.isArray(schema.fields)) {
    schema.fields.forEach((field: any) => {
      if (field.defaultValue !== undefined) {
        defaults[field.name] = field.defaultValue;
      }
    });
  } else {
    // Handle Zod schema format (fallback)
    const shape = (schema as any).shape || (schema as any)._def?.shape;
    if (shape) {
      Object.keys(shape).forEach(key => {
        const field = shape[key];
        if (field._def && field._def.defaultValue) {
          defaults[key] = field._def.defaultValue();
        }
      });
    }
  }
  
  return { ...defaults, ...initialValues };
};

export const CreateOrUpdateEntityForm = <T extends Record<string, any>>({
  mode,
  entityConfig,
  initialValues,
  onSubmit,
  onCancel,
  isLoading = false,
  className,
}: CreateOrUpdateEntityFormProps<T>) => {
  console.log('CreateOrUpdateEntityForm entityConfig:', entityConfig);
  
  if (!entityConfig.schema) {
    console.error('Schema is undefined in entityConfig:', entityConfig);
    return <div>Error: Form configuration is invalid</div>;
  }
  
  const defaultValues = getDefaultValuesFromSchema(entityConfig.schema, initialValues);
  
  const form = useForm<T>({
    // Remove Zod resolver for now since we're using serialized schema
    // resolver: zodResolver(entityConfig.schema as z.ZodSchema<T>),
    defaultValues: defaultValues as any,
    mode: 'onChange',
  });

  const handleSubmit = async (data: any) => {
    try {
      await onSubmit(data as T);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const renderFields = () => {
    if (entityConfig.sections) {
      return entityConfig.sections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="space-y-4">
          <div className="border-b pb-2">
            <h3 className="text-lg font-medium">{section.title}</h3>
          </div>
          <div className="grid gap-4">
            {section.fields.map((fieldName) => {
              const field = entityConfig.fields.find(f => f.name === fieldName);
              if (!field) return null;
              
              return (
                <FormFieldRenderer
                  key={field.name}
                  field={field}
                  form={form}
                  disabled={isLoading}
                />
              );
            })}
          </div>
        </div>
      ));
    }

    // Default single column layout
    const layoutClass = entityConfig.layout === 'two-column' 
      ? 'grid grid-cols-1 md:grid-cols-2 gap-4'
      : entityConfig.layout === 'three-column'
      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
      : 'space-y-4';

    return (
      <div className={layoutClass}>
        {entityConfig.fields.map((field) => (
          <FormFieldRenderer
            key={field.name}
            field={field}
            form={form}
            disabled={isLoading}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={cn("space-y-6", className)}>
      {(entityConfig.title || entityConfig.description) && (
        <div className="space-y-2">
          {entityConfig.title && (
            <h2 className="text-2xl font-bold tracking-tight">
              {mode === 'create' ? `Create ${entityConfig.title}` : `Edit ${entityConfig.title}`}
            </h2>
          )}
          {entityConfig.description && (
            <p className="text-muted-foreground">{entityConfig.description}</p>
          )}
        </div>
      )}

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {renderFields()}
          
          <div className="flex items-center justify-end space-x-2 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                {entityConfig.cancelLabel || 'Cancel'}
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading || !form.formState.isValid}
            >
              {isLoading ? 'Saving...' : entityConfig.submitLabel || (mode === 'create' ? 'Create' : 'Update')}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}; 