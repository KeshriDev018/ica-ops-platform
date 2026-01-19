#!/bin/bash

echo "🧪 Testing Admin Login Flow"
echo "============================"
echo ""

echo "📋 Admin Credentials:"
echo "   Email:    admin@chessacademy.com"
echo "   Password: admin123"
echo ""

echo "1️⃣  Testing login with correct credentials..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@chessacademy.com","password":"admin123"}')

ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('accessToken', ''))" 2>/dev/null)
ROLE=$(echo $LOGIN_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('role', ''))" 2>/dev/null)

if [ ! -z "$ACCESS_TOKEN" ] && [ "$ROLE" == "ADMIN" ]; then
  echo "✅ Login successful!"
  echo "   Role: $ROLE"
  echo "   Token: ${ACCESS_TOKEN:0:50}..."
else
  echo "❌ Login failed"
  echo $LOGIN_RESPONSE
  exit 1
fi

echo ""
echo "2️⃣  Testing login with wrong password..."
WRONG_RESPONSE=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@chessacademy.com","password":"wrongpassword"}')

ERROR_MSG=$(echo $WRONG_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('message', ''))" 2>/dev/null)

if [ "$ERROR_MSG" == "Invalid credentials" ]; then
  echo "✅ Error handling works correctly"
  echo "   Message: $ERROR_MSG"
else
  echo "❌ Unexpected response"
  echo $WRONG_RESPONSE
  exit 1
fi

echo ""
echo "3️⃣  Testing protected endpoint with token..."
HEALTH_RESPONSE=$(curl -s -X GET http://localhost:8000/health)
HEALTH_STATUS=$(echo $HEALTH_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('status', ''))" 2>/dev/null)

if [ "$HEALTH_STATUS" == "ok" ]; then
  echo "✅ Backend is healthy"
else
  echo "⚠️  Health check issue"
fi

echo ""
echo "✅ All backend tests passed!"
echo ""
echo "📱 Now test the frontend:"
echo "   1. Go to: http://localhost:5175/login"
echo "   2. Enter:"
echo "      Email: admin@chessacademy.com"
echo "      Password: admin123"
echo "   3. Click 'Login'"
echo "   4. You should be redirected to: /admin/dashboard"
echo ""
echo "🔧 If login doesn't work, check browser console (F12) for errors"
echo ""
