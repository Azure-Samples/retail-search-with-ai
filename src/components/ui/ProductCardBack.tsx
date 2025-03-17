import React from 'react';
import { Star, Info, ArrowUp, ArrowDown, Minus, RotateCw } from 'lucide-react';
import { Product } from '../types';

interface ProductCardBackProps {
  product: Product;
  textMain: string;
  handleFlip: () => void;
}

const ProductCardBack: React.FC<ProductCardBackProps> = ({ 
  product, 
  textMain,
  handleFlip
}) => {
  // Use provided AI reasoning or generate placeholder
  const getAIReasoning = (product: Product) => {
    if (product.aiReasoning) {
      return product.aiReasoning;
    }
    
    // Fallback reasoning if none provided
    const confidenceScore = product.match || Math.floor(Math.random() * 30 + 70);
    
    return {
      text: `Based on your preferences, this ${product.brand} ${product.title} is a great match because it combines ${product.features?.[0]?.toLowerCase() || 'quality'} with ${product.features?.[1]?.toLowerCase() || 'value'}.`,
      confidenceScore,
      factors: [
        {
          factor: "Price point",
          weight: Math.floor(Math.random() * 30 + 60),
          description: `This product's price point aligns with your typical spending patterns.`
        },
        {
          factor: "Quality rating",
          weight: Math.floor(Math.random() * 20 + 70),
          description: `The ${product.rating}/5 star rating indicates it meets your quality standards.`
        },
        {
          factor: "Features",
          weight: Math.floor(Math.random() * 25 + 65),
          description: `The product features match your historical preferences.`
        }
      ]
    };
  };

  const reasoning = getAIReasoning(product);
  
  // Determine rank change icon and color
  const getRankChangeDisplay = () => {
    const change = product.rankChange || 0;
    
    if (change > 0) {
      return {
        icon: <ArrowUp className="w-4 h-4 text-green-500" />,
        text: `Improved by ${change} position${change > 1 ? 's' : ''}`,
        color: 'text-green-500'
      };
    } else if (change < 0) {
      return {
        icon: <ArrowDown className="w-4 h-4 text-red-500" />,
        text: `Dropped by ${Math.abs(change)} position${Math.abs(change) > 1 ? 's' : ''}`,
        color: 'text-red-500'
      };
    } else {
      return {
        icon: <Minus className="w-4 h-4 text-gray-500" />,
        text: 'Position unchanged',
        color: 'text-gray-500'
      };
    }
  };
  
  const rankChange = getRankChangeDisplay();

  return (
    <div className="p-4 flex flex-col h-full">
      <div className="flex justify-between items-start mb-2">
        <h3 className={`font-bold line-clamp-2 ${textMain}`}>{product.title}</h3>
        <button 
          onClick={handleFlip} 
          className={`p-1 rounded-full hover:bg-opacity-70 transition-opacity ${textMain === 'text-white' ? 'bg-gray-700' : 'bg-gray-200'}`}
          aria-label="Show product details"
        >
          <RotateCw className={`w-4 h-4 ${textMain}`} />
        </button>
      </div>
      
      <div className="flex justify-between items-center mb-2">
        <div className="text-center py-1">
          <div className="text-xl font-bold text-blue-500">
            {product.match}%
          </div>
          <p className={`text-xs ${textMain}`}>AI confidence</p>
        </div>
        
        <div className="text-center flex items-center gap-1 py-1">
          {rankChange.icon}
          <div>
            <span className={`font-bold text-sm ${textMain}`}>Rank {product.aiRank !== undefined ? product.aiRank : '?'}</span>
            <p className={`text-xs ${rankChange.color}`}>{rankChange.text}</p>
          </div>
        </div>
      </div>
      
      <div className={`mb-3 p-2 rounded-md ${textMain === 'text-white' ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <h4 className={`text-sm font-semibold mb-1 ${textMain}`}>Why this matches you:</h4>
        <p className={`text-xs line-clamp-3 ${textMain}`}>{reasoning.text}</p>
      </div>
      
      <div className="flex-grow">
        <h4 className={`text-sm font-semibold mb-2 ${textMain}`}>Key factors:</h4>
        {reasoning.factors.map((factor, i) => (
          <div key={i} className="mb-2">
            <div className="flex justify-between text-xs">
              <span className={`font-medium ${textMain}`}>{factor.factor}</span>
              <span className={`font-bold ${textMain}`}>{factor.weight}%</span>
            </div>
            <div className={`w-full rounded-full h-1.5 ${textMain === 'text-white' ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div 
                className={`h-1.5 rounded-full ${
                  factor.weight > 80 ? 'bg-green-500' : 
                  factor.weight > 60 ? 'bg-blue-500' : 
                  factor.weight > 40 ? 'bg-yellow-500' : 'bg-red-500'
                }`} 
                style={{ width: `${factor.weight}%` }}
              ></div>
            </div>
            <p className={`text-xs mt-0.5 ${textMain === 'text-white' ? 'text-gray-400' : 'text-gray-600'} line-clamp-1`}>
              {factor.description}
            </p>
          </div>
        ))}
      </div>
      
      <div className="mt-auto pt-2 flex justify-between items-end border-t border-opacity-20 border-gray-500">
        <div>
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : textMain === 'text-white' ? 'text-gray-600' : 'text-gray-300'}`} 
              />
            ))}
            <span className={`text-xs ml-1 ${textMain}`}>({product.reviews.toLocaleString()})</span>
          </div>
        </div>
        <p className={`text-sm font-bold ${textMain}`}>${(product.price || 0).toFixed(2)}</p>
      </div>
    </div>
  );
};

export default ProductCardBack;