#!/bin/bash

echo "🧪 Testing PesaFlow API..."

BASE_URL="http://localhost:5000"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to make API call and check response
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo -e "\n${BLUE}Testing: $description${NC}"
    echo "curl -X $method $BASE_URL$endpoint"
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X $method \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [[ $http_code -ge 200 && $http_code -lt 300 ]]; then
        echo -e "${GREEN}✅ Success ($http_code)${NC}"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        echo -e "${RED}❌ Failed ($http_code)${NC}"
        echo "$body"
    fi
}

# Check if server is running
echo "🔍 Checking if server is running..."
if ! curl -s "$BASE_URL/health" > /dev/null; then
    echo -e "${RED}❌ Server is not running. Please start with 'npm run dev'${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Server is running!${NC}"

# Test API endpoints
test_endpoint "GET" "/" "" "Root endpoint"

test_endpoint "GET" "/health" "" "Health check"

test_endpoint "POST" "/api/users" '{
    "memberNumber": "MEM001",
    "fname": "John",
    "lname": "Doe",
    "email": "john@example.com",
    "phoneNumber": "+1234567890"
}' "Create user"

test_endpoint "GET" "/api/users" "" "Get all users"

test_endpoint "GET" "/api/users/MEM001" "" "Get specific user"

test_endpoint "POST" "/api/accounts" '{
    "memberNumber": "MEM001",
    "savings": 1000,
    "monthlyContribution": 100,
    "accountStatus": "active"
}' "Create account"

test_endpoint "GET" "/api/accounts" "" "Get all accounts"

test_endpoint "GET" "/api/accounts/MEM001" "" "Get specific account"

test_endpoint "POST" "/api/transactions" '{
    "memberNumber": "MEM001",
    "type": "deposit",
    "amount": 500,
    "status": "completed",
    "confirmedBy": "admin",
    "description": "Initial deposit"
}' "Create transaction"

test_endpoint "GET" "/api/transactions" "" "Get all transactions"

test_endpoint "GET" "/api/accounts/MEM001/summary" "" "Get account summary"

echo -e "\n${GREEN}🎉 API testing complete!${NC}"
echo -e "\n${BLUE}💡 You can also access:${NC}"
echo "  - MongoDB Admin UI: http://localhost:8081"
echo "  - API Documentation: $BASE_URL/"
