// src/components/ui/SearchBar.tsx
import React from 'react';
import { Search, Layers, Sliders, Zap } from 'lucide-react';
import ToggleChip from './ToggleChip';

interface SearchBarProps {
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
  textMain: string;
  searchBg: string;
  placeholderColor: string;
  searchBtnStyle: string;
  isSearching?: boolean; // New prop to disable search during in-progress search
}

const SearchBar: React.FC<SearchBarProps> = ({
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
  textMain,
  searchBg,
  placeholderColor,
  searchBtnStyle,
  isSearching = false
}) => {
  // Handle Enter key press in the search box
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSearching && searchQuery.trim()) {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="rounded-2xl p-8 shadow-lg mb-8">
      <div className="max-w-5xl mx-auto">
        <div className={`${searchBg} rounded-md p-4`}>
          <div className="relative">
            <Search className={`absolute left-4 top-4 ${isDarkMode ? "text-gray-500" : "text-gray-400"} w-6 h-6`} />
            <textarea
              className={`w-full pl-12 pr-4 pt-4 pb-4 bg-transparent ${textMain} text-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${placeholderColor} resize-none border-none`}
              placeholder="What are you shopping for today?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={2}
              disabled={isSearching}
            />
          </div>
          <div className="flex items-center gap-4 mt-4 flex-wrap">
            <ToggleChip
              active={vectorSearchEnabled}
              label="Vector Search"
              icon={<Layers className="w-4 h-4" />}
              onClick={() => setVectorSearchEnabled(!vectorSearchEnabled)}
              isDarkMode={isDarkMode}
              disabled={isSearching}
            />
            <ToggleChip
              active={rerankerEnabled}
              label="Reranker"
              icon={<Sliders className="w-4 h-4" />}
              onClick={() => setRerankerEnabled(!rerankerEnabled)}
              isDarkMode={isDarkMode}
              disabled={isSearching}
            />
            <ToggleChip
              active={reasoningEnabled}
              label="AI Reasoning"
              icon={<Zap className="w-4 h-4" />}
              onClick={() => setReasoningEnabled(!reasoningEnabled)}
              isDarkMode={isDarkMode}
              disabled={isSearching}
            />
            <button
              onClick={handleSearch}
              className={`ml-auto flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-colors ${
                isSearching || !searchQuery.trim() 
                  ? `opacity-50 cursor-not-allowed ${isDarkMode ? 'bg-gray-600 text-gray-400' : 'bg-gray-300 text-gray-500'}`
                  : searchBtnStyle
              }`}
              disabled={isSearching || !searchQuery.trim()}
            >
              {isSearching ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Search
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;