// src/components/ui/UserPersonaSelector.tsx
import React from 'react';
import { UserPersona } from '../types';

interface UserPersonaSelectorProps {
  userPersonas: UserPersona[];
  selectedPersona: UserPersona;
  setSelectedPersona: (persona: UserPersona) => void;
  isDarkMode: boolean;
  textMain: string;
  disabled?: boolean;
}

const UserPersonaSelector: React.FC<UserPersonaSelectorProps> = ({ 
  userPersonas, 
  selectedPersona, 
  setSelectedPersona,
  isDarkMode,
  textMain,
  disabled = false
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {userPersonas.map((persona) => (
        <button
          key={persona.id}
          onClick={() => !disabled && setSelectedPersona(persona)}
          className={`flex flex-col items-center p-6 rounded-2xl transition transform ${disabled ? 'cursor-not-allowed opacity-70' : 'hover:scale-105'} shadow-md ${
            selectedPersona.id === persona.id
              ? (isDarkMode 
                  ? 'bg-blue-900 text-blue-100 ring-2 ring-blue-500' 
                  : 'bg-blue-100 text-blue-900 ring-2 ring-blue-500')
              : isDarkMode 
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          disabled={disabled}
        >
          <img
            src={`https://i.pravatar.cc/100?u=${persona.id}`}
            alt={persona.name}
            className="w-20 h-20 rounded-full mb-3 object-cover"
          />
          <div className="text-center">
            <div className={`font-semibold text-lg mb-1 ${textMain}`}>{persona.name}</div>
            <div className={`text-sm px-3 py-1 rounded-full ${isDarkMode ? "bg-blue-500 bg-opacity-20" : "bg-blue-100"} ${textMain}`}>
              {persona.type}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default UserPersonaSelector;