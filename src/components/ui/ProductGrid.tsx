import React, { useState, useRef, useEffect } from 'react';
import { SearchResult } from '../../types/search';
import ProductCard from './ProductCard';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';

interface ProductGridProps {
  results: SearchResult[];
  previousResults?: SearchResult[];
  selectedStore: string;
  animationEnabled: boolean;
  isAIMode: boolean;
  isDarkMode?: boolean;
  cardBg?: string;
  textMain?: string;
  showRankChanges?: boolean;
}

interface PositionMap {
  [key: string]: DOMRect;
}

interface AnimationState {
  moved: boolean;
  direction: 'up' | 'down' | 'none';
  distance: number;
}

interface AnimationStates {
  [key: string]: AnimationState;
}

const ProductGrid: React.FC<ProductGridProps> = ({ 
  results, 
  previousResults = [], 
  selectedStore, 
  animationEnabled, 
  isAIMode,
  isDarkMode = false,
  cardBg,
  textMain,
  showRankChanges
}) => {
  // Store refs to product elements
  const productRefs = useRef<{ [key: string]: HTMLDivElement }>({});
  const [animationStates, setAnimationStates] = useState<AnimationStates>({});

  // Store previous positions when results change
  const positionsRef = useRef<PositionMap>({});

  // Calculate position changes and set up animations when switching between modes
  useEffect(() => {
    if (!animationEnabled || !results || !previousResults.length) return;

    // Get current positions of all elements
    const currentPositions: PositionMap = {};
    Object.keys(productRefs.current).forEach((id) => {
      const element = productRefs.current[id];
      if (element) {
        currentPositions[id] = element.getBoundingClientRect();
      }
    });

    // Compare with previous positions and set up animations
    setTimeout(() => {
      const newAnimationStates: AnimationStates = {};
      
      // For each product element that exists now
      Object.keys(productRefs.current).forEach((id) => {
        const element = productRefs.current[id];
        if (element && positionsRef.current[id]) {
          const previousRect = positionsRef.current[id];
          const currentRect = element.getBoundingClientRect();
          
          // Calculate vertical movement
          const deltaY = previousRect.top - currentRect.top;
          const absDeltaY = Math.abs(deltaY);
          
          // Save animation state for this element
          newAnimationStates[id] = {
            moved: absDeltaY > 5,  // Threshold to avoid minor layout shifts
            direction: deltaY > 0 ? 'up' : deltaY < 0 ? 'down' : 'none',
            distance: absDeltaY
          };
          
          // Apply FLIP animation technique
          if (absDeltaY > 5) {
            // First: element is in its old position
            // Last: record final position (done with getBoundingClientRect)
            // Invert: apply transform to appear to be in old position
            element.style.transform = `translateY(${-deltaY}px)`;
            element.style.transition = 'none';
            
            // Force reflow to ensure the transform is applied
            element.offsetHeight;
            
            // Play: animate to the final position
            element.style.transform = '';
            element.style.transition = 'transform 0.5s ease-out';
          }
        }
      });
      
      setAnimationStates(newAnimationStates);
      positionsRef.current = currentPositions;
    }, 10);
  }, [results, previousResults, animationEnabled]);

  // Find vector and text rank for display
  const getVectorAndTextRanks = (result: SearchResult) => {
    const vectorRank = result.metadata?.vectorRank ?? null;
    const textRank = result.metadata?.textRank ?? null;
    return { vectorRank, textRank };
  };

  // Guard against undefined results
  if (!results || results.length === 0) {
    return <div className={`p-4 text-center ${textMain}`}>No results to display</div>;
  }

  const bgClass = isDarkMode ? 'bg-gray-900' : 'bg-white';

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 ${bgClass}`}>
      {results.map((result, index) => {
        const { vectorRank, textRank } = getVectorAndTextRanks(result);
        const animState = animationStates[result.id];
        
        return (
          <div 
            key={result.id}
            ref={el => {
              if (el) productRefs.current[result.id] = el;
            }}
            className={`relative ${bgClass}`}
          >
            {animationEnabled && animState?.moved && (
              <div className={`absolute -top-6 right-2 flex items-center ${
                animState.direction === 'up' ? 'text-green-500' : 'text-red-500'
              }`}>
                {animState.direction === 'up' && <ArrowUpIcon className="w-4 h-4 mr-1" />}
                {animState.direction === 'down' && <ArrowDownIcon className="w-4 h-4 mr-1" />}
                <span className="text-xs font-medium">{Math.round(animState.distance / 10)} positions</span>
              </div>
            )}
            
            <ProductCard 
              result={result} 
              selectedStore={selectedStore}
              vectorRank={vectorRank}
              textRank={textRank}
              rankChange={animState?.moved ? (animState.direction === 'up' ? Math.round(animState.distance / 10) : -Math.round(animState.distance / 10)) : 0}
              isAIMode={isAIMode}
              isDarkMode={isDarkMode}
              cardBg={cardBg}
              textMain={textMain}
              showRankChange={showRankChanges || (animState?.moved && animationEnabled)} 
            />
          </div>
        );
      })}
    </div>
  );
};

export default ProductGrid;