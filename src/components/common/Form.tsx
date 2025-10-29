import { FormEvent } from 'react';

export interface FormField {
  name: string;
  label: string;
  type?: 'text' | 'url' | 'email' | 'password' | 'number';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  hint?: string;
}

interface FormProps {
  formId?: string;
  fields: FormField[];
  values: Record<string, string>;
  onChange: (values: Record<string, string>) => void;
  onSubmit: (e: FormEvent) => void;
  error?: string;
  loading?: boolean;
}

export default function Form({
  formId = 'form',
  fields,
  values,
  onChange,
  onSubmit,
  error,
  loading = false
}: FormProps) {
  const handleFieldChange = (name: string, value: string) => {
    onChange({ ...values, [name]: value });
  };

  return (
    <form id={formId} onSubmit={onSubmit} className="space-y-4">
      {fields.map((field) => (
        <div key={field.name}>
          <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            type={field.type || 'text'}
            id={field.name}
            name={field.name}
            required={field.required}
            value={values[field.name] || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
            placeholder={field.placeholder}
            disabled={loading || field.disabled}
          />
          {field.hint && (
            <p className="mt-1 text-xs text-gray-500">{field.hint}</p>
          )}
        </div>
      ))}

      {error && (
        <div className="text-red-600 text-sm">
          {error}
        </div>
      )}
    </form>
  );
}

