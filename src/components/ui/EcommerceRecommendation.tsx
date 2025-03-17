"use client";
import React, { useState } from 'react';
import Header from './Header';
import ProductGrid from './ProductGrid';
import DebugPanel from './DebugPanel';
import SearchModeToggle from './SearchModeToggle';
import { UserPersona } from '../types';
import { userPersonas } from '../../data/userPersonas';
import { useTheme } from '../../hooks/useTheme';
import { useProductData } from '../../hooks/useProductData';
import { useSearchMode } from '../../hooks/useSearchMode';

const EcommerceRecommendation: React.FC = () => {
  // Selected persona state
  const [selectedPersona, setSelectedPersona] = useState<UserPersona>(userPersonas[0]);
  
  // Use custom hooks
  const { isDarkMode, setIsDarkMode, themeStyles } = useTheme(true);
  const { products, standardResults, aiResults, animationStates, debug } = useProductData(selectedPersona);
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
    handleSearch,
    summary,
    displayResults
  } = useSearchMode(standardResults, aiResults);
  
  const { bgMain, textMain } = themeStyles;

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
        userPersonas={userPersonas}
      />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Debug info panel */}
        <DebugPanel 
          debug={debug} 
          products={products} 
          isDarkMode={isDarkMode} 
          themeStyles={themeStyles} 
        />
        
        {/* Search Mode Toggle */}
        <SearchModeToggle 
          isAIMode={isAIMode}
          handleModeToggle={handleModeToggle}
          isDarkMode={isDarkMode}
          textMain={textMain}
          summary={summary}
        />
        
        {/* Product Results Grid */}
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
      </main>
    </div>
  );
};

export default EcommerceRecommendation;