"use client";
import React, { useState, useEffect } from 'react';
import Header from './Header';
import ProductGrid from './ProductGrid';
import { UserPersona, Product, AnimationStates } from '../types';
import { userPersonas } from '../../data/userPersonas';
import { baseProducts } from '../../data/baseProducts';

const EcommerceRecommendation: React.FC = () => {
  const [selectedPersona, setSelectedPersona] = useState<UserPersona>(userPersonas[0]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);
  const [animationStates, setAnimationStates] = useState<AnimationStates>({});
  const [vectorSearchEnabled, setVectorSearchEnabled] = useState<boolean>(false);
  const [rerankerEnabled, setRerankerEnabled] = useState<boolean>(false);
  const [reasoningEnabled, setReasoningEnabled] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

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
    const generatePersonalizedProducts = () => {
      const personalizedProducts: Product[] = [];
      for (let i = 0; i < 8; i++) {
        const baseProduct = baseProducts[i % baseProducts.length];
        const priceAdjustment = selectedPersona.preferences.priceWeight;
        const qualityFeatures = selectedPersona.preferences.qualityWeight > 0.7;
        
        const personalizedPrice = baseProduct.basePrice! * (1 + (priceAdjustment - 0.5) * 0.4);
        const discount = Math.floor(Math.random() * 30 + 10);
        const originalPrice = personalizedPrice * (1 + discount / 100);

        personalizedProducts.push({
          ...baseProduct,
          id: `${baseProduct.id}-${i}`,
          price: personalizedPrice,
          originalPrice: originalPrice,
          discount: discount,
          features: qualityFeatures 
            ? [...baseProduct.features, "Extended warranty", "Premium support"]
            : baseProduct.features,
          match: Math.floor(Math.random() * 30 + 70),
          stockStatus: Math.random() > 0.7 ? "Limited Stock" : "In Stock",
          delivery: "Free Prime Delivery"
        });
      }
      setProducts(personalizedProducts);
      
      // Initialize animation states for each product
      const newAnimationStates: AnimationStates = {};
      personalizedProducts.forEach((product) => {
        newAnimationStates[product.id] = Math.random() > 0.5 ? 'up' : 'down';
      });
      setAnimationStates(newAnimationStates);
    };

    generatePersonalizedProducts();
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
        <ProductGrid
          products={products}
          animationStates={animationStates}
          reasoningEnabled={reasoningEnabled}
          setReasoningEnabled={setReasoningEnabled}
          handleReasoningToggle={handleReasoningToggle}
          getAnimationClasses={getAnimationClasses}
          cardBg={cardBg}
          textMain={textMain}
        />
      </main>
    </div>
  );
};

export default EcommerceRecommendation;
