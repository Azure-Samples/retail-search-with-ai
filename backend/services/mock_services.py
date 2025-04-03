# mock_services.py
from typing import List, Dict, Any
import asyncio
import random
import json
from models.search import AIReasoning, AIReasoningFactor
from models.user import UserPersona

class MockAzureSearchService:
    """Mock implementation of Azure Search Service for testing."""
    
    async def standard_search(self, query: str, top: int = 50) -> List[Dict[str, Any]]:
        """Mock standard search implementation."""
        await asyncio.sleep(0.5)  # Simulate API delay
        
        # Generate mock results
        results = []
        for i in range(min(top, 10)):
            results.append({
                "id": f"product-{i+1}",
                "title": f"Mock Product {i+1} for '{query}'",
                "description": f"This is a mock product description for query '{query}'.",
                "price": round(random.uniform(50, 500), 2),
                "image_url": f"https://placehold.co/400x300/{random.randint(100, 999)}",
                "brand": f"Brand {chr(65 + i % 26)}",
                "category": "Electronics" if i % 3 == 0 else "Home & Kitchen" if i % 3 == 1 else "Sports",
                "features": [f"Feature {j+1}" for j in range(3)],
                "rating": round(random.uniform(3.0, 5.0), 1),
                "reviews": random.randint(10, 5000)
            })
        
        return results
    
    async def vector_search(self, query: str, vector_fields: List[str], top: int = 50) -> List[Dict[str, Any]]:
        """Mock vector search implementation."""
        # For mock implementation, just return slightly different results than standard search
        standard_results = await self.standard_search(query, top)
        
        # Shuffle the order to simulate different ranking
        random.shuffle(standard_results)
        
        # Add a vector search specific field
        for result in standard_results:
            result["vector_score"] = round(random.uniform(0.7, 0.99), 2)
        
        return standard_results
    
    async def hybrid_search(self, query: str, vector_fields: List[str], top: int = 50) -> List[Dict[str, Any]]:
        """Mock hybrid search implementation."""
        await asyncio.sleep(0.7)  # Simulate API delay
        
        # Mix of standard and vector results
        standard_results = await self.standard_search(query, top // 2)
        vector_results = await self.vector_search(query, vector_fields, top // 2)
        
        # Deduplicate by ID
        result_map = {r["id"]: r for r in standard_results + vector_results}
        
        # Convert back to list and limit to top
        combined_results = list(result_map.values())[:top]
        
        # Sort by a mock relevance score
        combined_results.sort(key=lambda x: random.random(), reverse=True)
        
        return combined_results

class MockOpenAIReasoningService:
    """Mock implementation of OpenAI Reasoning Service for testing."""
    
    async def rewrite_query(self, query: str, persona: UserPersona) -> str:
        """Mock query rewriting implementation."""
        await asyncio.sleep(0.5)  # Simulate API delay
        
        # Simple transformation based on persona
        if persona.preferences.priceWeight > 0.7:
            return f"{query} budget friendly"
        elif persona.preferences.qualityWeight > 0.7:
            return f"high quality {query}"
        elif persona.preferences.brandWeight > 0.7:
            return f"premium brand {query}"
        else:
            return query
    
    async def rerank_results(
        self, 
        results: List[Dict[str, Any]], 
        query: str, 
        persona: UserPersona
    ) -> List[Dict[str, Any]]:
        """Mock reranking implementation."""
        await asyncio.sleep(0.8)  # Simulate API delay
        
        # Sort based on persona preferences
        if persona.preferences.priceWeight > 0.7:
            # Price-sensitive - sort by lowest price
            results.sort(key=lambda x: x.get("price", 999999))
        elif persona.preferences.qualityWeight > 0.7:
            # Quality-focused - sort by highest rating
            results.sort(key=lambda x: x.get("rating", 0), reverse=True)
        elif persona.preferences.brandWeight > 0.7:
            # Brand-focused - prioritize well-known brands (mock implementation)
            # Just shuffle for the mock
            random.shuffle(results)
        else:
            # Balanced approach - just shuffle for the mock
            random.shuffle(results)
        
        return results
    
    async def generate_reasoning(
        self, 
        product: Dict[str, Any], 
        query: str, 
        persona: UserPersona
    ) -> AIReasoning:
        """Mock reasoning generation implementation."""
        await asyncio.sleep(0.3)  # Simulate API delay
        
        # Default confidence score
        confidence = random.randint(70, 95)
        
        # Generate reasoning text based on persona
        if persona.preferences.priceWeight > 0.7:
            text = f"This {product.get('brand', 'brand')} {product.get('title', 'product')} offers excellent value for money at ${product.get('price', '0')}. It matches your budget-conscious shopping preferences."
            factors = [
                AIReasoningFactor(
                    factor="Price point",
                    weight=random.randint(85, 95),
                    description=f"This product's price point aligns with your budget-conscious preferences."
                ),
                AIReasoningFactor(
                    factor="Value for money",
                    weight=random.randint(75, 90),
                    description=f"Offers good features relative to its price."
                ),
                AIReasoningFactor(
                    factor="Customer reviews",
                    weight=random.randint(60, 80),
                    description=f"Has {product.get('reviews', '100+')} verified customer reviews."
                )
            ]
        elif persona.preferences.qualityWeight > 0.7:
            text = f"The {product.get('brand', 'brand')} {product.get('title', 'product')} is highly rated at {product.get('rating', '4.5')} stars, indicating exceptional quality that matches your preference for premium products."
            factors = [
                AIReasoningFactor(
                    factor="Product quality",
                    weight=random.randint(85, 95),
                    description=f"High rating of {product.get('rating', '4.5')} stars from {product.get('reviews', '100+')} reviews."
                ),
                AIReasoningFactor(
                    factor="Feature set",
                    weight=random.randint(75, 90),
                    description=f"Comprehensive set of premium features."
                ),
                AIReasoningFactor(
                    factor="Build materials",
                    weight=random.randint(70, 85),
                    description=f"Made with high-quality, durable materials."
                )
            ]
        elif persona.preferences.brandWeight > 0.7:
            text = f"The {product.get('brand', 'brand')} is a respected brand in the {product.get('category', 'product')} category, making this {product.get('title', 'product')} a perfect match for your brand preferences."
            factors = [
                AIReasoningFactor(
                    factor="Brand reputation",
                    weight=random.randint(85, 95),
                    description=f"{product.get('brand', 'This brand')} is known for quality and reliability."
                ),
                AIReasoningFactor(
                    factor="Brand heritage",
                    weight=random.randint(70, 85),
                    description=f"Established brand with a strong history in this category."
                ),
                AIReasoningFactor(
                    factor="Brand value alignment",
                    weight=random.randint(75, 90),
                    description=f"Brand values align with your preferences."
                )
            ]
        else:
            text = f"This {product.get('brand', 'brand')} {product.get('title', 'product')} is a good all-around match for your '{query}' search, balancing quality, price, and features."
            factors = [
                AIReasoningFactor(
                    factor="Overall value",
                    weight=random.randint(75, 85),
                    description=f"Good balance of features, quality, and price."
                ),
                AIReasoningFactor(
                    factor="Search relevance",
                    weight=random.randint(80, 90),
                    description=f"Closely matches your search for '{query}'."
                ),
                AIReasoningFactor(
                    factor="Customer satisfaction",
                    weight=random.randint(70, 85),
                    description=f"{product.get('rating', '4.5')} star rating indicates customer satisfaction."
                )
            ]
        
        return AIReasoning(
            text=text,
            confidenceScore=confidence,
            factors=factors
        )