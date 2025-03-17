"use client";
import React, { useState, useEffect, useMemo } from 'react';
import Header from './Header';
import ProductGrid from './ProductGrid';
import { UserPersona, Product, AnimationStates } from '../types';
import { userPersonas } from '../../data/userPersonas';
import { baseProducts } from '../../data/baseProducts';
import { SearchResult } from '../../types/search';
import ModeToggle, { SearchSummary } from './ModeToggle';

// Define proper types for the AI reasoning generation
interface AIReasoning {
  text: string;
  confidenceScore: number;
  factors: Array<{
    factor: string;
    weight: number;
    description: string;
  }>;
}

const EcommerceRecommendation: React.FC = () => {
  // Original state variables from your implementation
  const [selectedPersona, setSelectedPersona] = useState<UserPersona>(userPersonas[0]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);
  const [animationStates, setAnimationStates] = useState<AnimationStates>({});
  const [vectorSearchEnabled, setVectorSearchEnabled] = useState<boolean>(false);
  const [rerankerEnabled, setRerankerEnabled] = useState<boolean>(false);
  const [reasoningEnabled, setReasoningEnabled] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [debug, setDebug] = useState<string>('Initializing...');
  
  // New state variables for AI comparison
  const [isAIMode, setIsAIMode] = useState<boolean>(false);
  const [previousResults, setPreviousResults] = useState<SearchResult[]>([]);
  const [animationEnabled, setAnimationEnabled] = useState<boolean>(false);
  const [standardResults, setStandardResults] = useState<SearchResult[]>([]);
  const [aiResults, setAIResults] = useState<SearchResult[]>([]);
  const [selectedStore, setSelectedStore] = useState<string>("All Stores");

  // Theme variables
  const bgMain = isDarkMode ? "bg-gray-900" : "bg-white";
  const textMain = isDarkMode ? "text-white" : "text-black";
  const headerBg = isDarkMode ? "bg-gray-800 border-b border-gray-700" : "bg-gray-100 border-b border-gray-300";
  const cardBg = isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-300";
  const searchBg = isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-300";
  const placeholderColor = isDarkMode ? "placeholder-gray-500" : "placeholder-gray-400";
  const searchBtnStyle = isDarkMode 
    ? "bg-blue-600 hover:bg-blue-700 text-white" 
    : "bg-blue-200 hover:bg-blue-300 text-blue-900";

  useEffect(() => {
    try {
      setDebug('Loading products...');
      console.log('Base products:', baseProducts);
      
      if (!baseProducts || baseProducts.length === 0) {
        setDebug('Error: No base products found');
        return;
      }
      
      const generatePersonalizedProducts = () => {
        const personalizedProducts: Product[] = [];
        setDebug(`Generating products from ${baseProducts.length} base products...`);
        
        // Directly use base products for debugging
        for (let i = 0; i < Math.min(baseProducts.length * 3, 9); i++) {
          const baseProduct = baseProducts[i % baseProducts.length];
          setDebug(`Processing product ${i+1}: ${baseProduct.title}`);
          
          const priceAdjustment = selectedPersona.preferences.priceWeight;
          const personalizedPrice = baseProduct.basePrice! * (1 + (priceAdjustment - 0.5) * 0.4);
          const discount = Math.floor(Math.random() * 30 + 10);
          const originalPrice = personalizedPrice * (1 + discount / 100);
          
          // Generate AI reasoning based on persona preferences
          const generateAIReasoning = (product: Product, persona: UserPersona): AIReasoning => {
            // If the product already has AI reasoning, use it
            if (product.aiReasoning) {
              return product.aiReasoning;
            }
            
            // Otherwise generate reasoning based on persona
            const confidenceScore = Math.floor(Math.random() * 30 + 70);
            const isPriceConscious = persona.preferences.priceWeight > 0.7;
            const isBrandConscious = persona.preferences.brandWeight > 0.7;
            const isQualityConscious = persona.preferences.qualityWeight > 0.7;
            
            let reasoningText = `This ${product.brand} ${product.title} matches your `;
            
            if (isQualityConscious) {
              reasoningText += "preference for high-quality products. ";
            } else if (isPriceConscious) {
              reasoningText += "budget-conscious shopping style. ";
            } else if (isBrandConscious) {
              reasoningText += "brand preferences. ";
            } else {
              reasoningText += "general shopping preferences. ";
            }
            
            reasoningText += "We noticed patterns in your browsing and purchase history that indicate this would be a good match.";
            
            return {
              text: reasoningText,
              confidenceScore,
              factors: [
                {
                  factor: "Price match",
                  weight: isPriceConscious ? 90 : Math.floor(Math.random() * 20 + 60),
                  description: `The price point ${isPriceConscious ? "perfectly" : "somewhat"} aligns with your budget preferences.`
                },
                {
                  factor: "Brand affinity",
                  weight: isBrandConscious ? 95 : Math.floor(Math.random() * 20 + 60),
                  description: `${product.brand} is ${isBrandConscious ? "one of your favorite brands" : "a brand you might like"}.`
                },
                {
                  factor: "Feature match",
                  weight: isQualityConscious ? 92 : Math.floor(Math.random() * 20 + 60),
                  description: `The product features ${isQualityConscious ? "strongly match" : "somewhat match"} your preferences.`
                }
              ]
            };
          };
          
          // Calculate ranking changes for visualization
          const standardRank = i + 1;
          const aiRank = Math.max(1, Math.min(8, standardRank + Math.floor(Math.random() * 7 - 3)));
          const rankChange = standardRank - aiRank;

          personalizedProducts.push({
            ...baseProduct,
            id: `${baseProduct.id}-${i}`,
            price: personalizedPrice,
            originalPrice: originalPrice,
            discount: discount,
            match: Math.floor(Math.random() * 30 + 70),
            stockStatus: Math.random() > 0.7 ? "Limited Stock" : "In Stock",
            delivery: "Free Prime Delivery",
            aiReasoning: generateAIReasoning(baseProduct, selectedPersona),
            standardRank,
            aiRank,
            rankChange
          });
        }
        
        setDebug(`Generated ${personalizedProducts.length} products`);
        console.log('Generated products:', personalizedProducts);
        setProducts(personalizedProducts);
        
        // Create search results for standard and AI modes
        const standardSearchResults: SearchResult[] = personalizedProducts.map(product => ({
          id: product.id.toString(),
          title: product.title,
          description: product.features?.join(', ') || '',
          price: product.price || 0,
          img: product.image || '',
          brand: product.brand || '',
          category: product.category || '',
          features: product.features || [],
          rating: product.rating || 0,
          reviews: product.reviews || 0
        }));
        
        const aiSearchResults: SearchResult[] = [...personalizedProducts]
          .sort((a, b) => (a.aiRank || 0) - (b.aiRank || 0))
          .map(product => ({
            id: product.id.toString(),
            title: product.title,
            description: product.features?.join(', ') || '',
            price: product.price || 0,
            img: product.image || '',
            brand: product.brand || '',
            category: product.category || '',
            features: product.features || [],
            rating: product.rating || 0,
            reviews: product.reviews || 0,
            aiReasoning: product.aiReasoning,
            standardRank: product.standardRank || 0,
            aiRank: product.aiRank || 0,
            rankChange: product.rankChange || 0
          }));
        
        setStandardResults(standardSearchResults);
        setAIResults(aiSearchResults);
        
        // Initialize animation states for each product
        const newAnimationStates: AnimationStates = {};
        personalizedProducts.forEach((product) => {
          newAnimationStates[product.id] = Math.random() > 0.5 ? 'up' : 'down';
        });
        setAnimationStates(newAnimationStates);
      };

      generatePersonalizedProducts();
    } catch (error) {
      console.error('Error generating products:', error);
      setDebug(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, [selectedPersona]);

  const handleSearch = () => {
    console.log("Search initiated with query:", searchQuery);
    // Add your search logic here.
  };

  const handleReasoningToggle = () => {
    setReasoningEnabled(prev => !prev);
    const newAnimationStates: AnimationStates = {};
    products.forEach((product) => {
      newAnimationStates[product.id] = Math.random() > 0.5 ? 'up' : 'down';
    });
    setAnimationStates(newAnimationStates);
  };

  const getAnimationClasses = (productId: string | number) => {
    const baseClasses = "transform transition-all duration-500 ease-in-out";
    if (!reasoningEnabled) return baseClasses;
    return `${baseClasses} ${animationStates[productId] === 'up' ? '-translate-y-4' : 'translate-y-4'}`;
  };
  
  // Handle mode toggle for AI vs Standard results
  const handleModeToggle = () => {
    setPreviousResults(isAIMode ? aiResults : standardResults);
    setIsAIMode(!isAIMode);
    setAnimationEnabled(true);
  };

  // Modified: Keep animation effects for visual transitions but always show rank changes
  useEffect(() => {
    if (animationEnabled) {
      const timer = setTimeout(() => {
        setAnimationEnabled(false);
        // We no longer hide the rank indicators, just disable the movement animation
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [animationEnabled]);

  // Calculate summary statistics for the comparison
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

  // Determine which results to display based on current mode
  const displayResults = isAIMode ? aiResults : standardResults;

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
        headerBg={headerBg}
        textMain={textMain}
        searchBg={searchBg}
        placeholderColor={placeholderColor}
        searchBtnStyle={searchBtnStyle}
        userPersonas={userPersonas}
      />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Debug info */}
        <div className={`mb-4 p-4 border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'} rounded ${textMain}`}>
          <h3 className="font-bold">Debug Info:</h3>
          <p>{debug}</p>
          <p>Products loaded: {products.length}</p>
          <p className="mt-2">isDarkMode: {isDarkMode ? 'true' : 'false'}</p>
          <button 
            className="px-3 py-1 bg-blue-600 text-white rounded mt-2"
            onClick={() => console.log('Current products:', products)}
          >
            Log Products to Console
          </button>
        </div>
        
        {/* Search Mode Toggle */}
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
            {isAIMode && (
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
            )}
          </div>
        </div>
        
        {/* Product Results Grid */}
        <ProductGrid 
          results={displayResults} 
          previousResults={previousResults}
          selectedStore={selectedStore}
          animationEnabled={animationEnabled}
          isAIMode={isAIMode}
          isDarkMode={isDarkMode}
          cardBg={cardBg}
          textMain={textMain}
          showRankChanges={isAIMode} // New prop to always show rank changes in AI mode
        />
      </main>
    </div>
  );
};

export default EcommerceRecommendation;