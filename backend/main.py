# app/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import logging
from typing import List

from app.config.settings import settings
from app.models.search import (
    SearchRequest, SearchResponse, ProgressUpdate
)
from app.models.user import UserPersona
from app.services.azure_search import AzureSearchService
from app.services.openai_service import OpenAIReasoningService
from app.services.progress_service import ProgressService
from app.services.search_service import SearchService
from app.utils.error_handling import setup_exception_handlers
from app.data.personas import load_personas

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="AI-Enhanced Product Search API",
    description="API for AI-enhanced product search with user persona customization",
    version="1.0.0"
)

# Initialize services
personas = load_personas()
azure_search_service = AzureSearchService()
openai_service = OpenAIReasoningService()
progress_service = ProgressService()
search_service = SearchService(
    azure_search_service=azure_search_service,
    openai_service=openai_service,
    progress_service=progress_service,
    personas=personas
)

# Set up exception handlers
setup_exception_handlers(app)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/search", response_model=str)
async def initiate_search(request: SearchRequest):
    """
    Initiate an asynchronous search and return a search ID for tracking progress.
    """
    logger.info(f"Initiating search for query: {request.query}")
    try:
        search_id = await search_service.search(request)
        return search_id
    except Exception as e:
        logger.error(f"Error initiating search: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/search/{search_id}", response_model=SearchResponse)
async def get_search_results(search_id: str):
    """
    Get the current results and progress for a search.
    """
    logger.info(f"Getting search results for ID: {search_id}")
    try:
        return await search_service.get_search_results(search_id)
    except Exception as e:
        logger.error(f"Error getting search results: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/search/{search_id}/progress", response_model=ProgressUpdate)
async def get_search_progress(search_id: str):
    """
    Get the current progress of a search.
    """
    logger.info(f"Getting search progress for ID: {search_id}")
    progress = progress_service.get_progress(search_id)
    if not progress:
        raise HTTPException(status_code=404, detail="Search not found")
    return progress

@app.get("/api/personas", response_model=List[UserPersona])
async def get_personas():
    """
    Get all available user personas.
    """
    logger.info("Getting available user personas")
    return list(personas.values())

@app.get("/health")
async def health_check():
    """
    Health check endpoint.
    """
    return {"status": "healthy"}