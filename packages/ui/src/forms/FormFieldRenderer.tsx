import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { cn } from '../lib/utils';
import { FormFieldRendererProps, FormField } from './types';

// Basic form components (these would be replaced with ShadCN components)
const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement> & { options?: { label: string; value: string | number }[] }>(
  ({ className, options = [], ...props }, ref) => {
    return (
      <select
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      >
        <option value="">Select an option</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }
);
Select.displayName = "Select";

const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => {
    return (
      <label
        className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Label.displayName = "Label";

const Checkbox = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        type="checkbox"
        className={cn(
          "h-4 w-4 rounded border border-input bg-background text-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Checkbox.displayName = "Checkbox";

export const FormFieldRenderer: React.FC<FormFieldRendererProps> = ({
  field,
  form,
  disabled = false,
  className,
}) => {
  const { control, formState: { errors } } = useFormContext();
  const error = errors[field.name];

  // Check if field should be hidden based on conditional logic
  const shouldHide = () => {
    if (!field.conditional) return false;
    
    const { field: conditionalField, value, operator = 'equals' } = field.conditional;
    const conditionalValue = form.getValues(conditionalField);
    
    switch (operator) {
      case 'equals':
        return conditionalValue !== value;
      case 'not_equals':
        return conditionalValue === value;
      case 'contains':
        return !conditionalValue?.includes?.(value);
      case 'greater_than':
        return conditionalValue <= value;
      case 'less_than':
        return conditionalValue >= value;
      default:
        return false;
    }
  };

  if (shouldHide()) return null;

  const renderField = () => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: { onChange, value, ref } }) => (
              <Input
                type={field.type}
                placeholder={field.placeholder}
                value={value || ''}
                onChange={onChange}
                ref={ref}
                disabled={disabled || field.disabled}
                {...field.fieldProps}
              />
            )}
          />
        );

      case 'number':
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: { onChange, value, ref } }) => (
              <Input
                type="number"
                placeholder={field.placeholder}
                value={value || ''}
                onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                ref={ref}
                disabled={disabled || field.disabled}
                {...field.fieldProps}
              />
            )}
          />
        );

      case 'textarea':
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: { onChange, value, ref } }) => (
              <Textarea
                placeholder={field.placeholder}
                value={value || ''}
                onChange={onChange}
                ref={ref}
                disabled={disabled || field.disabled}
                {...field.fieldProps}
              />
            )}
          />
        );

      case 'select':
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: { onChange, value, ref } }) => (
              <Select
                value={value || ''}
                onChange={onChange}
                ref={ref}
                disabled={disabled || field.disabled}
                options={field.options}
                {...field.fieldProps}
              />
            )}
          />
        );

      case 'checkbox':
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: { onChange, value, ref } }) => (
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={value || false}
                  onChange={(e) => onChange(e.target.checked)}
                  ref={ref}
                  disabled={disabled || field.disabled}
                  {...field.fieldProps}
                />
                <Label className="text-sm">{field.label}</Label>
              </div>
            )}
          />
        );

      case 'tags':
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: { onChange, value, ref } }) => (
              <div className="space-y-2">
                <Input
                  placeholder={field.placeholder || 'Add tags...'}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const input = e.target as HTMLInputElement;
                      const newTag = input.value.trim();
                      if (newTag) {
                        const currentTags = Array.isArray(value) ? value : [];
                        onChange([...currentTags, newTag]);
                        input.value = '';
                      }
                    }
                  }}
                  disabled={disabled || field.disabled}
                  {...field.fieldProps}
                />
                {Array.isArray(value) && value.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {value.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => {
                            const newTags = value.filter((_, i) => i !== index);
                            onChange(newTags);
                          }}
                          className="ml-1 text-primary/70 hover:text-primary"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          />
        );

      case 'json':
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: { onChange, value, ref } }) => (
              <Textarea
                placeholder={field.placeholder || 'Enter JSON...'}
                value={typeof value === 'object' ? JSON.stringify(value, null, 2) : value || ''}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    onChange(parsed);
                  } catch {
                    onChange(e.target.value);
                  }
                }}
                ref={ref}
                disabled={disabled || field.disabled}
                rows={6}
                {...field.fieldProps}
              />
            )}
          />
        );

      default:
        return (
          <Input
            placeholder={field.placeholder}
            disabled={disabled || field.disabled}
            {...field.fieldProps}
          />
        );
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {field.type !== 'checkbox' && (
        <Label htmlFor={field.name}>
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      {renderField()}
      {field.description && (
        <p className="text-sm text-muted-foreground">{field.description}</p>
      )}
      {error && (
        <p className="text-sm text-red-500">{error.message as string}</p>
      )}
    </div>
  );
}; 