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
  searchBtnStyle
}) => {
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
              rows={2}
            />
          </div>
          <div className="flex items-center gap-4 mt-4">
            <ToggleChip
              active={vectorSearchEnabled}
              label="Vector Search"
              icon={<Layers className="w-4 h-4" />}
              onClick={() => setVectorSearchEnabled(!vectorSearchEnabled)}
              isDarkMode={isDarkMode}
            />
            <ToggleChip
              active={rerankerEnabled}
              label="Reranker"
              icon={<Sliders className="w-4 h-4" />}
              onClick={() => setRerankerEnabled(!rerankerEnabled)}
              isDarkMode={isDarkMode}
            />
            <ToggleChip
              active={reasoningEnabled}
              label="AI Reasoning"
              icon={<Zap className="w-4 h-4" />}
              onClick={() => setReasoningEnabled(!reasoningEnabled)}
              isDarkMode={isDarkMode}
            />
            <button
              onClick={handleSearch}
              className={`ml-auto flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-colors ${searchBtnStyle}`}
            >
              <Search className="w-4 h-4" />
              Search
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
