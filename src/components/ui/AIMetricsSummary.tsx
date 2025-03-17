import React from 'react';
import { SearchSummary } from '../../hooks/useSearchMode';

interface AIMetricsSummaryProps {
  summary: SearchSummary;
  isDarkMode: boolean;
}

const AIMetricsSummary: React.FC<AIMetricsSummaryProps> = ({ summary, isDarkMode }) => {
  return (
    <div className="flex items-center space-x-4 text-sm">
      <div className={`flex items-center ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        <span>Improved: <strong>{summary.improvedRankCount}/{summary.totalProductCount}</strong></span>
      </div>
      <div className={`flex items-center ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span>Avg: <strong>+{summary.averageRankImprovement.toFixed(1)}</strong> positions</span>
      </div>
      <div className={`flex items-center ${isDarkMode ? 'text-purple-400' : 'text-purple-700'}`}>
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <span>New: <strong>{summary.newProductCount}</strong></span>
      </div>
    </div>
  );
};

export default AIMetricsSummary;
