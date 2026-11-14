import React, { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || props.name || Math.random().toString(36).substring(7);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1.5">
            {label} {props.required && <span className="text-coral-600">*</span>}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`w-full px-3.5 py-2 text-sm rounded-xl border bg-white text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:ring-2 transition-colors ${
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
              : 'border-parchment-300 focus:border-coral-500 focus:ring-coral-100'
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>}
        {helperText && !error && <p className="mt-1 text-xs text-charcoal-500">{helperText}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: Array<{ value: string; label: string }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, children, className = '', id, ...props }, ref) => {
    const selectId = id || props.name || Math.random().toString(36).substring(7);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1.5">
            {label} {props.required && <span className="text-coral-600">*</span>}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={`w-full px-3.5 py-2 text-sm rounded-xl border bg-white text-charcoal-900 focus:outline-none focus:ring-2 transition-colors ${
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
              : 'border-parchment-300 focus:border-coral-500 focus:ring-coral-100'
          } ${className}`}
          {...props}
        >
          {options ? options.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          )) : children}
        </select>
        {error && <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const textareaId = id || props.name || Math.random().toString(36).substring(7);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1.5">
            {label} {props.required && <span className="text-coral-600">*</span>}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          className={`w-full px-3.5 py-2 text-sm rounded-xl border bg-white text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:ring-2 transition-colors ${
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
              : 'border-parchment-300 focus:border-coral-500 focus:ring-coral-100'
          } ${className}`}
          rows={props.rows || 3}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
