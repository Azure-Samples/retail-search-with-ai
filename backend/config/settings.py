# app/config/settings.py
from pydantic_settings import BaseSettings
from typing import List, Optional

class Settings(BaseSettings):
    # Azure Search Settings
    AZURE_SEARCH_ENDPOINT: str
    AZURE_SEARCH_KEY: str
    AZURE_SEARCH_INDEX_NAME: str
    
    # Azure OpenAI Settings
    AZURE_OPENAI_ENDPOINT: str
    AZURE_OPENAI_KEY: str
    AZURE_OPENAI_MODEL: str = "gpt-4o-mini"
    AZURE_OPENAI_API_VERSION: str = "2024-02-01"
    
    # Application Settings
    VECTOR_FIELDS: str = "titleVector,descriptionVector,brandVector"
    ENABLE_CORS: bool = True
    
    class Config:
        env_file = ".env"
    
    @property
    def vector_fields_list(self) -> List[str]:
        return self.VECTOR_FIELDS.split(",")

settings = Settings()