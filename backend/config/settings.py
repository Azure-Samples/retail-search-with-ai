# config/settings.py
from pydantic_settings import BaseSettings
from typing import List, Optional
from dotenv import load_dotenv
import os
import pathlib

# Determine the project root directory (where the .env file should be)
BASE_DIR = pathlib.Path(__file__).parent.parent  # This goes up one level from the config directory
ENV_FILE = BASE_DIR / ".env"

# Ensure .env file is loaded with explicit path
load_dotenv(dotenv_path=ENV_FILE)


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
    
    # Server settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"  # Allow extra fields in settings
    
    @property
    def vector_fields_list(self) -> List[str]:
        return self.VECTOR_FIELDS.split(",")

settings = Settings()