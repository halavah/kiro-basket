#!/bin/bash

# Navigate to the directory where the script is located
cd "$(dirname "$0")"

# Go back to project root directory
cd ..

# Navigate to server directory
cd server

echo "==================================="
echo "Starting Community Group Buying Backend Server"
echo "==================================="

# Check and kill process on port 3000
PORT=3000
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

# Check if .env.dev file exists
if [ ! -f ".env.dev" ]; then
    echo "Warning: .env.dev file not found!"
    echo "Please create a .env.dev file with the following configuration:"
    echo ""
    echo "# MySQL Configuration"
    echo "MYSQL_HOST=localhost"
    echo "MYSQL_PORT=3306"
    echo "MYSQL_USER=root"
    echo "MYSQL_PASSWORD=your_password"
    echo "MYSQL_DATABASE=kiro_basket"
    echo ""
    echo "# MongoDB Configuration"
    echo "MONGO_URI=mongodb://localhost:27017/kiro_basket"
    echo ""
    echo "# JWT Configuration"
    echo "JWT_SECRET=your_jwt_secret_key"
    echo "JWT_EXPIRES_IN=7d"
    echo ""
    echo "# Server Configuration"
    echo "PORT=3000"
    echo "NODE_ENV=development"
    echo ""
    echo "# CORS Configuration"
    echo "CORS_ORIGIN=*"
    echo ""
    echo "# File Upload Configuration"
    echo "UPLOAD_PATH=./uploads"
    echo "MAX_FILE_SIZE=2097152"
    echo ""
    exit 1
fi

# Start the server
echo "Starting server..."
echo "Environment: ${NODE_ENV:-development}"
echo "API will be available at: http://localhost:${PORT:-3000}/api"
echo "-----------------------------------"
node app-dev.js
