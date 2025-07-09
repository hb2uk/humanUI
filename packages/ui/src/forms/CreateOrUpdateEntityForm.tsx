import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '../lib/utils';
import { FormFieldRenderer } from './FormFieldRenderer';
import { CreateOrUpdateEntityFormProps, EntityFormConfig } from './types';

// Basic button component (would be replaced with ShadCN Button)
const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'outline' | 'secondary' }>(
  ({ className, variant = 'default', ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
    
    const variantClasses = {
      default: "bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2",
      outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2",
    };

    return (
      <button
        className={cn(baseClasses, variantClasses[variant], className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

// Utility function to get default values from schema
const getDefaultValuesFromSchema = <T,>(schema: any, initialValues?: Partial<T>): Partial<T> => {
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

export const CreateOrUpdateEntityForm = <T extends Record<string, any>>({
  mode,
  entityConfig,
  initialValues,
  onSubmit,
  onCancel,
  isLoading = false,
  className,
}: CreateOrUpdateEntityFormProps<T>) => {
  const defaultValues = getDefaultValuesFromSchema(entityConfig.schema, initialValues);
  
  const form = useForm<T>({
    resolver: zodResolver(entityConfig.schema),
    defaultValues,
    mode: 'onChange',
  });

  const handleSubmit = async (data: T) => {
    try {
      await onSubmit(data);
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