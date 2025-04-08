# search/search_processing.py
from search.azure_search import search_products

from rich.console import Console
from search.retail_search_ai import phase1_discovery, phase2_recommender, retail_search_with_ai
from utils.openai_data_models import TextProcessingModelnfo

import sys
sys.path.append("../")

from search.search_data_models import *

console = Console()


model_info_4o = TextProcessingModelnfo(model_name="gpt-4o")
model_info_45 = TextProcessingModelnfo(model_name="gpt-45")
model_info_o1_mini = TextProcessingModelnfo(model_name="o1-mini")
model_info_o3_mini_low = TextProcessingModelnfo(model_name="o3-mini", reasoning_efforts="low")
model_info_o3_mini_medium = TextProcessingModelnfo(model_name="o3-mini", reasoning_efforts="medium")
model_info_o3_mini_high = TextProcessingModelnfo(model_name="o3-mini", reasoning_efforts="high")
model_info_o1_low = TextProcessingModelnfo(model_name="o1", reasoning_efforts="low")
model_info_o1_medium = TextProcessingModelnfo(model_name="o1", reasoning_efforts="medium")
model_info_o1_high = TextProcessingModelnfo(model_name="o1", reasoning_efforts="high")



def get_model_name(model_name):
    if model_name == "o3-mini-high":
        return"o3-mini",  "high"
    elif model_name == "o3-mini-medium":
        return "o3-mini", "medium"
    elif model_name == "o3-mini-low":
        return "o3-mini", "low"
    elif model_name == "o1-high":
        return "o1", "high"
    elif model_name == "o1-medium":
        return "o1", "medium"
    elif model_name == "o1-low":
        return "o1", "low"
    elif model_name == "o1-mini":
        return "o1-mini", "medium"
    elif model_name == "gpt4o":
        return "gpt-4o", "medium"
    elif model_name == "gpt45":
        return "gpt-45", "medium"
    
    return "o3-mini", "medium"


def get_model_instance(model_name):
    if model_name == "o3-mini-high":
        return model_info_o3_mini_high
    elif model_name == "o3-mini-medium":
        return model_info_o3_mini_medium
    elif model_name == "o3-mini-low":
        return model_info_o3_mini_low
    elif model_name == "o1-high":
        return model_info_o1_high
    elif model_name == "o1-medium":
        return model_info_o1_medium
    elif model_name == "o1-low":
        return model_info_o1_low
    elif model_name == "o1-mini":
        return model_info_o1_mini
    elif model_name == "gpt4o":
        return model_info_4o
    elif model_name == "gpt45":
        return model_info_45
    
    return model_info_o3_mini_medium


def search_no_llm(query: str):
    """
    A no-LLM approach: plain Azure Search without query expansion or recommendation logic.
    Returns a list of product dictionaries.
    """
    results = search_products(query=query, top=50)
    return results


def search_processing(query, requested_model, customer_profile):

    model_name, reasoning_effort = get_model_name(requested_model)
    model_info = get_model_instance(requested_model)

    search_config = SearchConfig(
        query=query,
        customer_profile=customer_profile,
        model_name=model_name,
        reasoning_effort=reasoning_effort
    )

    results = retail_search_with_ai(search_config, model_info)

    return results
    
