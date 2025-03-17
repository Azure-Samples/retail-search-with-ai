import React from 'react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import ProductCard from './ProductCard';
import { Product, AnimationStates } from '../types';

interface ProductGridProps {
  products: Product[];
  animationStates: AnimationStates;
  reasoningEnabled: boolean;
  setReasoningEnabled: (enabled: boolean) => void;
  handleReasoningToggle: () => void;
  getAnimationClasses: (productId: string | number) => string;
  cardBg: string;
  textMain: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  reasoningEnabled,
  handleReasoningToggle,
  getAnimationClasses,
  cardBg,
  textMain
}) => {
  // Debug info
  console.log("ProductGrid rendering with", products.length, "products");
  console.log("Sample product:", products[0]);
  
  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Switch
            id="reasoning-mode"
            checked={reasoningEnabled}
            onCheckedChange={handleReasoningToggle}
          />
          <Label htmlFor="reasoning-mode" className={`text-sm ${textMain}`}>
            Enable AI Reasoning
          </Label>
        </div>
        
        <div className={`text-sm ${textMain}`}>
          <p>Tip: Click on a product card or the rotate icon to see AI reasoning details</p>
        </div>
      </div>
      
      {/* Debug info display */}
      <div className={`mb-4 ${textMain}`}>
        <p>Debug: {products.length} products available</p>
      </div>
      
      {products.length === 0 ? (
        <div className={`p-4 border border-red-500 rounded ${textMain}`}>
          No products to display. Check product data.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" style={{minHeight: '500px'}}>
          {products.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              animationClass={getAnimationClasses(product.id)}
              cardBg={cardBg}
              textMain={textMain}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default ProductGrid;