import os
import re
import json
import time
from typing import List, Dict, Union, Optional

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from pydantic import BaseModel
from dotenv import load_dotenv

from rich.console import Console
console = Console()


# Load environment variables from .env (if present)
load_dotenv()

# Import the new search_processing function from the reorganized modules
from search.search_processing import search_processing, search_no_llm

from search.search_data_models import *

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



app.mount("/static", StaticFiles(directory="ui/build/static"), name="static")



@app.get("/")
def serve_index():
    return FileResponse("ui/build/index.html")



@app.get("/api/customers")
def list_customers():
    folder_path = "customer_profiles"
    if not os.path.exists(folder_path):
        return []
    files = [f for f in os.listdir(folder_path) if f.endswith(".json")]
    return files



@app.get("/api/customer/{filename}")
def get_customer_profile(filename: str):
    folder_path = "customer_profiles"
    file_path = os.path.join(folder_path, filename)
    if os.path.exists(file_path):
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return [
            data["customer_profile"].get("gender", ""), 
            data["customer_profile"].get("purchase_statistics", {}), 
            data["customer_profile"].get("inferred_purchasing_behavior", {}),
            data["customer_profile"].get("additional_notes", "")
        ]
    else:
        return JSONResponse(content={"error": "Customer profile not found."}, status_code=404)



def get_customer(customer: str):
    folder_path = "customer_profiles"
    file_path = os.path.join(folder_path, customer)
    if not os.path.exists(file_path):
        return JSONResponse(
            content={"error": f"Customer profile '{customer}' not found."},
            status_code=404
        )

    with open(file_path, "r", encoding="utf-8") as f:
        customer_profile = json.load(f)
    return customer_profile



@app.post("/api/retail_search")
def retail_search(payload: RetailSearch):
    """
    Accepts search parameters and returns search results.
    """
    return search_processing(payload.query, payload.model_name, get_customer(payload.customer))

     

@app.post("/api/search")
def search_endpoint(payload: SearchRequest):
    """
    Accepts search parameters and returns search results from both sides.
    """
    console.print(payload)
    start_time = time.time()
    customer_profile = get_customer(payload.customer)

    right_results = search_processing(payload.query, payload.reasoning_effort, customer_profile)
    right_results = {
        "expansion_result_right": right_results['expansion_result'],
        "recommended_right": right_results['recommended'],
        "justification_right": right_results['justification'],
        "num_recommended_right": right_results['num_recommended']
    }

    if payload.compare:
        if payload.left_model == "no-llm":
            recommended = search_no_llm(payload.query)
            num_recommended = len(recommended)

            left_results = {
                "expansion_result_left": {"expanded_terms": [payload.query]},
                "recommended_left": recommended,
                "justification_left": "",
                "num_recommended_left": num_recommended
            }
        else:
            left_results = search_processing(payload.query, payload.left_model, customer_profile)
            left_results = {
                "expansion_result_left": left_results['expansion_result'],
                "recommended_left": left_results['recommended'],
                "justification_left": left_results['justification'],
                "num_recommended_left": left_results['num_recommended']
            }
    else:
        left_results = {}

    end_time = time.time()
    elapsed_ms = int(end_time - start_time)


    response_data = {
        "expanded_terms_right": right_results.get("expansion_result_right", {}).get("expanded_terms", []),
        "expanded_terms_left": left_results.get("expansion_result_left", {}).get("expanded_terms", [payload.query]) if payload.compare else [payload.query],
        "filter_expr": right_results.get("expansion_result_right", {}).get("filter_expr", ""),
        "justification_right": right_results.get("justification_right", ""),
        "justification_left": left_results.get("justification_left", ""),
        "search_time_ms": elapsed_ms,
        "num_recommended_right": right_results.get("num_recommended_right", 0),
        "num_recommended_left": left_results.get("num_recommended_left", 0),
        "search_results_right": right_results.get("recommended_right", []),
        "search_results_left": left_results.get("recommended_left", [])
    }

    return response_data



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=80)
