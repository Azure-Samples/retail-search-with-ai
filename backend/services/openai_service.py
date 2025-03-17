# app/services/openai_service.py
from typing import Dict, List, Any
import json
import logging
import asyncio
from openai import AsyncAzureOpenAI
from config.settings import settings
from models.user import UserPersona
from models.search import AIReasoning, AIReasoningFactor

logger = logging.getLogger(__name__)

class OpenAIReasoningService:
    """Service for OpenAI reasoning operations."""
    
    def __init__(self):
        """Initialize the OpenAI client."""
        try:
            self.client = AsyncAzureOpenAI(
                azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
                api_key=settings.AZURE_OPENAI_KEY,
                api_version=settings.AZURE_OPENAI_API_VERSION
            )
            self.model = settings.AZURE_OPENAI_MODEL
            logger.info("OpenAI client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize OpenAI client: {str(e)}")
            raise
    
    async def rewrite_query(self, query: str, persona: UserPersona) -> str:
        """
        Rewrite the query to improve search results based on user persona.
        
        Args:
            query: Original search query
            persona: User persona
            
        Returns:
            Rewritten query
        """
        try:
            prompt = f"""
            You are an expert search query optimizer. Rewrite the following search query to improve
            product search results. Consider the user's preferences when rewriting the query.
            
            Original query: {query}
            
            User preferences:
            - Price sensitivity: {persona.preferences.priceWeight * 10}/10
            - Quality importance: {persona.preferences.qualityWeight * 10}/10
            - Brand importance: {persona.preferences.brandWeight * 10}/10
            - Description: {persona.preferences.description}
            
            Return only the rewritten query without explanation.
            """
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=100
            )
            
            rewritten_query = response.choices[0].message.content.strip()
            logger.info(f"Rewrote query '{query}' to '{rewritten_query}'")
            return rewritten_query
        except Exception as e:
            logger.error(f"Query rewriting failed: {str(e)}")
            # If rewriting fails, return the original query
            return query
    
    async def rerank_results(
        self, 
        results: List[Dict[str, Any]], 
        query: str, 
        persona: UserPersona
    ) -> List[Dict[str, Any]]:
        """
        Rerank search results based on user persona using OpenAI.
        
        Args:
            results: List of search results
            query: Search query
            persona: User persona
            
        Returns:
            Reranked search results
        """
        try:
            # Format results for the prompt - limit to top 20 for reasonable prompt size
            results_to_rerank = results[:20] if len(results) > 20 else results
            
            results_text = "\n".join([
                f"ID: {r['id']}, Title: {r['title']}, Brand: {r.get('brand', 'Unknown')}, "
                f"Price: ${r.get('price', 0)}, Category: {r.get('category', 'General')}"
                for r in results_to_rerank
            ])
            
            prompt = f"""
            You are an expert product recommendation system. Rerank the following product search results 
            based on the user's preferences and the search query.
            
            Search query: {query}
            
            User preferences:
            - Price sensitivity: {persona.preferences.priceWeight * 10}/10
            - Quality importance: {persona.preferences.qualityWeight * 10}/10
            - Brand importance: {persona.preferences.brandWeight * 10}/10
            - Description: {persona.preferences.description}
            
            Products:
            {results_text}
            
            Return a JSON array of product IDs in order of relevance to the user. Only include the IDs, nothing else.
            Format: {{"product_ids": ["id1", "id2", "id3", ...]}}
            """
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                response_format={"type": "json_object"}
            )
            
            try:
                reranked_ids = json.loads(response.choices[0].message.content)["product_ids"]
                
                # Create a map of IDs to original results
                results_map = {r["id"]: r for r in results}
                
                # Reorder results based on reranked IDs
                reranked_results = []
                
                # First add all reranked products
                for product_id in reranked_ids:
                    if product_id in results_map:
                        reranked_results.append(results_map[product_id])
                        del results_map[product_id]
                
                # Then add any remaining products
                for remaining_product in results_map.values():
                    reranked_results.append(remaining_product)
                    
                logger.info(f"Reranked {len(reranked_results)} products")
                return reranked_results
                
            except (json.JSONDecodeError, KeyError) as e:
                logger.error(f"Error parsing reranking response: {str(e)}")
                return results
                
        except Exception as e:
            logger.error(f"Reranking failed: {str(e)}")
            # If reranking fails, return the original results
            return results
    
    async def generate_reasoning(
        self, 
        product: Dict[str, Any], 
        query: str, 
        persona: UserPersona
    ) -> AIReasoning:
        """
        Generate AI reasoning for why a product matches the user's persona.
        
        Args:
            product: Product information
            query: Search query
            persona: User persona
            
        Returns:
            AI reasoning
        """
        try:
            prompt = f"""
            You are an expert shopping assistant that explains product recommendations.
            Explain why the following product would be a good match for this user based on their preferences.
            
            Product:
            - Title: {product['title']}
            - Brand: {product.get('brand', 'Unknown')}
            - Price: ${product.get('price', 0)}
            - Category: {product.get('category', 'General')}
            - Features: {', '.join(product.get('features', [])[:3]) if product.get('features') else 'None listed'}
            - Rating: {product.get('rating', 0)} out of 5 ({product.get('reviews', 0)} reviews)
            
            User preferences:
            - Price sensitivity: {persona.preferences.priceWeight * 10}/10
            - Quality importance: {persona.preferences.qualityWeight * 10}/10
            - Brand importance: {persona.preferences.brandWeight * 10}/10
            - Description: {persona.preferences.description}
            
            Search query: {query}
            
            Return a JSON object with the following structure:
            {{
                "text": "Brief explanation of why this product matches the user (2-3 sentences)",
                "confidenceScore": 0-100,
                "factors": [
                    {{
                        "factor": "Factor name",
                        "weight": 0-100,
                        "description": "Brief explanation of this factor"
                    }},
                    ...at least 2 more factors...
                ]
            }}
            """
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                response_format={"type": "json_object"}
            )
            
            try:
                reasoning_data = json.loads(response.choices[0].message.content)
                
                # Create AIReasoning object
                factors = [
                    AIReasoningFactor(
                        factor=factor["factor"],
                        weight=factor["weight"],
                        description=factor["description"]
                    )
                    for factor in reasoning_data["factors"]
                ]
                
                reasoning = AIReasoning(
                    text=reasoning_data["text"],
                    confidenceScore=reasoning_data["confidenceScore"],
                    factors=factors
                )
                
                logger.info(f"Generated reasoning for product {product['id']}")
                return reasoning
                
            except (json.JSONDecodeError, KeyError) as e:
                logger.error(f"Error parsing reasoning response: {str(e)}")
                # Return a default reasoning if parsing fails
                return self._default_reasoning(product, query)
                
        except Exception as e:
            logger.error(f"Reasoning generation failed: {str(e)}")
            # Return default reasoning if generation fails
            return self._default_reasoning(product, query)
    
    def _default_reasoning(self, product: Dict[str, Any], query: str) -> AIReasoning:
        """
        Generate default reasoning when OpenAI reasoning fails.
        
        Args:
            product: Product information
            query: Search query
            
        Returns:
            Default AI reasoning
        """
        return AIReasoning(
            text=f"This {product.get('brand', 'brand')} {product['title']} matches your search for '{query}'.",
            confidenceScore=75,
            factors=[
                AIReasoningFactor(
                    factor="Brand reputation",
                    weight=80,
                    description=f"The {product.get('brand', 'brand')} brand has a solid reputation."
                ),
                AIReasoningFactor(
                    factor="Price point",
                    weight=75,
                    description=f"This product's price of ${product.get('price', 0)} fits your budget considerations."
                ),
                AIReasoningFactor(
                    factor="Customer ratings",
                    weight=85,
                    description=f"With {product.get('rating', '4')} stars from {product.get('reviews', '100+')} reviews, this product has proven quality."
                )
            ]
        )