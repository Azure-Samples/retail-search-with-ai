import React from 'react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Define the structure for search summary statistics
export interface SearchSummary {
  totalProductCount: number;
  improvedRankCount: number;
  newProductCount: number;
  removedProductCount: number;
  averageRankImprovement: number;
}

interface ModeToggleProps {
  isAIMode: boolean;
  onToggle: () => void;
  summary: SearchSummary;
  isDarkMode?: boolean;
}

const ModeToggle: React.FC<ModeToggleProps> = ({ 
  isAIMode, 
  onToggle, 
  summary,
  isDarkMode = false
}) => {
  // Define theme-based styling
  const bgColor = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const textColor = isDarkMode ? 'text-white' : 'text-gray-900';
  const statsBgColor = isDarkMode ? 'bg-gray-700' : 'bg-gray-100';
  const statTextColor = isDarkMode ? 'text-gray-300' : 'text-gray-700';
  const highlightColor = 'text-blue-500';

  return (
    <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 ${bgColor} rounded-lg shadow-lg p-4 max-w-md w-full border border-gray-200`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-4">
          <Switch
            id="mode-toggle"
            checked={isAIMode}
            onCheckedChange={onToggle}
          />
          <Label htmlFor="mode-toggle" className={`font-medium ${textColor}`}>
            {isAIMode ? 'AI Reasoning Mode' : 'Standard Search Mode'}
          </Label>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${isAIMode ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
          {isAIMode ? 'Enhanced' : 'Basic'}
        </div>
      </div>
      
      {summary && (
        <div className={`${statsBgColor} rounded-md p-3 text-sm ${statTextColor} grid grid-cols-2 gap-2`}>
          <div>
            <p>Products: <span className={highlightColor}>{summary.totalProductCount}</span></p>
            <p>Improved Rankings: <span className={highlightColor}>{summary.improvedRankCount}</span></p>
          </div>
          <div>
            <p>New Products: <span className={highlightColor}>{summary.newProductCount}</span></p>
            <p>Avg Rank Improvement: <span className={highlightColor}>{summary.averageRankImprovement.toFixed(1)}</span></p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModeToggle;
