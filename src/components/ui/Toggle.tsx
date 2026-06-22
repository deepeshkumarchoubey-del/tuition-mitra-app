import { useState } from 'react';

interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export default function Toggle({
  enabled,
  onChange,
  label,
  description,
  disabled = false,
}: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      className={`
        flex items-center gap-3 w-full text-left
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <div
        className={`
          relative w-12 h-7 rounded-full transition-colors duration-200
          flex-shrink-0
          ${enabled ? 'bg-primary-600' : 'bg-gray-200'}
        `}
      >
        <div
          className={`
            absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md
            transition-transform duration-200
            ${enabled ? 'translate-x-5.5 left-0.5' : 'left-0.5'}
          `}
          style={{ transform: enabled ? 'translateX(22px)' : 'translateX(0)' }}
        />
      </div>
      {(label || description) && (
        <div className="flex-1">
          {label && <p className="font-medium text-gray-900">{label}</p>}
          {description && <p className="text-sm text-gray-500">{description}</p>}
        </div>
      )}
    </button>
  );
}

interface ChipToggleProps {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  max?: number;
}

export function ChipToggle({ options, selected, onChange, max }: ChipToggleProps) {
  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else if (!max || selected.length < max) {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => toggle(option.value)}
          className={`
            px-4 py-2 rounded-full font-medium transition-all duration-200
            ${selected.includes(option.value)
              ? 'bg-primary-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }
          `}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}