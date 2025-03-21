// src/hooks/useProductData.ts
import { useState, useEffect } from 'react';
import { UserPersona, Product, AnimationStates } from '../components/types';
import { baseProducts } from '../data/baseProducts';
import { SearchResult } from '../types/search';
import { apiClient } from '@/services/apiClient';
import { SearchResponse, SearchProgress } from '@/types/api';

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

export function useProductData(selectedPersona: UserPersona) {
  const [products, setProducts] = useState<Product[]>([]);
  const [standardResults, setStandardResults] = useState<SearchResult[]>([]);
  const [aiResults, setAIResults] = useState<SearchResult[]>([]);
  const [animationStates, setAnimationStates] = useState<AnimationStates>({});
  const [debug, setDebug] = useState<string>('Initializing...');
  
  // New state for API integration
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchId, setSearchId] = useState<string | null>(null);
  const [searchProgress, setSearchProgress] = useState<{
    stage: SearchProgress;
    message: string;
    percentage: number;
  } | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setDebug('Loading products...');
      console.log('Base products:', baseProducts);
      
      if (!baseProducts || baseProducts.length === 0) {
        setDebug('Error: No base products found');
        return;
      }
      
      generatePersonalizedProducts();
    } catch (error) {
      console.error('Error generating products:', error);
      setDebug(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, [selectedPersona]);

  const generatePersonalizedProducts = () => {
    const personalizedProducts: Product[] = [];
    setDebug(`Generating products from ${baseProducts.length} base products...`);
    
    // Directly use base products for debugging
    for (let i = 0; i < Math.min(baseProducts.length * 3, 9); i++) {
      const baseProduct = baseProducts[i % baseProducts.length];
      
      const priceAdjustment = selectedPersona.preferences.priceWeight;
      const personalizedPrice = baseProduct.basePrice! * (1 + (priceAdjustment - 0.5) * 0.4);
      const discount = Math.floor(Math.random() * 30 + 10);
      const originalPrice = personalizedPrice * (1 + discount / 100);
      
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
    
    // Create search results
    createSearchResults(personalizedProducts);
  };

  const createSearchResults = (personalizedProducts: Product[]) => {
    // Standard search results
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
    
    // AI search results
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
    
    // Initialize animation states
    const newAnimationStates: AnimationStates = {};
    personalizedProducts.forEach((product) => {
      newAnimationStates[product.id] = Math.random() > 0.5 ? 'up' : 'down';
    });
    setAnimationStates(newAnimationStates);
  };

  // Helper for generating AI reasoning
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

  // New methods for API integration
  const performSearch = async (query: string) => {
    try {
      setIsLoading(true);
      setSearchError(null);
      setDebug(`Initiating search for query: ${query}`);
      
      // Create the search request
      const searchRequest = {
        query,
        customer: selectedPersona.id,
        vectorSearchEnabled: true,
        rerankerEnabled: true,
        reasoningEnabled: true
      };
      
      // Initiate the search
      const id = await apiClient.initiateSearch(searchRequest);
      setSearchId(id);
      setDebug(`Search initiated with ID: ${id}`);
      
      // Start polling for progress
      pollSearchProgress(id);
    } catch (error) {
      console.error('Error initiating search:', error);
      setSearchError(`Failed to start search: ${error instanceof Error ? error.message : String(error)}`);
      setIsLoading(false);
      setDebug(`Search error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  const pollSearchProgress = async (id: string) => {
    try {
      const progress = await apiClient.getSearchProgress(id);
      
      // Update state with progress information
      setSearchProgress({
        stage: progress.stage,
        message: progress.message,
        percentage: progress.percentage
      });
      setDebug(`Search progress: ${progress.stage} - ${progress.percentage}% - ${progress.message}`);
      
      // If still in progress, poll again after a delay
      if (progress.stage !== SearchProgress.COMPLETE && 
          progress.stage !== SearchProgress.ERROR) {
        setTimeout(() => pollSearchProgress(id), 1000);
      } else if (progress.stage === SearchProgress.COMPLETE) {
        // Search completed, fetch the results
        const results = await apiClient.getSearchResults(id);
        processSearchResults(results);
        setIsLoading(false);
        setDebug(`Search completed successfully: ${results.standardResults.length} standard results, ${results.aiResults.length} AI results`);
      } else {
        // Error occurred
        setSearchError(`Search failed: ${progress.message}`);
        setIsLoading(false);
        setDebug(`Search failed: ${progress.message}`);
      }
    } catch (error) {
      console.error('Error polling search progress:', error);
      setSearchError(`Error polling search progress: ${error instanceof Error ? error.message : String(error)}`);
      setIsLoading(false);
      setDebug(`Error polling progress: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  const processSearchResults = (response: SearchResponse) => {
    setStandardResults(response.standardResults);
    setAIResults(response.aiResults);
    
    // Initialize animation states
    const newAnimationStates: AnimationStates = {};
    response.aiResults.forEach((result) => {
      newAnimationStates[result.id] = (result.rankChange || 0) > 0 ? 'up' : 'down';
    });
    setAnimationStates(newAnimationStates);
  };

  return {
    products,
    standardResults,
    aiResults,
    animationStates,
    setAnimationStates,
    debug,
    // New return values for API integration
    isLoading,
    searchId,
    searchProgress,
    searchError,
    performSearch,
  };
}