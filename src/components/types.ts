export interface UserPersona {
    id: string;
    name: string;
    type: string;
    avatar: string;
    preferences: {
      priceWeight: number;
      qualityWeight: number;
      brandWeight: number;
      description: string;
    };
  }
  
  export interface Product {
    id: string | number;
    title: string;
    basePrice?: number;
    price?: number;
    originalPrice?: number;
    discount?: number;
    brand: string;
    category: string;
    image: string;
    features: string[];
    sustainability: string;
    rating: number;
    reviews: number;
    match?: number;
    stockStatus?: string;
    delivery?: string;
    
    // New fields for AI reasoning
    aiReasoning?: {
      text: string;
      confidenceScore: number;
      factors: {
        factor: string;
        weight: number;
        description: string;
      }[];
    };
    standardRank?: number;
    aiRank?: number;
    rankChange?: number;
  }
  
  export interface AnimationStates {
    [key: string]: string;
  }
  
  export interface ReasoningFactor {
    factor: string;
    weight: number;
    description: string;
  }