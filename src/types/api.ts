// src/types/api.ts
import { SearchResult } from './search';
import { UserPersona } from '@/components/types';

export enum SearchProgress {
  INITIATED = 'initiated',
  STANDARD_SEARCH = 'standard_search',
  QUERY_REWRITING = 'query_rewriting',
  ENHANCED_SEARCH = 'enhanced_search',
  RERANKING = 'reranking',
  REASONING = 'reasoning',
  COMPLETE = 'complete',
  ERROR = 'error'
}

export interface ProgressUpdate {
  search_id: string;
  stage: SearchProgress;
  message: string;
  percentage: number;
}

export interface SearchSummaryAPI {
  totalProductCount: number;
  improvedRankCount: number;
  newProductCount: number;
  removedProductCount: number;
  averageRankImprovement: number;
}

export interface SearchRequest {
  query: string;
  customer: string; // ID of the user persona
  vectorSearchEnabled: boolean;
  rerankerEnabled: boolean;
  reasoningEnabled: boolean;
  model?: string;
}

export interface SearchResponse {
  search_id: string;
  progress: SearchProgress;
  standardResults: SearchResult[];
  aiResults: SearchResult[];
  summary?: SearchSummaryAPI;
}

// Re-export UserPersona for clarity
export type { UserPersona };