#!/bin/bash

echo "====================================="
echo "Testing Node.js Backend"
echo "====================================="
echo ""

# Kill existing processes
echo "1. Cleaning up existing processes..."
sudo fuser -k 8001/tcp 2>/dev/null || true
sleep 2

# Start server in background
echo "2. Starting server..."
cd /app/backend-node
node server.js > /tmp/backend-test.log 2>&1 &
SERVER_PID=$!
echo "   Server PID: $SERVER_PID"

# Wait for server to start
echo "3. Waiting for server to start..."
sleep 5

# Check if server is running
if ps -p $SERVER_PID > /dev/null; then
    echo "   ✓ Server is running"
else
    echo "   ✗ Server failed to start"
    cat /tmp/backend-test.log
    exit 1
fi

# Test health check endpoint
echo "4. Testing health check endpoint..."
RESPONSE=$(curl -s http://localhost:8001/api)
echo "   Response: $RESPONSE"

if echo "$RESPONSE" | grep -q "SplitWise API is running"; then
    echo "   ✓ Health check passed"
else
    echo "   ✗ Health check failed"
    cat /tmp/backend-test.log
    kill $SERVER_PID
    exit 1
fi

echo ""
echo "====================================="
echo "✅ Backend is ready for testing!"
echo "====================================="
echo ""
echo "Server is running on http://localhost:8001"
echo "API base URL: http://localhost:8001/api"
echo ""
echo "To stop the server:"
echo "  kill $SERVER_PID"
echo "  OR"
echo "  sudo fuser -k 8001/tcp"
echo ""
echo "Check logs:"
echo "  tail -f /tmp/backend-test.log"
echo ""
