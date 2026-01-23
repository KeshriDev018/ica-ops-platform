import React from "react";
import Button from "../common/Button";

const PreferenceMismatchModal = ({
  isOpen,
  onClose,
  onConfirm,
  onChangePreference,
  preferredType,
  selectedType,
  selectedPlan,
}) => {
  if (!isOpen) return null;

  const getTypeName = (type) => {
    if (type === "1-1") return "1-on-1 Coaching";
    if (type === "GROUP" || type === "group") return "Group Coaching";
    return type;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        {/* Warning Icon */}
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-navy text-center mb-3">
          Preference Mismatch
        </h2>

        {/* Message */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-gray-700 text-center">
            Your preference was <strong>{getTypeName(preferredType)}</strong>,
            but you're selecting{" "}
            <strong>{getTypeName(selectedType)}</strong>.
          </p>
          <p className="text-gray-600 text-sm text-center mt-2">
            Plan: {selectedPlan?.name} - ₹
            {selectedPlan?.inrPrice?.toLocaleString("en-IN")}/month
          </p>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-center mb-6">
          Would you like to change your preference or continue with this
          selection?
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            size="lg"
            onClick={onChangePreference}
            className="flex-1"
          >
            Change Preference
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={onConfirm}
            className="flex-1"
          >
            Continue Anyway
          </Button>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default PreferenceMismatchModal;
