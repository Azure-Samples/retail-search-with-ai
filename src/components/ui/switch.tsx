"use client"

import * as React from "react"

interface SwitchProps {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  id,
  checked,
  onCheckedChange,
  className = "",
}) => {
  return (
    <div className={`inline-flex items-center ${className}`}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={() => onCheckedChange(!checked)}
        className="sr-only"
      />
      <div
        className={`relative inline-flex h-6 w-11 cursor-pointer rounded-full transition-colors ${
          checked ? "bg-blue-600" : "bg-gray-200"
        }`}
        onClick={() => onCheckedChange(!checked)}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          } m-0.5`}
        />
      </div>
    </div>
  );
};
