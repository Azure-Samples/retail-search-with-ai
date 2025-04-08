// src/components/ui/SearchProgressBar.tsx
import React from 'react';
import { SearchProgress } from '@/types/api';

interface SearchProgressBarProps {
  visible: boolean;
  progress: {
    stage: SearchProgress;
    message: string;
    percentage: number;
  };
  isDarkMode: boolean;
}

const SearchProgressBar: React.FC<SearchProgressBarProps> = ({ 
  visible, 
  progress, 
  isDarkMode 
}) => {
  if (!visible) return null;
  
  // Define styling based on theme
  const bgClass = isDarkMode ? 'bg-gray-700' : 'bg-gray-200';
  const progressBgClass = isDarkMode ? 'bg-blue-600' : 'bg-blue-500';
  const textClass = isDarkMode ? 'text-white' : 'text-gray-800';
  
  // Create a more user-friendly stage name for display
  const getStageDisplayName = (stage: SearchProgress): string => {
    switch (stage) {
      case SearchProgress.INITIATED:
        return 'Initiating Search';
      case SearchProgress.STANDARD_SEARCH:
        return 'Standard Search';
      case SearchProgress.QUERY_REWRITING:
        return 'Optimizing Query';
      case SearchProgress.ENHANCED_SEARCH:
        return 'Enhanced Search';
      case SearchProgress.RERANKING:
        return 'Reranking Results';
      case SearchProgress.REASONING:
        return 'Generating AI Reasoning';
      case SearchProgress.COMPLETE:
        return 'Search Complete';
      case SearchProgress.ERROR:
        return 'Search Error';
      default:
        return 'Processing';
    }
  };

  return (
    <div className="w-full mt-4 mb-6">
      <div className="flex justify-between items-center mb-1">
        <div className={`text-sm font-medium ${textClass}`}>
          {getStageDisplayName(progress.stage)}
        </div>
        <div className={`text-sm ${textClass}`}>
          {progress.percentage}%
        </div>
      </div>
      
      <div className={`w-full h-2 ${bgClass} rounded-full overflow-hidden`}>
        <div 
          className={`${progressBgClass} h-full transition-all duration-300 ease-in-out`} 
          style={{ width: `${progress.percentage}%` }}
        />
      </div>
      
      <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        {progress.message}
      </div>
    </div>
  );
};

export default SearchProgressBar;