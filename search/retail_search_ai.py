# search/o1_o3.py
import json
from rich.console import Console

from search.config import search_expansion_prompt, recommender_prompt, product_categories
from search.azure_search import search_products
from utils.openai_helpers import call_llm, call_llm_structured_outputs
from utils.openai_data_models import TextProcessingModelnfo

import sys
sys.path.append("../")

from search.search_data_models import *

console = Console()


def phase1_discovery(query: str, customer_profile: dict, model_info: TextProcessingModelnfo = TextProcessingModelnfo(model_name="o1", reasoning_efforts="medium")):
    """
    1) Expands the query using the LLM.
    2) Constructs a filter expression based on the expanded query.
    3) Combines unfiltered and filtered Azure Search results.
    """
    valid_fields = ["title", "brand", "description", "categories"]

    # 1) Expand query with LLM
    prompt = search_expansion_prompt.format(query=query, customer_profile=customer_profile, product_categories=product_categories)
    #console.log(f"Model Info: {model_info}")
    
    if model_info.model_name == "o1-mini":
        expanded_query = call_llm(
            prompt=prompt, 
            model_info=model_info
        )
        expanded_query = expanded_query.replace("```json", "").replace("```", "").strip()
        expanded_query = json.loads(expanded_query)
    else:    
        expanded_query = call_llm_structured_outputs(
            prompt=prompt, 
            response_format=ExpandedSearch, 
            model_info=model_info
        )
    
    if isinstance(expanded_query, ExpandedSearch):
        expanded_query = expanded_query.dict()

    console.log(f"Expanded query object: {expanded_query}")
    
    expanded_terms = expanded_query.get("expanded_terms", [])
    filter_obj = expanded_query.get("filters", {})
    price_obj = expanded_query.get("price", {})

    # 2) Construct filter expression
    filter_expr = "("
    for field in valid_fields:
        if field in filter_obj and filter_obj[field]:
            for term in filter_obj[field]:
                if field != "categories":
                    lower_term = term.strip().lower()
                    upper_term = term.strip().upper()
                    capital_term = term.strip().capitalize()
                    title_term = term.strip().title()
                    filter_expr += f"search.ismatch('\"{lower_term}\"~10', '{field}', 'full', 'any') or "
                    filter_expr += f"search.ismatch('\"{upper_term}\"~10', '{field}', 'full', 'any') or "
                    filter_expr += f"search.ismatch('\"{capital_term}\"~10', '{field}', 'full', 'any') or "
                    filter_expr += f"search.ismatch('\"{title_term}\"~10', '{field}', 'full', 'any') or "
                else:
                    filter_expr += f"search.ismatch('{term}', '{field}', 'full', 'any') or "
    
    if filter_expr.endswith(" or "):
        filter_expr = filter_expr[:-4]
    filter_expr += ")"
    if filter_expr == "()":
        filter_expr = ""
    
    # Append price conditions
    price_str = ""
    if price_obj.get("ge") is not None:
        price_str += f" and price ge {price_obj['ge']}"
    if price_obj.get("lte") is not None:
        price_str += f" and price le {price_obj['lte']}"
    
    if price_str and filter_expr:
        filter_expr += price_str
    elif price_str:
        filter_expr = price_str[5:] if price_str.startswith(" and ") else price_str
    
    console.log(f"Original query: {query}")
    console.log(f"Expanded terms: {expanded_terms}")
    console.log(f"Filter expr: {filter_expr}")
    
    top_results = 50
    
    # 3) Perform search
    unfiltered_results = search_products(query=", ".join(expanded_terms), top=top_results)
    filtered_results = []
    
    try:
        if filter_expr:
            filtered_results = search_products(query=", ".join(expanded_terms), filter_expr=filter_expr, top=top_results)
    except Exception as e:
        #console.log(f"Error in Azure Search: {e}")
        pass
    
    combined_product_ids = {}
    combined_results = []
    idx = 0
    max_len = max(len(unfiltered_results), len(filtered_results))
    
    while idx < max_len:
        if idx < len(unfiltered_results):
            pid = unfiltered_results[idx]["id"]
            if pid not in combined_product_ids:
                combined_results.append(unfiltered_results[idx])
                combined_product_ids[pid] = True
        if idx < len(filtered_results):
            pid = filtered_results[idx]["id"]
            if pid not in combined_product_ids:
                combined_results.append(filtered_results[idx])
                combined_product_ids[pid] = True
        idx += 1
    
    console.log(f"Unfiltered: {len(unfiltered_results)} | Filtered: {len(filtered_results)} | Combined: {len(combined_results)}")
    
    return {
        "expanded_terms": expanded_terms,
        "filter_expr": json.dumps(filter_obj, indent=2),
        "search_results": combined_results
    }


def phase2_recommender(search_results, query: str, customer_profile: dict, model_info: TextProcessingModelnfo = TextProcessingModelnfo(model_name="o1", reasoning_efforts="medium")):
    """
    Calls the LLM to generate a recommended ordering of the products.
    """
    products_json = json.dumps(search_results.get("search_results", []), indent=2)
    profile_json = json.dumps(customer_profile, indent=2)

    prompt = recommender_prompt.format(
        customer_profile=profile_json,
        product_list=products_json,
        search_query=query,
        expansion_terms=", ".join(search_results.get("expanded_terms", [])),
        expansion_filters=search_results.get("filter_expr", "")
    )

    if model_info.model_name == "o1-mini":
        recommendations = call_llm(
            prompt=prompt, 
            model_info=model_info
        )
        recommendations = recommendations.replace("```json", "").replace("```", "").strip()
        recommendations = json.loads(recommendations)
    else:
        recommendations = call_llm_structured_outputs(
            prompt=prompt, 
            response_format=SearchResults, 
            model_info=model_info
        )

    console.print("Recommendations:", recommendations)
    
    if isinstance(recommendations, SearchResults):
        recommendations = recommendations.dict()
    
    recommended_ids = [r.strip() for r in recommendations.get("product_ids", []) if r.strip()]
    justification = recommendations.get("justification", "")
    
    # Reorder products based on LLM recommendations
    recommended_products = []
    for rid in recommended_ids:
        for product in search_results.get("search_results", []):
            if product["id"] == rid:
                recommended_products.append(product)
                break
    
    included_ids = {p["id"] for p in recommended_products}
    for product in search_results.get("search_results", []):
        if product["id"] not in included_ids:
            recommended_products.append(product)

    return recommended_products, justification, len(included_ids)




def retail_search_with_ai(search_config: SearchConfig, model_info: TextProcessingModelnfo):
    
    console.print("model_info:\n", model_info)
    expansion_result = phase1_discovery(search_config.query, 
                                        search_config.customer_profile, 
                                        model_info=model_info)
    
    recommended, justification, num_recommended = phase2_recommender(
        search_results=expansion_result,
        query=search_config.query,
        customer_profile=search_config.customer_profile,
        model_info=model_info
    )

    return {
        "expansion_result": expansion_result,
        "recommended": recommended,
        "justification": justification,
        "num_recommended": num_recommended
    }