import { forwardRef } from "react";

const FormInput = forwardRef(
  (
    { label, error, hint, className = "", labelClassName = "", ...props },
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
        <input
          ref={ref}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent ${
            error ? "border-red-300 focus:ring-red-500" : "border-gray-300"
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
        {hint && !error && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
      </div>
    );
  },
);

FormInput.displayName = "FormInput";

export default FormInput;
