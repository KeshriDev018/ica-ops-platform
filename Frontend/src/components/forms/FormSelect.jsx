import { forwardRef } from "react";

const FormSelect = forwardRef(
  (
    {
      label,
      error,
      hint,
      options = [],
      placeholder,
      className = "",
      labelClassName = "",
      ...props
    },
    ref,
  ) => {
    return (
      <div>
        {label && (
          <label
            htmlFor={props.id}
            className={`block text-sm font-medium mb-2 ${
              labelClassName || "text-gray-700"
            }`}
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange focus:border-transparent ${
            error ? "border-red-300 focus:ring-red-500" : "border-gray-300"
          } ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" className="bg-gray-800 text-white">
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value || option}
              value={option.value || option}
              className="bg-gray-800 text-white"
            >
              {option.label || option}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
        {hint && !error && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
      </div>
    );
  },
);

FormSelect.displayName = "FormSelect";

export default FormSelect;
