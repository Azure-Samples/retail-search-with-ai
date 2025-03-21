# AI-Powered Product Search

This project demonstrates an AI-enhanced product search experience with reasoning capabilities. It consists of a Next.js frontend and a FastAPI backend.

## Project Overview

The application showcases how AI can improve product search by:
- Providing transparent reasoning for search results
- Personalizing results based on user personas
- Comparing traditional and AI-enhanced search approaches
- Visualizing search confidence and ranking metrics

## Prerequisites

- Node.js 16+ for the frontend
- Python 3.8+ for the backend
- Conda for environment management

## Setup

### Frontend Setup

```bash
# Install dependencies
npm install
```

### Backend Setup

```bash
# Create and activate conda environment
conda create -n recommendation-reasoning python=3.9
conda activate recommendation-reasoning

# Install backend dependencies
cd backend
pip install -r requirements.txt
```

## Running the Application

### Running the Frontend

```bash
# From the project root
npm run dev
```

The frontend will be available at [http://localhost:3000](http://localhost:3000).

### Running the Backend

```bash
# From the backend directory
cd backend
uvicorn main:app --reload
```

The API will be available at [http://localhost:8000](http://localhost:8000).

### Running Both Together

We've provided a convenience script to run both services at once:

```bash
# Make the script executable
chmod +x run.sh

# Run both services
./run.sh
```

## API Documentation

When the backend is running, API documentation is available at:
- Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

## Project Structure

- `frontend/`: Next.js frontend application
- `backend/`: FastAPI backend application
  - `services/`: Core service implementations
  - `models/`: Data models and schemas
  - `config/`: Configuration settings
  - `utils/`: Utility functions
  - `data/`: Static data files

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
