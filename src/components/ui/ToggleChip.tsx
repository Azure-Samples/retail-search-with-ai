import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ToggleChipProps {
  active: boolean;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  isDarkMode: boolean;
}

const ToggleChip: React.FC<ToggleChipProps> = ({ active, label, icon, onClick, isDarkMode }) => {
  const activeClass = isDarkMode 
         ? 'bg-blue-600 text-white border-blue-600' 
         : 'bg-blue-200 text-blue-900 border-blue-400';
  const inactiveClass = isDarkMode 
         ? 'bg-gray-700 text-gray-300 border-gray-600' 
         : 'bg-gray-200 text-gray-700 border-gray-300';
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-colors duration-200 border ${active ? activeClass : inactiveClass}`}
    >
      {icon}
      {label}
    </button>
  );
};

export default ToggleChip;
