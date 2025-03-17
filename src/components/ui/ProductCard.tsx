import React, { useState } from 'react';
import { Star, Heart, ShoppingCart, RotateCw } from 'lucide-react';
import { Product } from '../types';
import ProductCardBack from './ProductCardBack';

interface ProductCardProps {
  product: Product;
  animationClass: string;
  cardBg: string;
  textMain: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  animationClass, 
  cardBg, 
  textMain 
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
  
  return (
    <div className={`card-container ${animationClass}`} style={{minHeight: '480px', maxHeight: '480px'}}>
      <div className={`card-flipper ${isFlipped ? 'flipped' : ''}`}>
        {/* Front of card */}
        <div 
          className={`card-front ${cardBg} shadow-lg flex flex-col h-full cursor-pointer`} 
          onClick={handleCardClick}
        >
          <div className="relative">
            <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-0.5 rounded-full text-xs">
              {product.match}% Match
            </div>
            {product.discount && product.discount > 0 && (
              <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs">
                {product.discount}% OFF
              </div>
            )}
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-48 object-cover"
            />
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
                {product.title}
              </h3>
              <div className="flex items-center gap-1">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < Math.floor(product.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-400'
                      }`}
                    />
                  ))}
                </div>
                <span className={`text-xs ${textMain}`}>
                  ({product.reviews.toLocaleString()})
                </span>
              </div>
            </div>
            
            <div className="card-compact-spacing">
              <div className="flex items-center gap-1">
                <span className={`text-xl font-bold ${textMain}`}>
                  ${product.price?.toFixed(2)}
                </span>
                {product.originalPrice && product.originalPrice > (product.price || 0) && (
                  <span className={`text-xs line-through ${textMain}`}>
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
              <div className="text-xs text-green-400">{product.delivery}</div>
            </div>
            
            <div className="space-y-1 card-compact-spacing">
              {product.features.slice(0, 2).map((feature, idx) => (
                <div key={idx} className={`flex items-center text-xs ${textMain}`}>
                  <div className="w-1 h-1 bg-blue-400 rounded-full mr-1"></div>
                  {feature}
                </div>
              ))}
            </div>
            
            <div className="text-xs card-compact-spacing">
              <span className={product.stockStatus === "Limited Stock" ? "text-orange-400" : "text-green-400"}>
                {product.stockStatus}
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
          </div>
        </div>

        {/* Back of card */}
        <div className={`card-back ${cardBg} shadow-lg flex flex-col h-full cursor-pointer`}>
          <ProductCardBack 
            product={product} 
            textMain={textMain} 
            handleFlip={handleFlip}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductCard;