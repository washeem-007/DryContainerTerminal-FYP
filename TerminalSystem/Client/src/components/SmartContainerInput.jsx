import React, { useState } from 'react';

/**
 * SmartContainerInput — ISO 6346 compliant container ID input with real-time validation.
 *
 * Props:
 *   onChange(rawValue, isValid) — called on every keystroke with the stripped value (no spaces)
 *                                  and a boolean indicating whether the format is fully valid.
 *   value — optional controlled value (raw, no spaces)
 */
export default function SmartContainerInput({ onChange, value: externalValue }) {
  const [displayValue, setDisplayValue] = useState(() => {
    // If a controlled value is passed in, format it for display
    if (externalValue) {
      let v = externalValue.replace(/\s/g, '');
      if (v.length > 4) v = v.slice(0, 4) + ' ' + v.slice(4);
      if (v.length > 11) v = v.slice(0, 11) + ' ' + v.slice(11);
      return v;
    }
    return '';
  });
  const [isValid, setIsValid] = useState(false);

  const handleInputChange = (e) => {
    // 1. Strip everything except letters and numbers, force Uppercase
    let rawValue = e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();

    // 2. Enforce the rules: First 4 MUST be letters, next 7 MUST be numbers
    let formatted = '';
    for (let i = 0; i < rawValue.length; i++) {
      if (i < 4) {
        if (/[A-Z]/.test(rawValue[i])) formatted += rawValue[i];
      } else if (i < 11) {
        if (/[0-9]/.test(rawValue[i])) formatted += rawValue[i];
      }
    }

    // 3. Add visual spaces for readability (e.g., MSCU 123456 7)
    let display = formatted;
    if (formatted.length > 4)  display = formatted.slice(0, 4)  + ' ' + formatted.slice(4);
    if (formatted.length > 10) display = display.slice(0, 11)   + ' ' + display.slice(11);

    // 4. Check if it's completely valid (4 letters + space + 6 numbers + space + 1 number)
    const exactMatchRegex = /^[A-Z]{4} \d{6} \d{1}$/;
    const valid = exactMatchRegex.test(display);

    setDisplayValue(display);
    setIsValid(valid);

    // Notify parent with the raw value (no spaces) and validity flag
    if (onChange) {
      onChange(formatted, valid);
    }
  };

  return (
    <div className="flex flex-col space-y-2 w-full">
      <label className="text-sm font-semibold text-gray-700">
        Container ID (ISO 6346)
      </label>

      <input
        type="text"
        value={displayValue}
        onChange={handleInputChange}
        placeholder="e.g., MSCU 123456 7"
        maxLength={13}
        className={`px-4 py-2 border-2 rounded-lg outline-none transition-colors font-mono text-lg
          ${isValid
            ? 'border-green-500 bg-green-50 text-green-900 focus:border-green-600'
            : displayValue.length > 0
              ? 'border-red-400 bg-red-50 text-red-900 focus:border-red-500'
              : 'border-gray-300 focus:border-blue-500'
          }`}
      />

      {/* Helper Text */}
      <span className="text-xs text-gray-500">
        {isValid
          ? '✅ Valid ISO 6346 format detected'
          : 'Must be 4 letters followed by 7 numbers (e.g., MSCU 123456 7)'}
      </span>
    </div>
  );
}
