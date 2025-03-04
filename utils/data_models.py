from pydantic import BaseModel
from typing import Optional, List, Literal


class ModelInfo(BaseModel):
    """
    Information about the multimodal model name.
    """
    model_name: Literal["gpt-4o", "o1", "o1-mini"]
    reasoning_efforts: Optional[Literal["low", "medium", "high"]] = "medium"    
