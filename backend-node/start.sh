#!/bin/bash

# Kill any existing process on port 8001
echo "Checking for existing processes on port 8001..."
sudo fuser -k 8001/tcp 2>/dev/null || true

# Wait a moment
sleep 2

# Start the Node.js backend
echo "Starting Node.js backend..."
cd /app/backend-node
node server.js
