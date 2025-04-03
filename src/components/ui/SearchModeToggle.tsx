import React from 'react';
import AIMetricsSummary from './AIMetricsSummary';
import { SearchSummary } from '../../hooks/useSearchMode';

interface SearchModeToggleProps {
  isAIMode: boolean;
  handleModeToggle: () => void;
  isDarkMode: boolean;
  textMain: string;
  summary: SearchSummary;
}

const SearchModeToggle: React.FC<SearchModeToggleProps> = ({
  isAIMode,
  handleModeToggle,
  isDarkMode,
  textMain,
  summary
}) => {
  return (
    <div className="mb-6">
      <div className={`flex items-center justify-between ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} p-4 rounded-lg`}>
        <div className="flex items-center space-x-3">
          <span className={`font-medium ${textMain}`}>
            {isAIMode ? 'AI Enhanced Mode' : 'Standard Search Mode'}
          </span>
          
          {/* Toggle Switch */}
          <div 
            onClick={handleModeToggle}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isAIMode ? 'bg-blue-600' : 'bg-gray-400'
            }`}
            role="switch"
            aria-checked={isAIMode}
          >
            <span 
              aria-hidden="true" 
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                isAIMode ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </div>
        </div>
        
        {/* AI Metrics Summary */}
        {isAIMode && <AIMetricsSummary summary={summary} isDarkMode={isDarkMode} />}
      </div>
    </div>
  );
};

export default SearchModeToggle;
