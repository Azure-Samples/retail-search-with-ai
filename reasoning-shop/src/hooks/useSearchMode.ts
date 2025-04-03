// src/hooks/useSearchMode.ts
import { useState, useEffect, useMemo } from 'react';
import { SearchResult } from '../types/search';
import { apiClient } from '@/services/apiClient';
import { SearchProgress, ProgressUpdate } from '@/types/api';

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
  const [vectorSearchEnabled, setVectorSearchEnabled] = useState<boolean>(true);
  const [rerankerEnabled, setRerankerEnabled] = useState<boolean>(true);
  const [reasoningEnabled, setReasoningEnabled] = useState<boolean>(true);
  const [selectedStore, setSelectedStore] = useState<string>("All Stores");
  
  // New state variables for API integration
  const [currentSearchId, setCurrentSearchId] = useState<string | null>(null);
  const [searchStatus, setSearchStatus] = useState<SearchProgress | null>(null);
  const [searchMessage, setSearchMessage] = useState<string>('');
  const [searchPercentage, setSearchPercentage] = useState<number>(0);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  
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
  const handleSearch = async (customerId: string) => {
    try {
      setIsSearching(true);
      setSearchError(null);
      console.log("Search initiated with query:", searchQuery);
      
      // Create the search request
      const searchRequest = {
        query: searchQuery,
        customer: customerId,
        vectorSearchEnabled,
        rerankerEnabled,
        reasoningEnabled
      };
      
      // Initiate the search
      const searchId = await apiClient.initiateSearch(searchRequest);
      setCurrentSearchId(searchId);
      
      // Start polling for progress
      pollSearchProgress(searchId);
    } catch (error) {
      console.error("Error initiating search:", error);
      setSearchError(`Failed to start search: ${error instanceof Error ? error.message : String(error)}`);
      setIsSearching(false);
    }
  };
  
  const pollSearchProgress = async (searchId: string) => {
    try {
      const progressUpdate: ProgressUpdate = await apiClient.getSearchProgress(searchId);
      
      // Update state with progress information
      setSearchStatus(progressUpdate.stage);
      setSearchMessage(progressUpdate.message);
      setSearchPercentage(progressUpdate.percentage);
      
      // If still in progress, poll again after a delay
      if (progressUpdate.stage !== SearchProgress.COMPLETE && 
          progressUpdate.stage !== SearchProgress.ERROR) {
        setTimeout(() => pollSearchProgress(searchId), 1000);
      } else {
        // Search completed, fetch the results
        const results = await apiClient.getSearchResults(searchId);
        handleSearchResults(results);
        setIsSearching(false);
      }
    } catch (error) {
      console.error("Error polling search progress:", error);
      setSearchError(`Error polling search progress: ${error instanceof Error ? error.message : String(error)}`);
      setIsSearching(false);
    }
  };
  
  const handleSearchResults = (results: any) => {
    // This function will be called by the parent component after receiving results
    console.log("Search results received:", results);
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
    displayResults,
    // New return values for API integration
    isSearching,
    searchStatus,
    searchMessage,
    searchPercentage,
    searchError,
    currentSearchId
  };
}