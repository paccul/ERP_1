#!/bin/bash

# Configuration
APP_URL=${APP_URL:-"http://localhost"}

echo "🚀 Running Smoke Tests for Garda ERP against $APP_URL"
echo "------------------------------------------------------"

# Test 1: Check /health endpoint
echo -n "Checking /health endpoint... "
HEALTH_HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL/health")
if [ "$HEALTH_HTTP_CODE" -eq 200 ]; then
    echo "✅ PASS (HTTP 200)"
else
    echo "❌ FAIL (HTTP $HEALTH_HTTP_CODE)"
    exit 1
fi

# Test 2: Check /login endpoint
echo -n "Checking /login endpoint... "
LOGIN_HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL/login")
if [ "$LOGIN_HTTP_CODE" -eq 200 ]; then
    echo "✅ PASS (HTTP 200)"
else
    echo "❌ FAIL (HTTP $LOGIN_HTTP_CODE)"
    exit 1
fi

echo "------------------------------------------------------"
echo "🎉 All smoke tests passed successfully!"
exit 0
