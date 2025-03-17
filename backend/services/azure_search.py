# app/services/azure_search.py
from typing import List, Dict, Any
import logging
from azure.core.credentials import AzureKeyCredential
from azure.search.documents import SearchClient
from azure.search.documents.models import VectorizableTextQuery, QueryType

from app.config.settings import settings

logger = logging.getLogger(__name__)

class AzureSearchService:
    """Service for handling Azure Search operations."""
    
    def __init__(self):
        """Initialize the Azure Search client."""
        try:
            self.search_client = SearchClient(
                endpoint=settings.AZURE_SEARCH_ENDPOINT,
                index_name=settings.AZURE_SEARCH_INDEX_NAME,
                credential=AzureKeyCredential(settings.AZURE_SEARCH_KEY)
            )
            logger.info("Azure Search client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Azure Search client: {str(e)}")
            raise
    
    async def standard_search(self, query: str, top: int = 50) -> List[Dict[str, Any]]:
        """
        Perform standard text search using Azure AI Search.
        
        Args:
            query: The search query string
            top: Maximum number of results to return
            
        Returns:
            List of search results
        """
        try:
            results = self.search_client.search(
                search_text=query,
                query_type=QueryType.SIMPLE,
                top=top
            )
            formatted_results = self._format_results(results)
            logger.info(f"Standard search for '{query}' returned {len(formatted_results)} results")
            return formatted_results
        except Exception as e:
            logger.error(f"Standard search failed: {str(e)}")
            raise
    
    async def vector_search(self, query: str, vector_fields: List[str], top: int = 50) -> List[Dict[str, Any]]:
        """
        Perform vector search using Azure AI Search.
        
        Args:
            query: The search query string
            vector_fields: List of fields to perform vector search on
            top: Maximum number of results to return
            
        Returns:
            List of search results
        """
        try:
            # Create vector queries for each field
            vector_queries = [
                VectorizableTextQuery(
                    text=query,
                    k_nearest_neighbors=50,
                    fields=[field],
                    exhaustive=True
                ) for field in vector_fields
            ]
            
            results = self.search_client.search(
                search_text=query,
                vector_queries=vector_queries,
                query_type=QueryType.SEMANTIC,
                top=top
            )
            formatted_results = self._format_results(results)
            logger.info(f"Vector search for '{query}' returned {len(formatted_results)} results")
            return formatted_results
        except Exception as e:
            logger.error(f"Vector search failed: {str(e)}")
            raise
    
    async def hybrid_search(self, query: str, vector_fields: List[str], top: int = 50) -> List[Dict[str, Any]]:
        """
        Perform hybrid search (text + vector) using Azure AI Search.
        
        Args:
            query: The search query string
            vector_fields: List of fields to perform vector search on
            top: Maximum number of results to return
            
        Returns:
            List of search results
        """
        try:
            text_results = await self.standard_search(query, top)
            vector_results = await self.vector_search(query, vector_fields, top)
            
            # Combine results using reciprocal rank fusion
            combined_results = self._reciprocal_rank_fusion([text_results, vector_results])
            logger.info(f"Hybrid search for '{query}' returned {len(combined_results)} results")
            return combined_results
        except Exception as e:
            logger.error(f"Hybrid search failed: {str(e)}")
            raise
    
    def _reciprocal_rank_fusion(self, result_sets: List[List[Dict[str, Any]]], k: int = 60) -> List[Dict[str, Any]]:
        """
        Combine multiple result sets using reciprocal rank fusion.
        
        RRF score = sum(1 / (k + r_i)) where r_i is the rank in result set i
        
        Args:
            result_sets: List of result sets to combine
            k: Constant to prevent division by zero and control impact of high ranks
            
        Returns:
            Combined list of search results
        """
        scores = {}
        id_to_item = {}
        
        for result_set in result_sets:
            for rank, item in enumerate(result_set):
                item_id = item['id']
                if item_id not in scores:
                    scores[item_id] = 0
                    id_to_item[item_id] = item
                    
                # Add reciprocal rank score
                scores[item_id] += 1.0 / (k + rank)
        
        # Create combined results
        combined_results = []
        for item_id, score in scores.items():
            item = id_to_item[item_id]
            item['score'] = score
            combined_results.append(item)
        
        # Sort by score
        combined_results.sort(key=lambda x: x['score'], reverse=True)
        return combined_results
    
    def _format_results(self, results) -> List[Dict[str, Any]]:
        """
        Format search results to match frontend expectations.
        
        Args:
            results: Raw search results
            
        Returns:
            Formatted search results
        """
        formatted_results = []
        
        for item in results:
            result = {
                "id": item.get("id", ""),
                "title": item.get("title", "Untitled Product"),
                "description": item.get("description", ""),
                "price": float(item.get("price", 0.0)),
                "img": item.get("image_url", ""),
                "brand": item.get("brand", ""),
                "category": item.get("category", ""),
                "features": item.get("features", []),
                "sustainability": item.get("sustainability", ""),
                "rating": float(item.get("rating", 0.0)),
                "reviews": int(item.get("reviews", 0)),
                "stockStatus": "In Stock",  # Default value
                "delivery": "Free Delivery"  # Default value
            }
            
            # Handle originalPrice and discount
            price = float(item.get("price", 0.0))
            if "original_price" in item:
                result["originalPrice"] = float(item.get("original_price", 0.0))
                
                # Calculate discount percentage if original price is greater than price
                if result["originalPrice"] > price and price > 0:
                    discount = ((result["originalPrice"] - price) / result["originalPrice"]) * 100
                    result["discount"] = int(discount)
            
            formatted_results.append(result)
            
        return formatted_results