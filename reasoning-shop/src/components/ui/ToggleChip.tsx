// src/components/ui/ToggleChip.tsx
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ToggleChipProps {
  active: boolean;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  isDarkMode: boolean;
  disabled?: boolean;
}

const ToggleChip: React.FC<ToggleChipProps> = ({ 
  active, 
  label, 
  icon, 
  onClick, 
  isDarkMode,
  disabled = false
}) => {
  const getStyleClasses = () => {
    // When disabled, show a muted style
    if (disabled) {
      return isDarkMode 
        ? 'bg-gray-700 text-gray-500 border-gray-600 opacity-60 cursor-not-allowed' 
        : 'bg-gray-200 text-gray-400 border-gray-300 opacity-60 cursor-not-allowed';
    }
    
    // Normal active/inactive styles
    const activeClass = isDarkMode 
      ? 'bg-blue-600 text-white border-blue-600' 
      : 'bg-blue-200 text-blue-900 border-blue-400';
    const inactiveClass = isDarkMode 
      ? 'bg-gray-700 text-gray-300 border-gray-600' 
      : 'bg-gray-200 text-gray-700 border-gray-300';
    
    return active ? activeClass : inactiveClass;
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-colors duration-200 border ${getStyleClasses()}`}
    >
      {icon}
      {label}
    </button>
  );
};

export default ToggleChip;