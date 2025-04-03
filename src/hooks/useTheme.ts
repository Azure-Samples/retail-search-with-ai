import { useState } from 'react';

export interface ThemeStyles {
  bgMain: string;
  textMain: string;
  headerBg: string;
  cardBg: string;
  searchBg: string;
  placeholderColor: string;
  searchBtnStyle: string;
}

export function useTheme(initialDarkMode = true) {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(initialDarkMode);
  
  const themeStyles: ThemeStyles = {
    bgMain: isDarkMode ? "bg-gray-900" : "bg-white",
    textMain: isDarkMode ? "text-white" : "text-black",
    headerBg: isDarkMode ? "bg-gray-800 border-b border-gray-700" : "bg-gray-100 border-b border-gray-300",
    cardBg: isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-300",
    searchBg: isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-300",
    placeholderColor: isDarkMode ? "placeholder-gray-500" : "placeholder-gray-400",
    searchBtnStyle: isDarkMode 
      ? "bg-blue-600 hover:bg-blue-700 text-white" 
      : "bg-blue-200 hover:bg-blue-300 text-blue-900"
  };
  
  return {
    isDarkMode,
    setIsDarkMode,
    themeStyles
  };
}
