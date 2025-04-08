# check_env.py
# Run this script to check if your .env file is being loaded correctly

import os
import pathlib
from dotenv import load_dotenv

# Determine the project root directory
BASE_DIR = pathlib.Path(__file__).parent
ENV_FILE = BASE_DIR / ".env"

# Try to load the .env file
print(f"Checking for .env file at: {ENV_FILE}")
print(f"File exists: {ENV_FILE.exists()}")

# Load the .env file
load_dotenv(dotenv_path=ENV_FILE)

# List of expected environment variables
expected_vars = [
    "AZURE_SEARCH_ENDPOINT",
    "AZURE_SEARCH_KEY",
    "AZURE_SEARCH_INDEX_NAME",
    "AZURE_OPENAI_ENDPOINT",
    "AZURE_OPENAI_KEY",
    "AZURE_OPENAI_MODEL",
    "AZURE_OPENAI_API_VERSION",
    "VECTOR_FIELDS",
    "HOST",
    "PORT"
]

# Check if all expected variables are set
print("\nEnvironment Variables Check:")
all_set = True
for var in expected_vars:
    value = os.getenv(var)
    is_set = value is not None
    if is_set:
        # Print only the first few characters if the value might be sensitive
        if "KEY" in var:
            display_value = f"{value[:5]}..." if value else "Not set"
        else:
            display_value = value
    else:
        display_value = "Not set"
    
    print(f"{var}: {display_value}")
    
    if not is_set:
        all_set = False

# Summary
print("\nSummary:")
if all_set:
    print("✅ All expected environment variables are set")
else:
    print("❌ Some environment variables are missing")
    print("Please ensure the .env file is correctly configured")

# Additional debugging information
print("\nCurrent Working Directory:", os.getcwd())
print("Python Executable:", os.path.abspath(os.path.dirname(os.__file__)))