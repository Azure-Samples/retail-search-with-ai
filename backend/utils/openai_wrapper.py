import os
import time
from typing import Dict, Any, List, Optional, Union
import openai
from openai import AzureOpenAI, OpenAI
import json
import logging
import asyncio
from functools import wraps

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger('openai_wrapper')

def async_wrap(func):
    """Wrapper to run sync functions in executor"""
    @wraps(func)
    async def run(*args, **kwargs):
        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(None, lambda: func(*args, **kwargs))
    return run

class OpenAIWrapper:
    """
    Wrapper for OpenAI API that includes cost calculation.
    """
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the OpenAI wrapper.
        
        Args:
            api_key: OpenAI API key (defaults to OPENAI_API_KEY environment variable)
        """
        self.api_key = api_key or os.environ.get("AZURE_OPENAI_KEY") or os.environ.get("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OpenAI API key is required")
        
        # Check if Azure OpenAI is configured
        self.azure_endpoint = os.environ.get("AZURE_OPENAI_ENDPOINT")
        self.azure_api_version = os.environ.get("AZURE_OPENAI_API_VERSION", "2023-05-15")
        
        # Initialize the appropriate client based on available configuration
        if self.azure_endpoint:
            print(f"Using Azure OpenAI endpoint: {self.azure_endpoint}")
            self.client = AzureOpenAI(
                azure_endpoint=self.azure_endpoint,
                api_key=self.api_key,
                api_version=self.azure_api_version
            )
            self.is_azure = True
        else:
            print("Using standard OpenAI API")
            self.client = OpenAI(api_key=self.api_key)
            self.is_azure = False
        
        # Load pricing configuration
        self.pricing = self._load_pricing_config()
    
    def _load_pricing_config(self) -> Dict:
        """Load pricing configuration."""
        # Default pricing for common models (per million tokens)
        return {
            "gpt-4.5": {"input": 75.0, "output": 150.0},
            "gpt-4o": {"input": 2.5, "output": 10.0},
            "gpt-4o-mini": {"input": 0.15, "output": 0.6},
            "o1": {"input": 15.0, "output": 60.0},
            "o3-mini": {"input": 1.1, "output": 4.4},
            "gpt-3.5-turbo": {"input": 0.5, "output": 1.5},
            "gpt-4": {"input": 30.0, "output": 60.0}
        }
    
    def _calculate_cost(self, model: str, usage: Dict[str, int], is_cached: bool = False) -> Dict[str, Any]:
        """
        Calculate cost based on usage information from the API response.
        """
        # Find the right pricing model
        pricing_model = model
        for prefix in self.pricing:
            if model.startswith(prefix):
                pricing_model = prefix
                break
        
        pricing = self.pricing.get(pricing_model)
        if not pricing:
            pricing = {"input": 1.0, "output": 2.0}  # Default fallback
            print(f"Warning: No pricing found for model {model}. Using default pricing.")
        
        # Extract token counts
        input_tokens = usage.get("prompt_tokens", 0)
        output_tokens = usage.get("completion_tokens", 0)
        total_tokens = usage.get("total_tokens", 0) or (input_tokens + output_tokens)
        
        # Calculate costs (per million tokens)
        input_cost = (input_tokens / 1_000_000) * pricing["input"]
        output_cost = (output_tokens / 1_000_000) * pricing["output"]
        total_cost = input_cost + output_cost
        
        # Debug print - this will show in your console regardless of logging settings
        # print(f"\n===== COST CALCULATION =====")
        # print(f"Model: {model}")
        # print(f"Input tokens: {input_tokens}")
        # print(f"Output tokens: {output_tokens}")
        # print(f"Total tokens: {total_tokens}")
        # print(f"Cost: ${total_cost:.6f} USD")
        # print("============================\n")
        
        return {
            "model": model,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "total_tokens": total_tokens,
            "input_cost": input_cost,
            "output_cost": output_cost,
            "total_cost": total_cost,
            "currency": "USD",
            "pricing_details": {
                "input_price_per_million": pricing["input"],
                "output_price_per_million": pricing["output"]
            }
        }
    
    async def chat_completion(self, 
                      model: str, 
                      messages: List[Dict],
                      temperature: float = 1.0,
                      max_tokens: Optional[int] = None,
                      **kwargs) -> Dict[str, Any]:
        """
        Create a chat completion with cost tracking.
        Async version of the method.
        """
        start_time = time.time()
        
        # Print debug info
        logger.info(f"Making API request to {'Azure OpenAI' if self.is_azure else 'OpenAI'}")
        logger.info(f"Model: {model}")
        
        try:
            # Run the API call in thread executor to avoid blocking
            loop = asyncio.get_running_loop()
            response = await loop.run_in_executor(
                None, 
                lambda: self.client.chat.completions.create(
                    model=model,
                    messages=messages,
                    temperature=temperature,
                    max_tokens=max_tokens,
                    **kwargs
                )
            )
            
            # Debug print to console - always visible
            if hasattr(response, 'usage'):
                logger.info("\n===== RAW OPENAI USAGE DATA =====")
                logger.info(f"Prompt tokens: {response.usage.prompt_tokens}")
                logger.info(f"Completion tokens: {response.usage.completion_tokens}")
                logger.info(f"Total tokens: {response.usage.total_tokens}")
                logger.info("=================================\n")
            
            # Calculate cost based on usage reported by the API
            cost_info = None
            if hasattr(response, 'usage') and response.usage:
                usage = {
                    "prompt_tokens": getattr(response.usage, "prompt_tokens", 0),
                    "completion_tokens": getattr(response.usage, "completion_tokens", 0),
                    "total_tokens": getattr(response.usage, "total_tokens", 0)
                }
                
                cost_info = self._calculate_cost(model=model, usage=usage)
                
                # Log the cost information
                logger.info("\n===== OPENAI API COST =====")
                logger.info(f"Model: {cost_info['model']}")
                logger.info(f"Input tokens: {cost_info['input_tokens']}")
                logger.info(f"Output tokens: {cost_info['output_tokens']}")
                logger.info(f"Total tokens: {cost_info['total_tokens']}")
                logger.info(f"Cost: ${cost_info['total_cost']:.6f} USD")
                logger.info(f"Request time: {(time.time() - start_time):.2f}s")
                logger.info("==========================\n")
                
            # Convert response to dict for modification
            response_dict = self._response_to_dict(response)
            
            # Add usage information directly to the response for easier access
            if hasattr(response, 'usage'):
                response_dict["usage"] = {
                    "prompt_tokens": getattr(response.usage, "prompt_tokens", 0),
                    "completion_tokens": getattr(response.usage, "completion_tokens", 0),
                    "total_tokens": getattr(response.usage, "total_tokens", 0)
                }
            
            # Add cost information to response under both key formats for compatibility
            if cost_info:
                response_dict["cost_info"] = cost_info
                response_dict["costInfo"] = cost_info
                
                # Also add directly to the top level for easier access
                response_dict["total_tokens"] = cost_info["total_tokens"]
                response_dict["total_cost"] = cost_info["total_cost"]
            
            return response_dict
            
        except Exception as e:
            logger.error(f"Error in chat completion: {str(e)}")
            raise
    
    def _response_to_dict(self, response) -> Dict:
        """
        Convert an OpenAI API response object to a dictionary.
        """
        if isinstance(response, dict):
            return response
        
        # Convert response object to dict
        try:
            return response.model_dump()
        except AttributeError:
            # Fallback for different response object structures
            response_dict = {
                "id": getattr(response, "id", None),
                "object": getattr(response, "object", None),
                "created": getattr(response, "created", None),
                "model": getattr(response, "model", None),
                "choices": [],
                "usage": {}
            }
            
            # Extract choices
            if hasattr(response, "choices"):
                for choice in response.choices:
                    choice_dict = {
                        "index": getattr(choice, "index", 0),
                        "message": {
                            "role": getattr(choice.message, "role", "assistant") if hasattr(choice, "message") else "assistant",
                            "content": getattr(choice.message, "content", "") if hasattr(choice, "message") else ""
                        },
                        "finish_reason": getattr(choice, "finish_reason", None)
                    }
                    response_dict["choices"].append(choice_dict)
            
            # Extract usage
            if hasattr(response, "usage"):
                response_dict["usage"] = {
                    "prompt_tokens": getattr(response.usage, "prompt_tokens", 0),
                    "completion_tokens": getattr(response.usage, "completion_tokens", 0),
                    "total_tokens": getattr(response.usage, "total_tokens", 0)
                }
                
            return response_dict
