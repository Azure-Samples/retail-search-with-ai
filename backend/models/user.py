# app/models/user.py
from pydantic import BaseModel, Field, validator
from typing import Optional

class UserPersonaPreferences(BaseModel):
    """User persona preferences model."""
    
    priceWeight: float
    qualityWeight: float
    brandWeight: float
    description: str
    
    @validator('priceWeight', 'qualityWeight', 'brandWeight')
    def weight_must_be_in_range(cls, v):
        if v < 0 or v > 1:
            raise ValueError('Weight must be between 0 and 1')
        return v

class UserPersona(BaseModel):
    """User persona model."""
    
    id: str
    name: str
    type: str
    avatar: str
    preferences: UserPersonaPreferences