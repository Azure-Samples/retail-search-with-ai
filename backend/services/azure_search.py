# services/azure_search.py
from typing import List, Dict, Any
import logging
from azure.core.credentials import AzureKeyCredential
from azure.search.documents import SearchClient
from azure.search.documents.models import VectorizableTextQuery, QueryType
from functools import lru_cache
import hashlib
import json
from config.settings import settings
from utils.error_handling import SearchError

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
    
    def _handle_api_error(self, e: Exception, operation: str) -> None:
        """
        Handle API errors with detailed logging and appropriate actions.
        
        Args:
            e: The exception that was raised
            operation: The name of the operation that failed
        
        Raises:
            SearchError: Raised with details about the error
        """
        error_message = f"{operation} failed: {str(e)}"
        
        if hasattr(e, 'status_code'):
            if e.status_code == 429:
                error_message = f"{operation} rate limited: {str(e)}"
                # Could implement exponential backoff retry logic here
                logger.warning(f"Rate limit hit for {operation}, consider implementing retry logic")
            elif e.status_code >= 500:
                error_message = f"{operation} service error: {str(e)}"
            elif e.status_code >= 400:
                error_message = f"{operation} client error: {str(e)}"
        
        logger.error(error_message)
        raise SearchError(error_message)
    
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
            self._handle_api_error(e, f"Standard search for '{query}'")
    
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
                    fields=field,  # Changed from [field] to just field
                    exhaustive=True
                ) for field in vector_fields
            ]
            
            results = self.search_client.search(
                search_text=query,
                vector_queries=vector_queries,
                query_type=QueryType.SEMANTIC,
                semantic_configuration_name="semantic-config",
                top=top
            )
            formatted_results = self._format_results(results)
            logger.info(f"Vector search for '{query}' returned {len(formatted_results)} results")
            return formatted_results
        except Exception as e:
            self._handle_api_error(e, f"Vector search for '{query}'")
    
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
            self._handle_api_error(e, f"Hybrid search for '{query}'")
    
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


class CachedSearchService:
    """Wrapper for search service with caching capabilities."""
    
    def __init__(self, search_service):
        """
        Initialize with a reference to the underlying search service.
        
        Args:
            search_service: The search service to wrap with caching
        """
        self.search_service = search_service
        self.cache_hits = 0
        self.cache_misses = 0
    
    def _generate_cache_key(self, query: str, **kwargs) -> str:
        """
        Generate a deterministic cache key from query and parameters.
        
        Args:
            query: The search query
            **kwargs: Additional parameters affecting the search
            
        Returns:
            A hash string to use as cache key
        """
        # Create a dictionary of all parameters
        key_dict = {"query": query}
        key_dict.update(kwargs)
        
        # Convert to a stable string representation
        key_str = json.dumps(key_dict, sort_keys=True)
        
        # Generate hash
        return hashlib.md5(key_str.encode()).hexdigest()
    
    @lru_cache(maxsize=100)
    async def cached_standard_search(self, query: str, top: int = 50) -> List[Dict[str, Any]]:
        """
        Cached version of standard search.
        
        Args:
            query: The search query string
            top: Maximum number of results to return
                
        Returns:
            List of search results
        """
        # This is just for metrics - the actual caching is handled by lru_cache
        cache_key = self._generate_cache_key(query, top=top)
        logger.debug(f"Cache key for standard search: {cache_key}")
        
        self.cache_misses += 1
        results = await self.search_service.standard_search(query, top)
        return results
    
    # Add cached versions of other search methods as needed
    @lru_cache(maxsize=100)
    async def cached_vector_search(self, query: str, vector_fields_str: str, top: int = 50) -> List[Dict[str, Any]]:
        """
        Cached version of vector search.
        
        Args:
            query: The search query string
            vector_fields_str: Comma-separated string of vector fields
            top: Maximum number of results to return
                
        Returns:
            List of search results
        """
        # Convert string to list for the actual method call
        vector_fields = vector_fields_str.split(',')
        
        cache_key = self._generate_cache_key(query, vector_fields=vector_fields_str, top=top)
        logger.debug(f"Cache key for vector search: {cache_key}")
        
        self.cache_misses += 1
        results = await self.search_service.vector_search(query, vector_fields, top)
        return results
    
    @lru_cache(maxsize=100)
    async def cached_hybrid_search(self, query: str, vector_fields_str: str, top: int = 50) -> List[Dict[str, Any]]:
        """
        Cached version of hybrid search.
        
        Args:
            query: The search query string
            vector_fields_str: Comma-separated string of vector fields
            top: Maximum number of results to return
                
        Returns:
            List of search results
        """
        # Convert string to list for the actual method call
        vector_fields = vector_fields_str.split(',')
        
        cache_key = self._generate_cache_key(query, vector_fields=vector_fields_str, top=top)
        logger.debug(f"Cache key for hybrid search: {cache_key}")
        
        self.cache_misses += 1
        results = await self.search_service.hybrid_search(query, vector_fields, top)
        return results