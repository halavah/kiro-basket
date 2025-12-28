#!/bin/bash

# Navigate to the directory where the script is located
cd "$(dirname "$0")"

# Go back to project root directory
cd ..

# Navigate to client-resident directory
cd client-resident

echo "==================================="
echo "Starting Client Resident Frontend"
echo "==================================="

# Check and kill process on port 5174
PORT=5174
echo "Checking port $PORT..."
PID=$(lsof -ti:$PORT)
if [ ! -z "$PID" ]; then
    echo "Port $PORT is occupied by process $PID. Killing process..."
    kill -9 $PID
    sleep 1
    echo "Process killed successfully."
else
    echo "Port $PORT is available."
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "node_modules not found. Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "Failed to install dependencies."
        exit 1
    fi
    echo "Dependencies installed successfully."
fi

# Start the development server
echo "Starting Vite development server..."
echo "Frontend will be available at: http://localhost:5174"
echo "-----------------------------------"
npm run dev
