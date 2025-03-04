from pydantic import BaseModel
from typing import Optional, List, Literal, Union, Any, Dict



# Pydantic Models
class SearchFilter(BaseModel):
    title: List[str]
    brand: List[str]
    description: List[str]
    categories: List[str]

class SearchPrice(BaseModel):
    ge: Union[int, float, None]
    lte: Union[int, float, None]

class ExpandedSearch(BaseModel):
    expanded_terms: List[str]
    filters: SearchFilter = None
    price: SearchPrice = None

class SearchResults(BaseModel):
    product_ids: List[str]
    justification: str


# Extended Request model to handle compare + left_model
class RetailSearch(BaseModel):
    query: str
    customer: str
    model_name: Literal["o3-mini-high", 
                        "o3-mini-medium",
                        "o3-mini-low",
                        "o1-mini", 
                        "o1-low", 
                        "o1-medium",
                        "o1-high",
                        "gpt-4o", 
                        "gpt-45", 
                        "no-llm"] = "o3-mini-medium"



# Extended Request model to handle compare + left_model
class SearchRequest(BaseModel):
    query: str
    customer: Any
    reasoning_effort: str  # 'low', 'medium', 'high', 'mini' etc.
    compare: bool = False
    left_model: Optional[str] = "no-llm"


# Extended Request model to handle compare + left_model
class SearchConfig(BaseModel):
    query: str
    customer_profile: Dict
    model_name: Literal["o3-mini", "o1-mini", "o1", "gpt-4o", "gpt-45", "no-llm"] = "o3-mini"
    reasoning_effort: Literal['low', 'medium', 'high']      
    
    