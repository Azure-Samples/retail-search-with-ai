import { useState, useEffect, useMemo } from 'react';
import { SearchResult } from '../types/search';

export interface SearchSummary {
  totalProductCount: number;
  improvedRankCount: number;
  newProductCount: number;
  removedProductCount: number;
  averageRankImprovement: number;
}

export function useSearchMode(standardResults: SearchResult[], aiResults: SearchResult[]) {
  const [isAIMode, setIsAIMode] = useState<boolean>(false);
  const [previousResults, setPreviousResults] = useState<SearchResult[]>([]);
  const [animationEnabled, setAnimationEnabled] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [vectorSearchEnabled, setVectorSearchEnabled] = useState<boolean>(false);
  const [rerankerEnabled, setRerankerEnabled] = useState<boolean>(false);
  const [reasoningEnabled, setReasoningEnabled] = useState<boolean>(false);
  const [selectedStore, setSelectedStore] = useState<string>("All Stores");

  // Calculate summary statistics for comparison
  const summary: SearchSummary = useMemo(() => {
    const standardIds = new Set(standardResults.map(result => result.id));
    const aiIds = new Set(aiResults.map(result => result.id));
    
    // Find products in both result sets and compare their rankings
    const commonProducts = standardResults.filter(result => aiIds.has(result.id));
    
    // Create a map of product IDs to their ranks in standard results
    const standardRankMap = new Map();
    standardResults.forEach((result, index) => {
      standardRankMap.set(result.id, index);
    });
    
    // Count rank improvements
    let improvedCount = 0;
    let totalRankImprovement = 0;
    
    aiResults.forEach((result, aiIndex) => {
      if (standardRankMap.has(result.id)) {
        const standardIndex = standardRankMap.get(result.id);
        if (standardIndex > aiIndex) {
          improvedCount++;
          totalRankImprovement += (standardIndex - aiIndex);
        }
      }
    });
    
    return {
      totalProductCount: aiResults.length,
      improvedRankCount: improvedCount,
      newProductCount: aiIds.size - commonProducts.length,
      removedProductCount: standardIds.size - commonProducts.length,
      averageRankImprovement: improvedCount > 0 ? totalRankImprovement / improvedCount : 0
    };
  }, [standardResults, aiResults]);

  // Handle mode toggle for AI vs Standard results
  const handleModeToggle = () => {
    setPreviousResults(isAIMode ? aiResults : standardResults);
    setIsAIMode(!isAIMode);
    setAnimationEnabled(true);
  };

  // Handle search
  const handleSearch = () => {
    console.log("Search initiated with query:", searchQuery);
    // Add search logic here
  };
  
  // Handle animation timing
  useEffect(() => {
    if (animationEnabled) {
      const timer = setTimeout(() => {
        setAnimationEnabled(false);
        // Just disable the movement animation
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [animationEnabled]);
  
  // Determine which results to display based on current mode
  const displayResults = isAIMode ? aiResults : standardResults;

  return {
    isAIMode,
    previousResults,
    animationEnabled,
    searchQuery,
    setSearchQuery,
    vectorSearchEnabled,
    setVectorSearchEnabled,
    rerankerEnabled,
    setRerankerEnabled,
    reasoningEnabled,
    setReasoningEnabled,
    selectedStore,
    handleModeToggle,
    handleSearch,
    summary,
    displayResults
  };
}
