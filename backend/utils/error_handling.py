# app/utils/error_handling.py
from fastapi import Request
from fastapi.responses import JSONResponse
import logging
import traceback
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

class BaseAPIError(Exception):
    """Base class for API errors."""
    
    def __init__(self, status_code: int, message: str, error_code: str = None):
        self.status_code = status_code
        self.message = message
        self.error_code = error_code
        super().__init__(message)

class SearchError(BaseAPIError):
    """Error raised during search operations."""
    
    def __init__(self, message: str, error_code: str = "SEARCH_ERROR"):
        super().__init__(status_code=500, message=message, error_code=error_code)

class PersonaError(BaseAPIError):
    """Error raised for invalid personas."""
    
    def __init__(self, message: str, error_code: str = "PERSONA_ERROR"):
        super().__init__(status_code=400, message=message, error_code=error_code)

# Exception handlers
async def api_error_handler(request: Request, exc: BaseAPIError) -> JSONResponse:
    """Handle API errors."""
    logger.error(f"API error: {exc.message}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "message": exc.message,
            "error_code": exc.error_code
        }
    )

async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle general exceptions."""
    logger.error(f"Unhandled exception: {str(exc)}")
    logger.error(traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={
            "error": True,
            "message": "An unexpected error occurred",
            "error_code": "INTERNAL_SERVER_ERROR",
            "details": str(exc) if str(exc) else "No details available"
        }
    )

def setup_exception_handlers(app):
    """Set up exception handlers for the FastAPI app."""
    app.add_exception_handler(BaseAPIError, api_error_handler)
    app.add_exception_handler(Exception, general_exception_handler)

def _handle_api_error(self, e: Exception, operation: str) -> None:
    """
    Handle API errors with detailed logging and appropriate actions.
    
    Args:
        e: The exception that was raised
        operation: The name of the operation that failed
    
    Raises:
        SearchError: Raised with details about the error
    """
    from app.utils.error_handling import SearchError
    
    error_message = f"{operation} failed: {str(e)}"
    
    if hasattr(e, 'status_code'):
        if e.status_code == 429:
            error_message = f"{operation} rate limited: {str(e)}"
            # Could implement exponential backoff retry logic here
            logger.warning(f"Rate limit hit for {operation}, consider implementing retry logic")
        elif e.status_code >= 500:
            error_message = f"{operation} service error: {str(e)}"
        elif e.status_code >= 400:
            error_message = f"{operation} client error: {str(e)}"
    
    logger.error(error_message)
    raise SearchError(error_message)

# Example usage in azure_search.py:

async def standard_search(self, query: str, top: int = 50) -> List[Dict[str, Any]]:
    """
    Perform standard text search using Azure AI Search.
    
    Args:
        query: The search query string
        top: Maximum number of results to return
            
    Returns:
        List of search results
    """
    try:
        results = self.search_client.search(
            search_text=query,
            query_type=QueryType.SIMPLE,
            top=top
        )
        formatted_results = self._format_results(results)
        logger.info(f"Standard search for '{query}' returned {len(formatted_results)} results")
        return formatted_results
    except Exception as e:
        self._handle_api_error(e, f"Standard search for '{query}'")