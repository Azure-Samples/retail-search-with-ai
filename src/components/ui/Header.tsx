// src/components/ui/Header.tsx
import React from 'react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import UserPersonaSelector from './UserPersonaSelector';
import SearchBar from './SearchBar';
import { UserPersona } from '../types';

interface HeaderProps {
  selectedPersona: UserPersona;
  setSelectedPersona: (persona: UserPersona) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  vectorSearchEnabled: boolean;
  setVectorSearchEnabled: (enabled: boolean) => void;
  rerankerEnabled: boolean;
  setRerankerEnabled: (enabled: boolean) => void;
  reasoningEnabled: boolean;
  setReasoningEnabled: (enabled: boolean) => void;
  handleSearch: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (isDarkMode: boolean) => void;
  headerBg: string;
  textMain: string;
  searchBg: string;
  placeholderColor: string;
  searchBtnStyle: string;
  userPersonas: UserPersona[];
  isSearching?: boolean; // New prop to indicate search in progress
}

const Header: React.FC<HeaderProps> = ({
  selectedPersona,
  setSelectedPersona,
  searchQuery,
  setSearchQuery,
  vectorSearchEnabled,
  setVectorSearchEnabled,
  rerankerEnabled,
  setRerankerEnabled,
  reasoningEnabled,
  setReasoningEnabled,
  handleSearch,
  isDarkMode,
  setIsDarkMode,
  headerBg,
  textMain,
  searchBg,
  placeholderColor,
  searchBtnStyle,
  userPersonas,
  isSearching = false
}) => {
  return (
    <header className={headerBg}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Top bar with title and theme toggle */}
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-3xl font-bold ${textMain}`}>Smart Shopping Assistant</h1>
          <div className="flex items-center gap-4">
            <div className={`text-sm ${textMain}`}>Shopping as: {selectedPersona.name}</div>
            <Switch 
              id="theme-switch" 
              checked={isDarkMode} 
              onCheckedChange={() => setIsDarkMode(!isDarkMode)} 
            />
            <Label htmlFor="theme-switch" className={`text-sm ${textMain}`}>
              {isDarkMode ? 'Dark Mode' : 'Light Mode'}
            </Label>
          </div>
        </div>
        
        {/* User Personas */}
        <UserPersonaSelector
          userPersonas={userPersonas}
          selectedPersona={selectedPersona}
          setSelectedPersona={setSelectedPersona}
          isDarkMode={isDarkMode}
          textMain={textMain}
          disabled={isSearching} // Disable persona selection during search
        />
        
        {/* Search Bar */}
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          vectorSearchEnabled={vectorSearchEnabled}
          setVectorSearchEnabled={setVectorSearchEnabled}
          rerankerEnabled={rerankerEnabled}
          setRerankerEnabled={setRerankerEnabled}
          reasoningEnabled={reasoningEnabled}
          setReasoningEnabled={setReasoningEnabled}
          handleSearch={handleSearch}
          isDarkMode={isDarkMode}
          textMain={textMain}
          searchBg={searchBg}
          placeholderColor={placeholderColor}
          searchBtnStyle={searchBtnStyle}
          isSearching={isSearching}
        />
      </div>
    </header>
  );
};

export default Header;
