#!/bin/bash

# Set up terminal colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting AI-Powered Product Search Application...${NC}"

# Activate conda environment
echo -e "${GREEN}Activating conda environment...${NC}"
# Try using source first for bash compatibility
if command -v conda &> /dev/null; then
    source "$(conda info --base)/etc/profile.d/conda.sh" 2>/dev/null || true
    conda activate recommendation-reasoning
else
    echo -e "${RED}Conda is not installed or not in PATH. Please install conda first.${NC}"
    exit 1
fi

# Start backend in the background
echo -e "${GREEN}Starting backend server...${NC}"
cd backend || { echo -e "${RED}Backend directory not found${NC}"; exit 1; }
uvicorn main:app --reload &
BACKEND_PID=$!
echo -e "${GREEN}Backend started with PID: $BACKEND_PID${NC}"

# Go back to root and start frontend
cd ..
echo -e "${GREEN}Starting frontend server...${NC}"
npm run dev &
FRONTEND_PID=$!
echo -e "${GREEN}Frontend started with PID: $FRONTEND_PID${NC}"

echo -e "${BLUE}Both services are now running!${NC}"
echo -e "${BLUE}Frontend: ${GREEN}http://localhost:3000${NC}"
echo -e "${BLUE}Backend API: ${GREEN}http://localhost:8000${NC}"
echo -e "${BLUE}API Documentation: ${GREEN}http://localhost:8000/docs${NC}"
echo -e "${BLUE}Press Ctrl+C to stop both services${NC}"

# Function to kill processes when script is terminated
cleanup() {
    echo -e "\n${BLUE}Shutting down services...${NC}"
    kill $FRONTEND_PID
    kill $BACKEND_PID
    echo -e "${GREEN}Services stopped.${NC}"
    exit 0
}

# Trap SIGINT (Ctrl+C) and SIGTERM
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait
