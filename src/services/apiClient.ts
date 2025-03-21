// src/services/apiClient.ts
import { SearchRequest, SearchResponse, ProgressUpdate, UserPersona } from '@/types/api';

// Define the base URL for the API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Client for interacting with the backend API
 */
export const apiClient = {
  /**
   * Initiates a search and returns a search ID
   */
  async initiateSearch(request: SearchRequest): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/api/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Search request failed: ${response.statusText}`);
    }

    return await response.json();
  },

  /**
   * Gets the current results for a search
   */
  async getSearchResults(searchId: string): Promise<SearchResponse> {
    const response = await fetch(`${API_BASE_URL}/api/search/${searchId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch search results: ${response.statusText}`);
    }

    return await response.json();
  },

  /**
   * Gets the current progress for a search
   */
  async getSearchProgress(searchId: string): Promise<ProgressUpdate> {
    const response = await fetch(`${API_BASE_URL}/api/search/${searchId}/progress`);

    if (!response.ok) {
      throw new Error(`Failed to fetch search progress: ${response.statusText}`);
    }

    return await response.json();
  },

  /**
   * Gets all available user personas
   */
  async getPersonas(): Promise<UserPersona[]> {
    const response = await fetch(`${API_BASE_URL}/api/personas`);

    if (!response.ok) {
      throw new Error(`Failed to fetch personas: ${response.statusText}`);
    }

    return await response.json();
  },

  /**
   * Gets the health status of the API
   */
  async getHealthStatus(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);

      if (!response.ok) {
        return { status: 'unhealthy', error: response.statusText };
      }

      return await response.json();
    } catch (error) {
      return { status: 'unhealthy', error: String(error) };
    }
  }
};