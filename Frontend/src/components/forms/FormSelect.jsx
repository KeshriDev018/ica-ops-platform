import { forwardRef } from 'react'

const FormSelect = forwardRef(({ 
  label, 
  error, 
  hint, 
  options = [],
  placeholder,
  className = '', 
  ...props 
}, ref) => {
  return (
    <div>
      {label && (
        <label htmlFor={props.id} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        ref={ref}
        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent bg-white ${
          error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
        } ${className}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value || option} value={option.value || option}>
            {option.label || option}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error.message}</p>
      )}
      {hint && !error && (
        <p className="mt-1 text-xs text-gray-500">{hint}</p>
      )}
    </div>
  )
})

FormSelect.displayName = 'FormSelect'

export default FormSelect
