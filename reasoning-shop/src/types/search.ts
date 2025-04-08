export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  price: number;
  img?: string;
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
  metadata?: {
    vectorRank?: number;
    textRank?: number;
  };
  features?: string[];
  brand?: string;
  category?: string;
  sustainability?: string;
  rating?: number;
  reviews?: number;
}
