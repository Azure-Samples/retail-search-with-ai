# search/azure_search.py
from rich.console import Console
from search.config import search_client
from search.config import vector_fields

import sys
sys.path.append("../")

from azure.search.documents import SearchIndexingBufferedSender
from azure.search.documents.models import (
    VectorizableTextQuery,
    QueryType
)
from azure.search.documents.indexes.models import (
    SearchIndex,
    SearchFieldDataType,
    VectorSearch,
    SemanticSearch,
    VectorSearchAlgorithmConfiguration,
    HnswAlgorithmConfiguration,
    VectorSearchProfile,
    AzureOpenAIVectorizer,
    AzureOpenAIVectorizerParameters,
    SemanticConfiguration,
    SemanticPrioritizedFields,
    SemanticField,
    SimpleField,
    SearchFieldDataType,
    SearchableField
)


from utils.openai_data_models import *
from search.search_data_models import *

console = Console()




def build_configurations(embedding_model_info):
    if embedding_model_info.client is None: 
        embedding_model_info = instantiate_model(embedding_model_info)

    vector_search = VectorSearch(
        algorithms=[
            HnswAlgorithmConfiguration(
                name="myHnsw"
            )
        ],
        profiles=[
            VectorSearchProfile(
                name="vector-search-profile",
                algorithm_configuration_name="myHnsw",
                vectorizer_name="oaiVectorizer"
            )
        ],
        vectorizers=[
            AzureOpenAIVectorizer(
                vectorizer_name="oaiVectorizer",
                parameters=AzureOpenAIVectorizerParameters(
                    resource_url=embedding_model_info.endpoint,
                    deployment_name=embedding_model_info.model,
                    model_name=embedding_model_info.model,
                    api_key=embedding_model_info.key,
                )
            )
        ]
    )

    semantic_config = SemanticConfiguration(
        name="semantic-config",
        prioritized_fields=SemanticPrioritizedFields(
            title_field=SemanticField(field_name="title"),
            content_fields=[
                SemanticField(field_name="description"),
            ],
            keywords_fields=[]
        )
    )
    semantic_search = SemanticSearch(configurations=[semantic_config])

    return vector_search, semantic_search



def simple_search_products(query: str, filter_expr: str = None, top: int = 15):
    """
    Perform Azure Cognitive Search with optional filter
    """
    results = search_client.search(search_text=query, 
                                   filter=filter_expr, 
                                   top=top)
    output = []
    for doc in results:
        output.append({
            "id": doc["id"],
            "name": doc["title"],
            "brand": doc["brand"],
            "description": doc["description"][:750],
            "images": doc["image_url"],
            "price": doc["final_price"]
        })
    return output


def search_products(query: str, filter_expr: str = None, top: int = 15):

    vector_queries = [VectorizableTextQuery(
            text=query, 
            k_nearest_neighbors=50,  
            fields=vf,
            exhaustive=True
        ) for vf in vector_fields]

    results = search_client.search(
        search_text=query,  
        vector_queries=vector_queries,
        filter=filter_expr,
        top=top,
        semantic_configuration_name="semantic-config",
        query_type=QueryType.SEMANTIC
    )

    output = []
    for doc in results:
        output.append({
            "id": doc["id"],
            "name": doc["title"],
            "brand": doc["brand"],
            "description": doc["description"][:750],
            "images": doc["image_url"],
            "price": doc["final_price"]
        })
        
    return output