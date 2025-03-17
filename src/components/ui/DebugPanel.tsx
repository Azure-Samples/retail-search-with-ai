import React from 'react';
import { Product } from '../types';
import { ThemeStyles } from '../../hooks/useTheme';

interface DebugPanelProps {
  debug: string;
  products: Product[];
  isDarkMode: boolean;
  themeStyles: ThemeStyles;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ 
  debug, 
  products, 
  isDarkMode,
  themeStyles
}) => {
  const { textMain } = themeStyles;

  return (
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
  );
};

export default DebugPanel;
