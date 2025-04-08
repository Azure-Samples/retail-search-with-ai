# This file loads configuration for Azure Search and prompt files
import os
from dotenv import load_dotenv

import sys
sys.path.append("../")


from utils.general_helpers import read_file
from azure.core.credentials import AzureKeyCredential
from azure.search.documents import SearchClient
from search.search_data_models import *

load_dotenv()

# Load environment variables
search_service_name = os.getenv("SEARCH_SERVICE_NAME", "")
index_name = os.getenv("SEARCH_INDEX_NAME", "")
search_api_key = os.getenv("SEARCH_API_KEY", "")

# Configure the Azure Search client
search_endpoint = f"https://{search_service_name}.search.windows.net"
credential = AzureKeyCredential(search_api_key)
search_client = SearchClient(endpoint=search_endpoint, index_name=index_name, credential=credential)

# Read prompt files
search_expansion_prompt = read_file("prompts/search_expansion_prompt.txt")
recommender_prompt = read_file("prompts/recommender_prompt.txt")
product_categories = read_file("prompts/product_categories.txt")


# Vector Fields
vector_fields = ["titleVector", "descriptionVector", "brandVector"]