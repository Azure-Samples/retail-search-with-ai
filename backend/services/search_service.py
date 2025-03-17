# services/search_service.py
from typing import Dict, List, Any, Tuple
import logging
import asyncio
from models.search import (
    SearchRequest, SearchResponse, SearchResult, SearchSummary, SearchProgress
)
from models.user import UserPersona
from services.azure_search import AzureSearchService
from services.openai_service import OpenAIReasoningService
from services.progress_service import ProgressService

logger = logging.getLogger(__name__)

class SearchService:
    """Main service orchestrating the search process."""
    
    def __init__(
        self, 
        azure_search_service: AzureSearchService,
        openai_service: OpenAIReasoningService,
        progress_service: ProgressService,
        personas: Dict[str, UserPersona]
    ):
        """Initialize the search service with required dependencies."""
        self.azure_search = azure_search_service
        self.openai = openai_service
        self.progress = progress_service
        self.personas = personas
        # Store completed search results
        self.completed_searches: Dict[str, SearchResponse] = {}
        # Store in-progress search results
        self.in_progress_searches: Dict[str, Dict[str, Any]] = {}
    
    def get_persona(self, persona_id: str) -> UserPersona:
        """
        Get a specific user persona by ID.
        
        Args:
            persona_id: ID of the user persona
            
        Returns:
            User persona
        """
        if persona_id not in self.personas:
            # Return default persona if not found
            default_id = next(iter(self.personas.keys()))
            logger.warning(f"Persona {persona_id} not found, using {default_id} instead")
            return self.personas[default_id]
        return self.personas[persona_id]
    
    async def search(self, request: SearchRequest) -> str:
        """
        Initiate an asynchronous search process.
        
        Args:
            request: Search request parameters
            
        Returns:
            Search ID for tracking progress
        """
        # Generate a unique search ID
        search_id = self.progress.create_search_id()
        
        # Initialize search progress
        self.progress.update_progress(
            search_id=search_id,
            stage=SearchProgress.INITIATED,
            message="Search initiated",
            percentage=0
        )
        
        # Initialize in-progress search data
        self.in_progress_searches[search_id] = {
            "request": request,
            "standard_results": [],
            "ai_results": [],
            "summary": None,
            "completed": False
        }
        
        # Start search process in the background
        asyncio.create_task(self._process_search(search_id, request))
        
        return search_id
    
    async def get_search_results(self, search_id: str) -> SearchResponse:
        """
        Get current search results based on progress.
        
        Args:
            search_id: Search ID
            
        Returns:
            Current search results with progress information
        """
        # Check if search is completed
        if search_id in self.completed_searches:
            return self.completed_searches[search_id]
            
        # Check if search is in progress with partial results
        if search_id in self.in_progress_searches:
            progress = self.progress.get_progress(search_id)
            if not progress:
                progress_stage = SearchProgress.ERROR
            else:
                progress_stage = progress.stage
                
            # Return current state of results
            in_progress_data = self.in_progress_searches[search_id]
            return SearchResponse(
                search_id=search_id,
                progress=progress_stage,
                standardResults=in_progress_data.get("standard_results", []),
                aiResults=in_progress_data.get("ai_results", []),
                summary=in_progress_data.get("summary")
            )
        
        # Progress not found
        return SearchResponse(
            search_id=search_id,
            progress=SearchProgress.ERROR,
            standardResults=[],
            aiResults=[],
            summary=None
        )
    
    async def _process_search(self, search_id: str, request: SearchRequest) -> None:
        """
        Process the search request in the background.
        
        Args:
            search_id: Search ID
            request: Search request parameters
        """
        try:
            # Get user persona
            persona = self.get_persona(request.customer)
            
            # Phase 1a: Standard Search
            self.progress.update_progress(
                search_id=search_id,
                stage=SearchProgress.STANDARD_SEARCH,
                message="Performing standard search",
                percentage=10
            )
            
            standard_results = await self.azure_search.standard_search(request.query)
            standard_search_results = [SearchResult(**result) for result in standard_results]
            
            # Store standard results in in-progress data
            self.in_progress_searches[search_id]["standard_results"] = standard_search_results
            
            # If enhanced search or reasoning is not enabled, return standard results
            if not (request.vectorSearchEnabled or request.rerankerEnabled or request.reasoningEnabled):
                # Set ranks for standard results
                for i, result in enumerate(standard_search_results):
                    result.standardRank = i + 1
                    result.aiRank = i + 1
                    result.rankChange = 0
                
                # Create empty summary
                summary = SearchSummary(
                    totalProductCount=len(standard_search_results),
                    improvedRankCount=0,
                    newProductCount=0,
                    removedProductCount=0,
                    averageRankImprovement=0.0
                )
                
                # Update in-progress data
                self.in_progress_searches[search_id]["ai_results"] = standard_search_results
                self.in_progress_searches[search_id]["summary"] = summary
                
                # Create final response
                final_response = SearchResponse(
                    search_id=search_id,
                    progress=SearchProgress.COMPLETE,
                    standardResults=standard_search_results,
                    aiResults=standard_search_results,
                    summary=summary
                )
                
                # Store completed results
                self.completed_searches[search_id] = final_response
                self.in_progress_searches[search_id]["completed"] = True
                
                # Update progress
                self.progress.update_progress(
                    search_id=search_id,
                    stage=SearchProgress.COMPLETE,
                    message="Search completed",
                    percentage=100
                )
                
                return 
            
            # Phase 1b: Enhanced Search (if enabled)
            ai_results = standard_search_results.copy()
            
            if request.vectorSearchEnabled:
                # Query rewriting
                self.progress.update_progress(
                    search_id=search_id,
                    stage=SearchProgress.QUERY_REWRITING,
                    message="Rewriting query",
                    percentage=20
                )
                
                rewritten_query = await self.openai.rewrite_query(request.query, persona)
                
                # Vector search
                self.progress.update_progress(
                    search_id=search_id,
                    stage=SearchProgress.ENHANCED_SEARCH,
                    message="Performing vector search",
                    percentage=30
                )
                
                enhanced_results = await self.azure_search.hybrid_search(
                    rewritten_query, 
                    vector_fields=["titleVector", "descriptionVector", "brandVector"]
                )
                ai_results = [SearchResult(**result) for result in enhanced_results]
            
            # Phase 1b: Reranking (if enabled)
            if request.rerankerEnabled:
                self.progress.update_progress(
                    search_id=search_id,
                    stage=SearchProgress.RERANKING,
                    message="Reranking results",
                    percentage=50
                )
                
                reranked_results = await self.openai.rerank_results(
                    [result.dict() for result in ai_results], 
                    request.query, 
                    persona
                )
                ai_results = [SearchResult(**result) for result in reranked_results]
            
            # Calculate initial rank changes without reasoning
            standard_results, ai_results, summary = self._calculate_rank_changes(
                standard_search_results, 
                ai_results
            )
            
            # Update in-progress data with current results
            self.in_progress_searches[search_id]["standard_results"] = standard_results
            self.in_progress_searches[search_id]["ai_results"] = ai_results
            self.in_progress_searches[search_id]["summary"] = summary
            
            # Phase 2: AI Reasoning (if enabled)
            if request.reasoningEnabled:
                self.progress.update_progress(
                    search_id=search_id,
                    stage=SearchProgress.REASONING,
                    message="Generating AI reasoning",
                    percentage=70
                )
                
                processed_results = await self._process_reasoning_in_batches(
                    ai_results, 
                    request, 
                    persona, 
                    search_id
                )
                
                # Update AI results with reasoning
                self.in_progress_searches[search_id]["ai_results"] = processed_results
            
            # Final rank calculations with all processing complete
            final_standard_results, final_ai_results, final_summary = self._calculate_rank_changes(
                standard_search_results, 
                self.in_progress_searches[search_id]["ai_results"]
            )
            
            # Update in-progress data
            self.in_progress_searches[search_id]["standard_results"] = final_standard_results
            self.in_progress_searches[search_id]["ai_results"] = final_ai_results
            self.in_progress_searches[search_id]["summary"] = final_summary
            
            # Create final response
            final_response = SearchResponse(
                search_id=search_id,
                progress=SearchProgress.COMPLETE,
                standardResults=final_standard_results,
                aiResults=final_ai_results,
                summary=final_summary
            )
            
            # Store completed results
            self.completed_searches[search_id] = final_response
            self.in_progress_searches[search_id]["completed"] = True
            
            # Update progress as completed
            self.progress.update_progress(
                search_id=search_id,
                stage=SearchProgress.COMPLETE,
                message="Search completed",
                percentage=100
            )
            
        except Exception as e:
            logger.error(f"Search processing failed: {str(e)}")
            self.progress.update_progress(
                search_id=search_id,
                stage=SearchProgress.ERROR,
                message=f"Search failed: {str(e)}",
                percentage=0
            )
            # Even on error, we keep any partial results
            if search_id in self.in_progress_searches:
                self.in_progress_searches[search_id]["completed"] = True
    
    def _calculate_rank_changes(
        self, 
        standard_results: List[SearchResult], 
        ai_results: List[SearchResult]
    ) -> Tuple[List[SearchResult], List[SearchResult], SearchSummary]:
        """
        Calculate rank changes between standard and AI results.
        
        Args:
            standard_results: List of standard search results
            ai_results: List of AI-enhanced search results
            
        Returns:
            Updated standard results, AI results, and summary statistics
        """
        # Create maps for easier lookups
        standard_map = {result.id: idx for idx, result in enumerate(standard_results)}
        ai_map = {result.id: idx for idx, result in enumerate(ai_results)}
        
        # Set ranks and calculate changes for standard results
        for i, result in enumerate(standard_results):
            result.standardRank = i + 1
            if result.id in ai_map:
                result.aiRank = ai_map[result.id] + 1
                result.rankChange = result.standardRank - result.aiRank
            else:
                result.aiRank = None
                result.rankChange = None
        
        # Set ranks and calculate changes for AI results
        for i, result in enumerate(ai_results):
            result.aiRank = i + 1
            if result.id in standard_map:
                result.standardRank = standard_map[result.id] + 1
                result.rankChange = result.standardRank - result.aiRank
            else:
                result.standardRank = None
                result.rankChange = None
        
        # Calculate summary statistics
        improved_count = sum(1 for r in ai_results if r.rankChange and r.rankChange > 0)
        new_count = sum(1 for r in ai_results if r.standardRank is None)
        removed_count = sum(1 for r in standard_results if r.id not in ai_map)
        
        total_improvement = sum(r.rankChange or 0 for r in ai_results if r.rankChange and r.rankChange > 0)
        avg_improvement = total_improvement / improved_count if improved_count > 0 else 0.0
        
        summary = SearchSummary(
            totalProductCount=len(ai_results),
            improvedRankCount=improved_count,
            newProductCount=new_count,
            removedProductCount=removed_count,
            averageRankImprovement=avg_improvement
        )
        
        return standard_results, ai_results, summary
    
    async def _process_reasoning_in_batches(
        self, 
        ai_results: List[SearchResult], 
        request: SearchRequest, 
        persona: UserPersona, 
        search_id: str
    ) -> List[SearchResult]:
        """
        Process reasoning tasks in parallel batches for better performance.
        
        Args:
            ai_results: List of search results
            request: Search request parameters
            persona: User persona
            search_id: Search ID for progress tracking
            
        Returns:
            Updated list of search results with reasoning
        """
        batch_size = 5  # Process 5 items at a time
        total_results = len(ai_results)
        processed_count = 0
        result_map = {result.id: result for result in ai_results}
        
        # Process in small batches for parallel processing
        for i in range(0, total_results, batch_size):
            batch_end = min(i + batch_size, total_results)
            batch = ai_results[i:batch_end]
            reasoning_tasks = []
            
            # Create concurrent tasks for this batch
            for result in batch:
                task = self.openai.generate_reasoning(
                    result.dict(), 
                    request.query, 
                    persona
                )
                reasoning_tasks.append((result.id, task))
            
            # Execute all tasks in this batch concurrently
            results = await asyncio.gather(*[task for _, task in reasoning_tasks], return_exceptions=True)
            
            # Update results with reasoning
            for (result_id, _), reasoning in zip(reasoning_tasks, results):
                if isinstance(reasoning, Exception):
                    logger.error(f"Error generating reasoning for product {result_id}: {str(reasoning)}")
                    # Use default reasoning on error
                    reasoning = self.openai._default_reasoning(result_map[result_id].dict(), request.query)
                
                # Update product with reasoning
                if result_id in result_map:
                    result_map[result_id].aiReasoning = reasoning
                    result_map[result_id].match = reasoning.confidenceScore
            
            # Update processed count and progress
            processed_count += len(batch)
            progress_percentage = 70 + (processed_count / total_results) * 20
            self.progress.update_progress(
                search_id=search_id,
                stage=SearchProgress.REASONING,
                message=f"Generated reasoning for {processed_count}/{total_results} products",
                percentage=int(progress_percentage)
            )
            
            # Update in-progress results to make them available for clients
            if search_id in self.in_progress_searches:
                self.in_progress_searches[search_id]["ai_results"] = list(result_map.values())
        
        # Return the updated results
        return list(result_map.values())