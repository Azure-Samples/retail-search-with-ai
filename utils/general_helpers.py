import uuid
import hashlib
import os
import re
import json
import json_repair
import shutil
from pathlib import Path

from utils.openai_helpers import *

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




def find_env_file(start_path='.'):
    """Find the .env file starting from the given path and moving up the directory tree."""
    current_path = os.path.abspath(start_path)

    cntr = 0
    while True:
        env_file_path = os.path.join(current_path, '.env')
        if os.path.exists(env_file_path):
            return env_file_path
        parent_path = os.path.dirname(current_path)
        if parent_path == current_path:  # Reached the root of the file system
            break
        current_path = parent_path
        cntr += 1
        if cntr > 100:
            break

    raise FileNotFoundError(".env file not found in the directory tree.")


def read_file(text_filename):
    try:
        text_filename = text_filename.replace("\\", "/")
        with open(text_filename, 'r', encoding='utf-8') as file:
            text = file.read()
        status = True
    except Exception as e:
        text = ""
        print(f"WARNING ONLY - reading text file: {e}")
        status = False

    print(f"Success status: {status}. Reading file from full path: {os.path.abspath(text_filename)}")

    return text


def write_to_file(text, text_filename, mode = 'w'):
    try:
        text_filename = text_filename.replace("\\", "/")
        with open(text_filename, mode, encoding='utf-8') as file:
            file.write(text)

        status = f"Writing file to full path: {os.path.abspath(text_filename)}"
        print(status)
        
    except Exception as e:
        status = f"SERIOUS ERROR: Error writing text to file: {e}"
        print(status)

    return status


def generate_random_uuid():
    return str(uuid.uuid4())


def generate_uuid_from_string(input_string):
    # Create a SHA-1 hash of the input string
    hash_object = hashlib.sha1(input_string.encode())
    # Use the first 16 bytes of the hash to create a UUID
    return str(uuid.UUID(bytes=hash_object.digest()[:16]))


def get_file_md5(file_name):
    with open(file_name, 'rb') as file_obj:
        file_contents = file_obj.read()
        md5 = hashlib.md5(file_contents).hexdigest()
        return str(md5)
    


def list_files_in_directory(directory_path):
    """
    Returns a list of all files in the given directory.

    Args:
        directory_path (str): The path to the directory.

    Returns:
        list: A list of filenames in the directory.
    """
    try:
        # List all files in the directory
        files = [f for f in os.listdir(directory_path) if os.path.isfile(os.path.join(directory_path, f))]
        return files
    except Exception as e:
        print(f"An error occurred: {e}")
        return []


def delete_directory(directory_path):
    """
    Deletes the given directory, all its files and all its subfolders.

    Args:
        directory_path (str): The path to the directory to be deleted.
    """
    try:
        # Walk through the directory
        for root, dirs, files in os.walk(directory_path, topdown=False):
            # Remove all files
            for file in files:
                file_path = os.path.join(root, file)
                os.remove(file_path)

            # Remove all subdirectories
            for dir in dirs:
                dir_path = os.path.join(root, dir)
                os.rmdir(dir_path)

        # Finally, remove the main directory
        os.rmdir(directory_path)

    except Exception as e:
        print(f"An error occurred while deleting the directory '{directory_path}': {e}")


def copy_file(source_path, destination_path):
    """
    Copy a file from source_path to destination_path.

    :param source_path: Path to the source file.
    :param destination_path: Path to the destination file.
    :return: None
    """
    try:
        shutil.copy(source_path, destination_path)
        print(f"File copied from {source_path} to {destination_path}")
    except FileNotFoundError:
        print("The source file does not exist.")
    except PermissionError:
        print("Permission denied. Check your file permissions.")
    except Exception as e:
        print(f"An error occurred: {e}")        


def locate_directory(target_dir):
    if os.path.exists(target_dir):
        return os.path.abspath(target_dir).replace("\\", "/").replace("//", "/")

    # Helper function to search for directory upwards
    def search_upwards(start_path, target_dir):
        current_path = start_path
        while current_path != os.path.dirname(current_path):  # Continue until reaching the root directory
            if target_dir in os.listdir(current_path):
                return os.path.join(current_path, target_dir)
            current_path = os.path.dirname(current_path)  # Move up one directory
        return None
    
    # Helper function to search for directory downwards
    def search_downwards(start_path, target_dir):
        for root, dirs, _ in os.walk(start_path):
            if target_dir in dirs:
                return os.path.join(root, target_dir)
        return None

    # Step 0: Check if the current directory is already the target directory
    if os.path.basename(os.getcwd()) == os.path.basename(target_dir):
        print(f"Already in the target directory: {os.getcwd()}")
        return target_dir

    # Step 1: Try finding the directory by searching upwards
    start_path = os.getcwd()
    target_path = search_upwards(start_path, target_dir)
    
    # Step 2: If not found upwards, try finding it by searching downwards
    if not target_path:
        target_path = search_downwards(start_path, target_dir)

    return os.path.abspath(target_dir).replace("\\", "/").replace("//", "/")



def safe_change_directory(target_dir):
    target_path = locate_directory(target_dir)
    
    if target_path:
        os.chdir(target_path)
        print(f"Changed directory to: {target_path}")
        return True
    else:
        print(f"Directory '{target_dir}' not found in the current path or its hierarchy.")
        return False


def list_py_files(directory):
    """
    Recursively searches for all .py files in the given directory and its subdirectories.

    Parameters:
    - directory (str): The path of the directory to search.

    Returns:
    - List[str]: A list of paths to all .py files found in the directory and its subdirectories.
    """
    py_files = []

    # Walk through all directories and subdirectories
    for root, _, files in os.walk(directory):
        for file in files:
            # Check if the file has a .py extension
            if file.endswith('.py'):
                py_files.append(os.path.join(root, file))

    return py_files



def build_env_vars_str(env_file):
    env_vars = read_file(env_file)
    env_vars = env_vars.replace('"', '').replace("'", "").replace("\r", "")
    env_vars = env_vars.split('\n')
    
    env_vars_str = ""
    for e in env_vars:
        if e.startswith("#"): continue
        comps = e.split('=')

        if len(comps) >= 2:
            key = comps[0]
            value = e[len(key)+1:]

            if value == "": continue
            if ' #' in value: 
                value = value.split(' #')[0]
            env_vars_str += f"'{key.strip()}={value.strip()}' "

    return env_vars_str.strip()


def list_files_and_folders(folder_path):
    """
    Returns a list of all subfolders and files in a folder with relative paths.

    Args:
        folder_path (str): The path to the folder.

    Returns:
        List[str]: A list of relative paths of all subfolders and files.
    """
    relative_paths = []
    for dirpath, dirnames, filenames in os.walk(folder_path):
        # Compute relative path from the root folder
        rel_dirpath = os.path.relpath(dirpath, folder_path)
        if rel_dirpath != '.':
            relative_paths.append(rel_dirpath)
        for filename in filenames:
            rel_filepath = os.path.join(rel_dirpath, filename)
            relative_paths.append(rel_filepath)
    return relative_paths



def create_file(contents, filename):

    if os.path.exists(filename):
        status = f"File already exists: {filename}. Not creating a new file. Choose another filename"
        print(status)
        return status
    
    try:
        filename = filename.replace("\\", "/")
        with open(filename, 'w', encoding='utf-8') as file:
            file.write(contents)

        status = f"Writing file to full path: {os.path.abspath(filename)}"
        print(status)
        
    except Exception as e:
        status = f"SERIOUS ERROR: Error writing contents to file: {e}"
        print(status)

    return status


def create_folder(foldername):
    if os.path.exists(foldername):
        status = f"Folder already exists: {foldername}. Not creating a new folder. Choose another folder name."
        print(status)
        return status

    try:
        foldername = foldername.replace("\\", "/")
        os.makedirs(foldername)
        status = f"Created folder at path: {os.path.abspath(foldername)}"
        print(status)
    except Exception as e:
        status = f"SERIOUS ERROR: Error creating folder: {e}"
        print(status)

    return status


def modify_file(contents, filename):
    if not os.path.exists(filename):
        status = f"File does not exist: {filename}. Cannot modify a non-existent file."
        print(status)
        return status

    try:
        filename = filename.replace("\\", "/")
        with open(filename, 'w', encoding='utf-8') as file:
            file.write(contents)
        status = f"Modified file at path: {os.path.abspath(filename)}"
        print(status)
    except Exception as e:
        status = f"SERIOUS ERROR: Error modifying file: {e}"
        print(status)

    return status