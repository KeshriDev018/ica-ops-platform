#!/bin/bash

echo "🧪 Testing Demo Account Access Flow"
echo "===================================="
echo ""

# Test email
EMAIL="test-demo-flow@example.com"

echo "1️⃣  Creating demo booking..."
DEMO_RESPONSE=$(curl -s -X POST http://localhost:8000/api/demos \
  -H "Content-Type: application/json" \
  -d "{
    \"studentName\": \"Test Flow Student\",
    \"parentName\": \"Test Flow Parent\",
    \"parentEmail\": \"${EMAIL}\",
    \"studentAge\": 10,
    \"country\": \"India\",
    \"timezone\": \"Asia/Kolkata\",
    \"scheduledStart\": \"2026-01-27T10:00:00Z\",
    \"scheduledEnd\": \"2026-01-27T11:00:00Z\"
  }")

DEMO_ID=$(echo $DEMO_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['_id'])" 2>/dev/null)

if [ -z "$DEMO_ID" ]; then
  echo "❌ Failed to create demo"
  echo $DEMO_RESPONSE
  exit 1
fi

echo "✅ Demo created with ID: $DEMO_ID"
echo ""

echo "2️⃣  Verifying demo by email..."
VERIFY_RESPONSE=$(curl -s -X POST http://localhost:8000/api/demos/verify \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"${EMAIL}\"}")

VERIFIED_ID=$(echo $VERIFY_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('_id', ''))" 2>/dev/null)

if [ "$VERIFIED_ID" == "$DEMO_ID" ]; then
  echo "✅ Demo verified successfully!"
else
  echo "❌ Demo verification failed"
  echo $VERIFY_RESPONSE
  exit 1
fi

echo ""
echo "3️⃣  Demo data retrieved:"
echo $VERIFY_RESPONSE | python3 -m json.tool 2>/dev/null | grep -E "(studentName|parentEmail|status|scheduledStart)" | head -4

echo ""
echo "✅ All tests passed!"
echo ""
echo "📱 Now you can test the frontend:"
echo "   1. Go to: http://localhost:5175/demo-login"
echo "   2. Enter email: $EMAIL"
echo "   3. Click 'Access Demo Account'"
echo "   4. You should see the demo details page!"
echo ""
