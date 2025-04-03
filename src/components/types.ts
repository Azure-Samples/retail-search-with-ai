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
  id: string;
  title: string;
  basePrice: number;
  brand: string;
  category: string;
  image?: string;
  features: string[];
  sustainability?: string;
  rating?: number;
  reviews?: number;
  price?: number;
  originalPrice?: number;
  discount?: number;
  match?: number;
  stockStatus?: string;
  delivery?: string;
  aiReasoning?: {
    text: string;
    confidenceScore: number;
    factors: Array<{
      factor: string;
      weight: number;
      description: string;
    }>;
  };
  standardRank?: number;
  aiRank?: number;
  rankChange?: number;
}

export type AnimationStates = {
  [key: string]: 'up' | 'down';
};