#!/bin/bash

# Test webhook script for API Health Dashboard
# This script sends sample webhook data to test the system

API_BASE_URL="http://localhost:3000"
WEBHOOK_ENDPOINT="/webhooks/api_status"

echo "🚀 Testing API Health Dashboard Webhook Endpoint"
echo "================================================"
echo ""

# Test 1: GitHub API - UP status
echo "📡 Testing GitHub API (UP)..."
curl -X POST "${API_BASE_URL}${WEBHOOK_ENDPOINT}" \
  -H "Content-Type: application/json" \
  -d '{
    "api_status": {
      "api_name": "github",
      "status": "UP",
      "response_time": 245,
      "status_code": 200,
      "endpoint": "https://api.github.com/users/octocat"
    }
  }' \
  --silent --show-error | jq '.'

echo ""

# Test 2: Stripe API - UP status
echo "💳 Testing Stripe API (UP)..."
curl -X POST "${API_BASE_URL}${WEBHOOK_ENDPOINT}" \
  -H "Content-Type: application/json" \
  -d '{
    "api_status": {
      "api_name": "stripe",
      "status": "UP",
      "response_time": 156,
      "status_code": 200,
      "endpoint": "https://api.stripe.com/v1/charges"
    }
  }' \
  --silent --show-error | jq '.'

echo ""

# Test 3: JSONPlaceholder API - SLOW status
echo "📊 Testing JSONPlaceholder API (SLOW)..."
curl -X POST "${API_BASE_URL}${WEBHOOK_ENDPOINT}" \
  -H "Content-Type: application/json" \
  -d '{
    "api_status": {
      "api_name": "jsonplaceholder",
      "status": "SLOW",
      "response_time": 1200,
      "status_code": 200,
      "endpoint": "https://jsonplaceholder.typicode.com/posts/1",
      "error_message": "Response time above threshold"
    }
  }' \
  --silent --show-error | jq '.'

echo ""

# Test 4: Custom API - DOWN status
echo "🔧 Testing Custom API (DOWN)..."
curl -X POST "${API_BASE_URL}${WEBHOOK_ENDPOINT}" \
  -H "Content-Type: application/json" \
  -d '{
    "api_status": {
      "api_name": "custom_api",
      "status": "DOWN",
      "response_time": 0,
      "status_code": 500,
      "endpoint": "https://example.com/api/health",
      "error_message": "Connection timeout after 30 seconds"
    }
  }' \
  --silent --show-error | jq '.'

echo ""

# Test 5: Invalid data (should fail)
echo "❌ Testing invalid data (should fail)..."
curl -X POST "${API_BASE_URL}${WEBHOOK_ENDPOINT}" \
  -H "Content-Type: application/json" \
  -d '{
    "api_status": {
      "api_name": "",
      "status": "INVALID"
    }
  }' \
  --silent --show-error | jq '.'

echo ""
echo "✅ Webhook testing complete!"
echo ""
echo "💡 Now check your dashboard at: dashboard/index.html"
echo "🔄 Or test the API endpoints:"
echo "   GET ${API_BASE_URL}/api/v1/api_statuses"
echo "   GET ${API_BASE_URL}/api/v1/api_statuses/github"
echo ""