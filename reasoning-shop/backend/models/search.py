# app/models/search.py
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum

class SearchProgress(str, Enum):
    INITIATED = "initiated"
    STANDARD_SEARCH = "standard_search"
    QUERY_REWRITING = "query_rewriting"
    ENHANCED_SEARCH = "enhanced_search"
    RERANKING = "reranking"
    REASONING = "reasoning"
    COMPLETE = "complete"
    ERROR = "error"

class AIReasoningFactor(BaseModel):
    factor: str
    weight: int  # 0-100 scale
    description: str

class AIReasoning(BaseModel):
    text: str
    confidenceScore: int  # 0-100 scale
    factors: List[AIReasoningFactor]

class SearchResult(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    price: float
    img: Optional[str] = None
    originalPrice: Optional[float] = None
    discount: Optional[int] = None
    brand: Optional[str] = None
    category: Optional[str] = None
    features: List[str] = Field(default_factory=list)
    sustainability: Optional[str] = None
    rating: Optional[float] = None
    reviews: Optional[int] = None
    match: Optional[int] = None
    stockStatus: Optional[str] = None
    delivery: Optional[str] = None
    standardRank: Optional[int] = None
    aiRank: Optional[int] = None
    rankChange: Optional[int] = None
    aiReasoning: Optional[AIReasoning] = None
    metadata: Optional[Dict[str, Any]] = None

class SearchSummary(BaseModel):
    totalProductCount: int
    improvedRankCount: int
    newProductCount: int
    removedProductCount: int
    averageRankImprovement: float

class ProgressUpdate(BaseModel):
    search_id: str
    stage: SearchProgress
    message: str
    percentage: int = 0

class SearchRequest(BaseModel):
    query: str
    customer: str  # ID of the user persona
    vectorSearchEnabled: bool = True
    rerankerEnabled: bool = True
    reasoningEnabled: bool = True
    model: str = "gpt-4o-mini"

class SearchResponse(BaseModel):
    search_id: str
    progress: SearchProgress
    standardResults: List[SearchResult] = Field(default_factory=list)
    aiResults: List[SearchResult] = Field(default_factory=list)
    summary: Optional[SearchSummary] = None