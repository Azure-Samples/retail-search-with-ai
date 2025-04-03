import asyncio
import aiohttp
import json
from pprint import pprint
import time

# Configuration
BASE_URL = "http://localhost:8000"  # Change to your API server URL
MAX_WAIT_TIME = 300  # Maximum time to wait for search completion (5 minutes)

async def test_health_check():
    """Test the health check endpoint."""
    print("\n=== Testing Health Check ===")
    async with aiohttp.ClientSession() as session:
        async with session.get(f"{BASE_URL}/health") as response:
            response_data = await response.json()
            print(f"Status: {response.status}")
            pprint(response_data)
            assert response.status == 200, "Health check failed"
            return response_data

async def test_get_personas():
    """Test retrieving all user personas."""
    print("\n=== Testing Get Personas ===")
    async with aiohttp.ClientSession() as session:
        async with session.get(f"{BASE_URL}/api/personas") as response:
            response_data = await response.json()
            print(f"Status: {response.status}")
            print(f"Found {len(response_data)} personas")
            if len(response_data) > 0:
                print(f"First persona: {response_data[0]['name']}")
            assert response.status == 200, "Get personas failed"
            return response_data

async def test_search_flow():
    """Test the complete search flow."""
    print("\n=== Testing Complete Search Flow ===")
    
    # 1. Initiate search
    search_query = "wireless headphones"
    persona_id = "tech"  # Using the tech persona
    
    request_data = {
        "query": search_query,
        "customer": persona_id,
        "vectorSearchEnabled": True,
        "rerankerEnabled": True,
        "reasoningEnabled": True
    }
    
    print(f"Initiating search for '{search_query}' with persona '{persona_id}'")
    
    async with aiohttp.ClientSession() as session:
        # 1. Start search
        async with session.post(
            f"{BASE_URL}/api/search", 
            json=request_data
        ) as response:
            search_id = await response.text()
            search_id = search_id.strip('"')  # Remove quotes if present
            print(f"Search ID: {search_id}")
            assert response.status == 200, "Search initiation failed"
        
        # 2. Poll for progress until complete
        complete = False
        max_attempts = 30
        attempts = 0
        
        while not complete and attempts < max_attempts:
            attempts += 1
            async with session.get(
                f"{BASE_URL}/api/search/{search_id}/progress"
            ) as response:
                progress_data = await response.json()
                print(f"Progress: {progress_data['stage']} - {progress_data['percentage']}% - {progress_data['message']}")
                
                if progress_data['stage'] in ['complete', 'error']:
                    complete = True
                else:
                    # Wait before next poll
                    await asyncio.sleep(2)
        
        # 3. Get final results
        async with session.get(
            f"{BASE_URL}/api/search/{search_id}"
        ) as response:
            results = await response.json()
            print(f"\nSearch completed with status: {results['progress']}")
            print(f"Standard results: {len(results['standardResults'])}")
            print(f"AI results: {len(results['aiResults'])}")
            
            if results['summary']:
                print("\nSearch Summary:")
                print(f"Total products: {results['summary']['totalProductCount']}")
                print(f"Improved rank count: {results['summary']['improvedRankCount']}")
                print(f"Average rank improvement: {results['summary']['averageRankImprovement']}")
            
            # Print first AI result with reasoning if available
            if results['aiResults'] and len(results['aiResults']) > 0:
                first_result = results['aiResults'][0]
                print("\nFirst AI Result:")
                print(f"Title: {first_result['title']}")
                print(f"Brand: {first_result.get('brand', 'Unknown')}")
                print(f"Price: ${first_result.get('price', 0)}")
                
                if first_result.get('aiReasoning'):
                    print("\nAI Reasoning:")
                    print(f"Confidence: {first_result['aiReasoning']['confidenceScore']}%")
                    print(f"Explanation: {first_result['aiReasoning']['text']}")
                    
                    if first_result['aiReasoning'].get('factors'):
                        print("\nFactors:")
                        for factor in first_result['aiReasoning']['factors']:
                            print(f"- {factor['factor']}: {factor['weight']}% - {factor['description']}")
            
            return results

async def test_search_flow_with_incremental_results():
    """Test the complete search flow with support for incremental results."""
    print("\n=== Testing Complete Search Flow with Incremental Results ===")
    
    # 1. Initiate search
    search_query = "wireless headphones"
    persona_id = "tech"  # Using the tech persona
    
    request_data = {
        "query": search_query,
        "customer": persona_id,
        "vectorSearchEnabled": True,
        "rerankerEnabled": True,
        "reasoningEnabled": True
    }
    
    print(f"Initiating search for '{search_query}' with persona '{persona_id}'")
    
    async with aiohttp.ClientSession() as session:
        # 1. Start search
        async with session.post(
            f"{BASE_URL}/api/search", 
            json=request_data
        ) as response:
            search_id = await response.text()
            search_id = search_id.strip('"')  # Remove quotes if present
            print(f"Search ID: {search_id}")
            assert response.status == 200, "Search initiation failed"
        
        # 2. Poll for progress and incremental results
        start_time = time.time()
        complete = False
        last_progress_message = ""
        last_count = 0
        
        while not complete and (time.time() - start_time) < MAX_WAIT_TIME:
            # Check progress
            async with session.get(
                f"{BASE_URL}/api/search/{search_id}/progress"
            ) as response:
                progress_data = await response.json()
                
                # Print progress only if it changed
                if progress_data.get('message') != last_progress_message:
                    print(f"Progress: {progress_data['stage']} - {progress_data['percentage']}% - {progress_data['message']}")
                    last_progress_message = progress_data.get('message')
                
                # Check if search is complete or failed
                if progress_data['stage'] in ['complete', 'error']:
                    complete = True
            
            # Get incremental results if in reasoning stage
            if progress_data['stage'] == 'reasoning':
                async with session.get(
                    f"{BASE_URL}/api/search/{search_id}"
                ) as response:
                    results = await response.json()
                    
                    # Show incremental results if we have more than before
                    ai_results_count = len(results.get('aiResults', []))
                    if ai_results_count > last_count:
                        print(f"Incremental results available: {ai_results_count} products with reasoning")
                        
                        # Show details of the latest result with reasoning
                        if ai_results_count > 0:
                            products_with_reasoning = [r for r in results['aiResults'] if r.get('aiReasoning')]
                            if products_with_reasoning:
                                newest = products_with_reasoning[-1]
                                print(f"\nLatest product with reasoning: {newest['title']}")
                                if newest.get('aiReasoning'):
                                    print(f"Confidence: {newest['aiReasoning']['confidenceScore']}%")
                                    print(f"Explanation: {newest['aiReasoning']['text']}")
                        
                        last_count = ai_results_count
            
            # Wait before next poll if not complete
            if not complete:
                await asyncio.sleep(3)
        
        # 3. Get final results
        async with session.get(
            f"{BASE_URL}/api/search/{search_id}"
        ) as response:
            final_results = await response.json()
            
            total_time = time.time() - start_time
            print(f"\nSearch completed in {total_time:.2f} seconds with status: {final_results['progress']}")
            print(f"Standard results: {len(final_results['standardResults'])}")
            print(f"AI results: {len(final_results['aiResults'])}")
            
            products_with_reasoning = [r for r in final_results['aiResults'] if r.get('aiReasoning')]
            print(f"Products with AI reasoning: {len(products_with_reasoning)}/{len(final_results['aiResults'])}")
            
            if final_results['summary']:
                print("\nSearch Summary:")
                print(f"Total products: {final_results['summary']['totalProductCount']}")
                print(f"Improved rank count: {final_results['summary']['improvedRankCount']}")
                print(f"Average rank improvement: {final_results['summary']['averageRankImprovement']}")
            
            # Print a few sample results with reasoning
            if products_with_reasoning:
                print("\nSample Results with Reasoning:")
                for i, result in enumerate(products_with_reasoning[:3]):  # Show first 3 results
                    print(f"\nResult #{i+1}: {result['title']}")
                    print(f"Brand: {result.get('brand', 'Unknown')}")
                    print(f"Price: ${result.get('price', 0)}")
                    print(f"Rank Change: {result.get('rankChange', 'N/A')}")
                    
                    if result.get('aiReasoning'):
                        print("\nAI Reasoning:")
                        print(f"Confidence: {result['aiReasoning']['confidenceScore']}%")
                        print(f"Explanation: {result['aiReasoning']['text']}")
                        
                        if result['aiReasoning'].get('factors'):
                            print("\nFactors:")
                            for factor in result['aiReasoning']['factors']:
                                print(f"- {factor['factor']}: {factor['weight']}% - {factor['description']}")
            
            return final_results

async def main():
    """Run all tests."""
    try:
        # Test health check
        await test_health_check()
        
        # Test getting personas
        personas = await test_get_personas()
        
        if personas and len(personas) > 0:
            # Test standard search flow
            await test_search_flow()
            
            # Test search flow with incremental results
            await test_search_flow_with_incremental_results()
            
    except Exception as e:
        print(f"Test failed: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(main())