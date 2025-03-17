import React, { useState } from 'react';
import { Star, Heart, ShoppingCart, RotateCw } from 'lucide-react';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';
import { SearchResult } from '@/types/search';
import ProductCardBack from './ProductCardBack';

interface ProductCardProps {
  result: SearchResult;
  selectedStore: string;
  vectorRank?: number | null;
  textRank?: number | null;
  rankChange?: number;
  isAIMode?: boolean;
  isDarkMode?: boolean;
  cardBg?: string;
  textMain?: string;
  animationClass?: string;
  showRankChange?: boolean; // Add new prop
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  result, 
  selectedStore, 
  vectorRank, 
  textRank, 
  rankChange = 0,
  isAIMode = false,
  isDarkMode = false,
  cardBg = isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-300",
  textMain = isDarkMode ? "text-white" : "text-gray-900",
  animationClass = "",
  showRankChange
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  // Add click handler for the entire card
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't flip if clicking on buttons
    if (
      e.target instanceof HTMLElement && 
      (e.target.tagName === 'BUTTON' || e.target.closest('button'))
    ) {
      return;
    }
    handleFlip();
  };

  // Format price display - fix for undefined price
  const formatPrice = (price: number | undefined) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price || 0);
  };

  // Function to get rank change display
  const getRankChangeDisplay = () => {
    const change = result.rankChange || rankChange || 0;
    if (change > 0) {
      return {
        icon: '↑', 
        color: isDarkMode ? 'text-green-400' : 'text-green-700',
        text: `+${change}`
      };
    } else if (change < 0) {
      return {
        icon: '↓',
        color: isDarkMode ? 'text-red-400' : 'text-red-700',
        text: `${change}`
      };
    }
    return { icon: '−', color: 'text-gray-400', text: '0' };
  };

  const { icon, color, text } = getRankChangeDisplay();

  return (
    <div className={`card-container ${animationClass}`} style={{minHeight: '480px', maxHeight: '480px'}}>
      <div className={`card-flipper ${isFlipped ? 'flipped' : ''}`}>
        {/* Front of card */}
        <div 
          className={`card-front ${cardBg} shadow-lg flex flex-col h-full cursor-pointer`} 
          onClick={handleCardClick}
        >
          <div className="relative">
            {/* Rank change indicator */}
            {showRankChange && (result.rankChange || rankChange) !== 0 && (
              <div className={`absolute -top-2 -right-2 flex items-center justify-center w-12 h-12 ${
                text.startsWith('+') ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500'
              } border-2 rounded-full z-10`}>
                <span className={`font-bold ${text.startsWith('+') ? 'text-green-700' : 'text-red-700'}`}>
                  {icon} {Math.abs(parseInt(text))}
                </span>
              </div>
            )}
            
            <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-0.5 rounded-full text-xs">
              {result.match || 0}% Match
            </div>
            
            {result.discount && result.discount > 0 && (
              <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs">
                {result.discount}% OFF
              </div>
            )}
            
            <div className="w-full h-48 overflow-hidden">
              {result.img ? (
                <img
                  src={result.img}
                  alt={result.title || "Product"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className={`w-full h-full flex items-center justify-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>No image</span>
                </div>
              )}
            </div>
            
            <button 
              onClick={handleFlip} 
              className="absolute bottom-2 right-2 p-1 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-opacity"
              aria-label="Show AI reasoning"
            >
              <RotateCw className="w-4 h-4 text-gray-800" />
            </button>
          </div>
          
          <div className="p-4 flex flex-col flex-grow">
            <div className="card-compact-spacing">
              <h3 className={`font-bold mb-1 line-clamp-2 min-h-[2.6rem] ${textMain}`}>
                {result.title || "Untitled Product"}
              </h3>
              <div className="flex items-center gap-1">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < Math.floor(result.rating || 0)
                          ? 'text-yellow-400 fill-current'
                          : isDarkMode ? 'text-gray-600' : 'text-gray-400'
                      }`}
                    />
                  ))}
                </div>
                <span className={`text-xs ${textMain}`}>
                  ({(result.reviews || 0).toLocaleString()})
                </span>
              </div>
            </div>
            
            <div className="card-compact-spacing">
              <div className="flex items-center gap-1">
                <span className={`text-xl font-bold ${textMain}`}>
                  {formatPrice(result.price)}
                </span>
                {result.originalPrice && result.originalPrice > (result.price || 0) && (
                  <span className={`text-xs line-through ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {formatPrice(result.originalPrice)}
                  </span>
                )}
              </div>
              <div className="text-xs text-green-400">{result.delivery || ""}</div>
            </div>
            
            <div className="space-y-1 card-compact-spacing">
              {result.features?.slice(0, 2).map((feature, idx) => (
                <div key={idx} className={`flex items-center text-xs ${textMain}`}>
                  <div className="w-1 h-1 bg-blue-400 rounded-full mr-1"></div>
                  {feature}
                </div>
              ))}
            </div>
            
            <div className="text-xs card-compact-spacing">
              <span className={result.stockStatus === "Limited Stock" ? "text-orange-400" : "text-green-400"}>
                {result.stockStatus || "In Stock"}
              </span>
            </div>
            
            <div className="flex gap-1 mt-auto">
              <button className="flex-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-1">
                <ShoppingCart className="w-3 h-3" />
                Add to Cart
              </button>
              <button className={`p-1.5 border rounded-lg hover:bg-gray-700 transition-colors ${textMain}`}>
                <Heart className={`w-3 h-3 ${textMain}`} />
              </button>
            </div>
            
            {/* Mode-specific badge */}
            {isAIMode && (
              <div className="absolute bottom-3 right-3">
                <span className="bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
                  AI Enhanced
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Back of card */}
        <div className={`card-back ${cardBg} shadow-lg flex flex-col h-full cursor-pointer`}>
          <ProductCardBack 
            product={{
              id: result.id,
              title: result.title || "Untitled Product", 
              brand: result.brand || "Unknown Brand",
              price: result.price || 0,
              originalPrice: result.originalPrice,
              discount: result.discount,
              features: result.features || [],
              rating: result.rating || 0,
              reviews: result.reviews || 0,
              match: result.match || 0,
              image: result.img,
              stockStatus: result.stockStatus || "In Stock",
              delivery: result.delivery || "",
              aiReasoning: result.aiReasoning,
              standardRank: result.standardRank,
              aiRank: result.aiRank,
              rankChange: rankChange,
              basePrice: result.price || 0,  // Add missing basePrice property
              category: result.category || "General"  // Add missing category property
            }}
            textMain={textMain} 
            handleFlip={handleFlip}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductCard;