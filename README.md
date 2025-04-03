# AI-Powered Product Search

This project demonstrates an AI-enhanced product search experience with reasoning capabilities. It consists of a Next.js frontend and a FastAPI backend.

## Project Overview

The application showcases how AI can improve product search by:
- Providing transparent reasoning for search results
- Personalizing results based on user personas
- Comparing traditional and AI-enhanced search approaches
- Visualizing search confidence and ranking metrics

## Smart Shopping Assistant

The Smart Shopping Assistant transforms online shopping by tailoring product recommendations to your unique preferences and shopping style. The platform adapts its search results and product rankings based on your selected shopping persona, ensuring you discover products that truly align with your priorities.

### Shopping Personas

The application features four distinct shopping personas that represent different consumer priorities:

1. **Luxury Diva**: Prioritizes premium brands and high-quality products
2. **Smart Saver**: Focuses on value and finding the best deals
3. **Tech Maven**: Favors innovation and the latest technologies
4. **Eco Warrior**: Emphasizes sustainable and environmentally friendly options

This approach eliminates hours of product comparison by instantly identifying items that match specific user preferences.

### Key Features

#### Standard Product Search
The platform provides a conventional search experience where you can enter keywords (such as "headphones") to find relevant products. In standard mode, results are displayed based on traditional ranking factors without personalization.
 
#### AI-Powered Personalization
When you enable AI Reasoning mode via the toggle switch, the system activates its advanced recommendation engine. This feature:
- Dynamically reranks products based on your selected persona's preferences
- Displays match percentage scores on each product card, indicating compatibility with the user profile
- Shows ranking changes through visual indicators, allowing you to see how products move up or down in relevance
 
#### Transparent Recommendation Logic
Unlike typical "black box" recommendation systems, the application provides complete transparency into why certain products are recommended:
- Product cards can be flipped to reveal detailed reasoning behind each recommendation
- The system displays feature-by-feature analysis of how each product attribute was evaluated
- Quality, brand recognition, price sensitivity, and other factors are scored based on your persona's preference weights

This transparency ensures users understand exactly why certain products are recommended, giving them confidence in purchasing decisions while maintaining complete control over their shopping experience.

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
