import React from 'react';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  animationClass: string;
  cardBg: string;
  textMain: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, animationClass, cardBg, textMain }) => {
  return (
    <div className={`${cardBg} rounded-xl shadow-lg overflow-hidden flex flex-col h-full ${animationClass}`}>
      <div className="relative">
        <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
          {product.match}% Match
        </div>
        {product.discount && product.discount > 0 && (
          <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm">
            {product.discount}% OFF
          </div>
        )}
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-56 object-cover"
        />
      </div>
      <div className="p-6">
        <div className="mb-4">
          <h3 className={`text-xl font-bold mb-2 line-clamp-2 min-h-[3.5rem] ${textMain}`}>
            {product.title}
          </h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(product.rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-400'
                  }`}
                />
              ))}
            </div>
            <span className={`text-sm ${textMain}`}>
              ({product.reviews.toLocaleString()})
            </span>
          </div>
        </div>
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold ${textMain}`}>
              ${product.price?.toFixed(2)}
            </span>
            {product.originalPrice && product.originalPrice > (product.price || 0) && (
              <span className={`text-sm line-through ${textMain}`}>
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          <div className="text-sm text-green-400">{product.delivery}</div>
        </div>
        <div className="space-y-2 mb-4">
          {product.features.slice(0, 3).map((feature, idx) => (
            <div key={idx} className={`flex items-center text-sm ${textMain}`}>
              <div className="w-1 h-1 bg-blue-400 rounded-full mr-2"></div>
              {feature}
            </div>
          ))}
        </div>
        <div className="text-sm mb-4">
          <span className={product.stockStatus === "Limited Stock" ? "text-orange-400" : "text-green-400"}>
            {product.stockStatus}
          </span>
        </div>
        <div className="flex gap-2">
          <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </button>
          <button className={`p-2 border rounded-lg hover:bg-gray-700 transition-colors ${textMain}`}>
            <Heart className={`w-4 h-4 ${textMain}`} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
