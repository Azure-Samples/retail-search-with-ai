"use client";
import React, { useState, useEffect } from 'react';
import Header from './Header';
import ProductGrid from './ProductGrid';
import DebugPanel from './DebugPanel';
import SearchModeToggle from './SearchModeToggle';
import SearchProgressBar from './SearchProgressBar';
import { UserPersona } from '../types';
import { userPersonas } from '../../data/userPersonas';
import { useTheme } from '../../hooks/useTheme';
import { useProductData } from '../../hooks/useProductData';
import { useSearchMode } from '../../hooks/useSearchMode';
import { apiClient } from '@/services/apiClient';
import { SearchProgress } from '@/types/api';

const EcommerceRecommendation: React.FC = () => {
  // Selected persona state
  const [selectedPersona, setSelectedPersona] = useState<UserPersona>(userPersonas[0]);
  const [loadedPersonas, setLoadedPersonas] = useState<UserPersona[]>(userPersonas);
  
  // Use custom hooks
  const { isDarkMode, setIsDarkMode, themeStyles } = useTheme(true);
  const { 
    products, 
    standardResults, 
    aiResults, 
    animationStates, 
    debug,
    isLoading,
    searchProgress,
    searchError,
    performSearch
  } = useProductData(selectedPersona);
  
  const { 
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
    handleModeToggle,
    summary,
    displayResults
  } = useSearchMode(standardResults, aiResults);
  
  const { bgMain, textMain } = themeStyles;

  // Load personas from API on component mount
  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        const apiPersonas = await apiClient.getPersonas();
        if (apiPersonas && apiPersonas.length > 0) {
          setLoadedPersonas(apiPersonas);
          setSelectedPersona(apiPersonas[0]);
        }
      } catch (error) {
        console.error("Failed to load personas from API:", error);
        // Fall back to local personas
      }
    };

    fetchPersonas();
  }, []);

  // Handle search initiation
  const handleSearch = () => {
    if (searchQuery.trim() && !isLoading) {
      performSearch(searchQuery);
    }
  };

  return (
    <div className={`${bgMain} min-h-screen`}>
      <Header
        selectedPersona={selectedPersona}
        setSelectedPersona={setSelectedPersona}
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
        setIsDarkMode={setIsDarkMode}
        headerBg={themeStyles.headerBg}
        textMain={textMain}
        searchBg={themeStyles.searchBg}
        placeholderColor={themeStyles.placeholderColor}
        searchBtnStyle={themeStyles.searchBtnStyle}
        userPersonas={loadedPersonas}
        isSearching={isLoading}
      />
      
      <main className={`${bgMain} max-w-7xl mx-auto px-4 py-8`}>
        {/* Debug info panel */}
        <DebugPanel 
          debug={debug} 
          products={products} 
          isDarkMode={isDarkMode} 
          themeStyles={themeStyles} 
        />
        
        {/* Search Progress Bar */}
        {searchProgress && (
          <SearchProgressBar
            visible={isLoading}
            progress={searchProgress}
            isDarkMode={isDarkMode}
          />
        )}
        
        {/* Search Error Message */}
        {searchError && (
          <div className={`mb-6 p-4 border ${isDarkMode ? 'border-red-700 bg-red-900' : 'border-red-300 bg-red-100'} rounded-md ${textMain}`}>
            <p className={isDarkMode ? 'text-red-300' : 'text-red-700'}>
              {searchError}
            </p>
          </div>
        )}
        
        {/* Search Mode Toggle */}
        <div className={bgMain}>
          <SearchModeToggle 
            isAIMode={isAIMode}
            handleModeToggle={handleModeToggle}
            isDarkMode={isDarkMode}
            textMain={textMain}
            summary={summary}
          />
        </div>
        
        {/* Product Results Grid */}
        <div className={bgMain}>
          <ProductGrid 
            results={displayResults} 
            previousResults={previousResults}
            selectedStore={reasoningEnabled ? "All Stores" : "All Stores"}
            animationEnabled={animationEnabled}
            isAIMode={isAIMode}
            isDarkMode={isDarkMode}
            cardBg={themeStyles.cardBg}
            textMain={textMain}
            showRankChanges={isAIMode}
          />
        </div>
      </main>
    </div>
  );
};

export default EcommerceRecommendation;