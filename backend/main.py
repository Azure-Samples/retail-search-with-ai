# app/main.py
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
import logging
import asyncio
import time
from datetime import datetime
from typing import List

from config.settings import settings
from models.search import (
    SearchRequest, SearchResponse, ProgressUpdate
)
from models.user import UserPersona
from services.azure_search import AzureSearchService, CachedSearchService
from services.openai_service import OpenAIReasoningService
from services.progress_service import ProgressService
from services.search_service import SearchService
from utils.error_handling import setup_exception_handlers
from data.personas import load_personas

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
cached_azure_search = CachedSearchService(azure_search_service)
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
    Comprehensive health check endpoint that checks all dependencies.
    """
    health_status = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",  # Add version tracking
        "checks": {
            "azure_search": {
                "status": "unknown",
                "latency_ms": None
            },
            "openai": {
                "status": "unknown",
                "latency_ms": None
            }
        }
    }
    
    # Check Azure Search
    azure_start = time.time()
    try:
        # Simple query to check if Azure Search is responding
        await azure_search_service.standard_search("test", top=1)
        azure_latency = (time.time() - azure_start) * 1000
        health_status["checks"]["azure_search"]["status"] = "healthy"
        health_status["checks"]["azure_search"]["latency_ms"] = round(azure_latency, 2)
    except Exception as e:
        azure_latency = (time.time() - azure_start) * 1000
        health_status["checks"]["azure_search"]["status"] = "unhealthy"
        health_status["checks"]["azure_search"]["latency_ms"] = round(azure_latency, 2)
        health_status["checks"]["azure_search"]["error"] = str(e)
        health_status["status"] = "degraded"
        logger.error(f"Azure Search health check failed: {str(e)}")
    
    # Check OpenAI
    openai_start = time.time()
    try:
        # Simple query to check if OpenAI is responding
        first_persona = next(iter(personas.values()))
        await openai_service.rewrite_query("test query", first_persona)
        openai_latency = (time.time() - openai_start) * 1000
        health_status["checks"]["openai"]["status"] = "healthy"
        health_status["checks"]["openai"]["latency_ms"] = round(openai_latency, 2)
    except Exception as e:
        openai_latency = (time.time() - openai_start) * 1000
        health_status["checks"]["openai"]["status"] = "unhealthy"
        health_status["checks"]["openai"]["latency_ms"] = round(openai_latency, 2)
        health_status["checks"]["openai"]["error"] = str(e)
        health_status["status"] = "degraded"
        logger.error(f"OpenAI health check failed: {str(e)}")
    
    return health_status

@app.on_event("shutdown")
async def shutdown_event():
    """Handle graceful shutdown of the application."""
    logger.info("Shutting down application")
    
    # Cancel any running background tasks
    for task in asyncio.all_tasks():
        if task != asyncio.current_task() and not task.done():
            logger.info(f"Cancelling task: {task.get_name()}")
            task.cancel()
            try:
                await task
            except asyncio.CancelledError:
                logger.info(f"Task {task.get_name()} cancelled successfully")
            except Exception as e:
                logger.error(f"Error cancelling task {task.get_name()}: {str(e)}")
    
    logger.info("All tasks have been cancelled")

# Code to start the API service when script is run directly
if __name__ == "__main__":
    import uvicorn
    
    # Get host and port from settings or use defaults
    host = getattr(settings, "HOST", "0.0.0.0")
    port = getattr(settings, "PORT", 8000)
    
    # Start the Uvicorn server
    logger.info(f"Starting server on {host}:{port}")
    uvicorn.run(
        "main:app",  # Path to the app object
        host=host,
        port=port,
        reload=True,  # Enable auto-reload for development
        log_level="info"
    )