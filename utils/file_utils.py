import requests
import urllib
import os
import pickle
import logging
import base64
from PIL import Image
from datetime import datetime, timedelta






# Function to encode an image file in base64
def get_image_base64(image_path):
    with open(image_path, "rb") as image_file: 
        # Read the file and encode it in base64
        encoded_string = base64.b64encode(image_file.read())
        # Decode the base64 bytes into a string
        return encoded_string.decode('ascii')
    
    
def convert_png_to_jpg(image_path):
    if os.path.splitext(image_path)[1].lower() == '.png':
        # Open the image file
        with Image.open(image_path) as img:
            # Convert the image to RGB mode if it is in RGBA mode (transparency)
            if img.mode == 'RGBA':
                img = img.convert('RGB')
            # Define the new filename with .jpg extension
            new_image_path = os.path.splitext(image_path)[0] + '.jpg'
            # Save the image with the new filename and format
            img.save(new_image_path, 'JPEG')
            return new_image_path
    else:
        return None
    

          
def download_file(url, folder_path):
    # Extract the filename from the URL
    filename = url.split('/')[-1]

    # Create the full save path
    save_path = os.path.join(folder_path, filename)

    # Send a GET request to the URL
    response = requests.get(url)

    # Check if the request was successful
    if response.status_code == 200:
        # Make sure the directory exists
        os.makedirs(folder_path, exist_ok=True)

        # Write the content to a file
        with open(save_path, 'wb') as f:
            f.write(response.content)
        print(f"File saved to {save_path}")
        return save_path
    else:
        print(f"Failed to retrieve the File from the url: {url}")
        return None

def is_file_or_url(s):
    # Check if the string is a URL
    parsed = urllib.parse.urlparse(s)
    is_url = bool(parsed.scheme and parsed.netloc)

    # Check if the string is a local file path
    is_file = os.path.isfile(s)

    return 'url' if is_url else 'file' if is_file else 'unknown'


def save_to_pickle(a, filename):
    with open(filename, 'wb') as handle:
        pickle.dump(a, handle, protocol=pickle.HIGHEST_PROTOCOL)


def load_from_pickle(filename):
    with open(filename, 'rb') as handle:
        b = pickle.load(handle)
    return b

def check_replace_extension(asset_file, new_extension):
    if os.path.exists(replace_extension(asset_file, new_extension)):
        new_file = replace_extension(asset_file, new_extension)
        return new_file
    return ""

def replace_extension(asset_path, new_extension):
    base_name = os.path.splitext(asset_path)[0].strip()
    extension = os.path.splitext(asset_path)[1].strip()

    return f"{base_name}{new_extension}"


def write_to_file(text, text_filename, mode = 'a'):
    try:
        text_filename = text_filename.replace("\\", "/")
        with open(text_filename, mode, encoding='utf-8') as file:
            file.write(text)

        print(f"Writing file to full path: {os.path.abspath(text_filename)}")
    except Exception as e:
        print(f"SERIOUS ERROR: Error writing text to file: {e}")

def read_asset_file(text_filename):
    try:
        text_filename = text_filename.replace("\\", "/")
        with open(text_filename, 'r', encoding='utf-8') as file:
            text = file.read()
        status = True
        print(f"Reading file from path: {os.path.abspath(text_filename)}")
    except Exception as e:
        text = ""
        print(f"WARNING ONLY - reading text file: {e}")
        status = False

    return text, status

def find_certain_files(directory, extension = '.xlsx'):
    xlsx_files = []
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(".xlsx"):
                xlsx_files.append(os.path.join(root, file))
    return xlsx_files



from pathlib import Path

# Get the directory of the current module
module_directory = Path(__file__).parent.resolve()


def find_project_root(current_path=None, marker_files=None):
    if current_path is None:
        current_path = module_directory

    if marker_files is None:
        marker_files = ['.github', 'CONTRIBUTING.md', 'LICENSE.md', '.gitignore']

    current_path = Path(current_path).resolve()
    for parent in [current_path] + list(current_path.parents):
        if any((parent / marker).exists() for marker in marker_files):
            return parent
    return None

def find_all_files_in_project_root(filename_pattern="*", extension_pattern="*"):
    """
    Finds all files matching the specified filename pattern and extension pattern in the project root directory and its subdirectories.

    Parameters:
    - filename_pattern: The pattern for the file name (e.g., 'config*', '*', 'data?').
    - extension_pattern: The pattern for the file extension (e.g., '.py', '.txt', '*').

    Returns:
    - A list of Path objects pointing to the matching files.
    """
    module_directory = Path(__file__).parent.resolve()
    project_root = find_project_root(module_directory)

    if project_root is None:
        print("Project root not found.")
        return []

    # Ensure extension pattern starts with '.' unless it's '*'
    if extension_pattern != '*' and not extension_pattern.startswith('.'):
        extension_pattern = '.' + extension_pattern

    # Construct the search pattern
    search_pattern = f"{filename_pattern}{extension_pattern}"

    matching_files = list(project_root.rglob(search_pattern))

    return matching_files
