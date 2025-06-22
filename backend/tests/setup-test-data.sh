#!/bin/bash

echo "🧪 Setting up comprehensive test data for PesaFlow API..."

BASE_URL="http://localhost:5000"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to make API call
api_call() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo -e "${BLUE}Creating: $description${NC}"
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "%{http_code}" -X $method \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "%{http_code}" -X $method "$BASE_URL$endpoint")
    fi
    
    http_code="${response: -3}"
    
    if [[ $http_code -ge 200 && $http_code -lt 300 ]]; then
        echo -e "  ${GREEN}✅ Success ($http_code)${NC}"
    else
        echo -e "  ${RED}❌ Failed ($http_code)${NC}"
        echo "  Response: ${response%???}"
    fi
}

# Check if server is running
echo "🔍 Checking if server is running..."
if ! curl -s "$BASE_URL/health" > /dev/null; then
    echo -e "${RED}❌ Server is not running. Please start with 'npm run dev'${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Server is running!${NC}\n"

# Create diverse users
echo -e "${YELLOW}👥 Creating Users...${NC}"

api_call "POST" "/api/users" '{
  "memberNumber": "MEM001",
  "fname": "John",
  "lname": "Doe",
  "email": "john.doe@example.com",
  "phoneNumber": "+1234567890",
  "emergencyContacts": [
    {
      "name": "Jane Doe",
      "relationship": "Wife",
      "phoneNumber": "+1234567891",
      "email": "jane.doe@example.com"
    }
  ]
}' "Primary test user"

api_call "POST" "/api/users" '{
  "memberNumber": "MEM002",
  "fname": "Maria",
  "lname": "García",
  "email": "maria.garcia@example.com",
  "phoneNumber": "+34987654321"
}' "User with special characters"

api_call "POST" "/api/users" '{
  "memberNumber": "MEM003",
  "fname": "Ahmed",
  "lname": "Hassan",
  "email": "ahmed.hassan@example.com",
  "phoneNumber": "+201234567890",
  "emergencyContacts": [
    {
      "name": "Fatima Hassan",
      "relationship": "Sister",
      "phoneNumber": "+201234567891"
    }
  ]
}' "User with emergency contact (no email)"

api_call "POST" "/api/users" '{
  "memberNumber": "MEM004",
  "fname": "Emma",
  "lname": "Thompson",
  "phoneNumber": "+447123456789"
}' "Minimal user data"

api_call "POST" "/api/users" '{
  "memberNumber": "MEM005",
  "fname": "Raj",
  "lname": "Patel",
  "email": "raj.patel@example.com",
  "phoneNumber": "+911234567890"
}' "User for inactive testing"

# Create accounts with different scenarios
echo -e "\n${YELLOW}💰 Creating Accounts...${NC}"

api_call "POST" "/api/accounts" '{
  "memberNumber": "MEM001",
  "savings": 5000,
  "monthlyContribution": 250,
  "sharesOwned": 10,
  "accountStatus": "active",
  "notes": "Premium member with high savings"
}' "Active account with high balance"

api_call "POST" "/api/accounts" '{
  "memberNumber": "MEM002",
  "savings": 1500,
  "monthlyContribution": 100,
  "accountStatus": "active"
}' "Standard active account"

api_call "POST" "/api/accounts" '{
  "memberNumber": "MEM003",
  "savings": 500,
  "monthlyContribution": 50,
  "accountStatus": "pending",
  "notes": "New member account pending approval"
}' "Pending account"

api_call "POST" "/api/accounts" '{
  "memberNumber": "MEM004",
  "accountStatus": "suspended",
  "notes": "Account temporarily suspended"
}' "Suspended account"

api_call "POST" "/api/accounts" '{
  "memberNumber": "MEM005",
  "savings": 2000,
  "sharesOwned": 5,
  "accountStatus": "active"
}' "Account for deactivation testing"

# Create diverse transactions
echo -e "\n${YELLOW}💸 Creating Transactions...${NC}"

# Completed deposits
api_call "POST" "/api/transactions" '{
  "transactionId": "TXN001",
  "memberNumber": "MEM001",
  "type": "deposit",
  "amount": 1000,
  "status": "completed",
  "confirmedBy": "admin",
  "description": "Initial deposit",
  "reference": "INIT001"
}' "Completed deposit"

api_call "POST" "/api/transactions" '{
  "memberNumber": "MEM001",
  "type": "contribution",
  "amount": 250,
  "status": "completed",
  "confirmedBy": "system",
  "description": "Monthly contribution - January",
  "category": "savings"
}' "Monthly contribution"

api_call "POST" "/api/transactions" '{
  "memberNumber": "MEM002",
  "type": "deposit",
  "amount": 750,
  "status": "completed",
  "confirmedBy": "teller1",
  "description": "Cash deposit at branch"
}' "Branch deposit"

# Pending transactions
api_call "POST" "/api/transactions" '{
  "memberNumber": "MEM001",
  "type": "withdrawal",
  "amount": 200,
  "status": "pending",
  "description": "ATM withdrawal request",
  "reference": "ATM001"
}' "Pending withdrawal"

api_call "POST" "/api/transactions" '{
  "memberNumber": "MEM002",
  "type": "loan_payment",
  "amount": 150,
  "status": "pending",
  "description": "Monthly loan payment"
}' "Pending loan payment"

# Share transactions
api_call "POST" "/api/transactions" '{
  "transactionId": "TXN_SHARE001",
  "memberNumber": "MEM001",
  "type": "share_purchase",
  "amount": 500,
  "status": "completed",
  "confirmedBy": "admin",
  "description": "Purchase of 5 shares at $100 each",
  "category": "shares"
}' "Share purchase"

# Different types of transactions
api_call "POST" "/api/transactions" '{
  "memberNumber": "MEM003",
  "type": "fee",
  "amount": 25,
  "status": "completed",
  "confirmedBy": "system",
  "description": "Monthly account maintenance fee",
  "category": "fee"
}' "Account fee"

api_call "POST" "/api/transactions" '{
  "memberNumber": "MEM001",
  "type": "dividend",
  "amount": 75,
  "status": "completed",
  "confirmedBy": "system",
  "description": "Quarterly dividend payment",
  "category": "shares"
}' "Dividend payment"

# Large amount transaction
api_call "POST" "/api/transactions" '{
  "memberNumber": "MEM005",
  "type": "deposit",
  "amount": 10000,
  "status": "completed",
  "confirmedBy": "manager",
  "description": "Large deposit - business income",
  "reference": "BUSINESS001"
}' "Large deposit"

# Failed transaction
api_call "POST" "/api/transactions" '{
  "memberNumber": "MEM002",
  "type": "withdrawal",
  "amount": 300,
  "status": "failed",
  "description": "ATM withdrawal failed - insufficient funds",
  "reference": "ATM002"
}' "Failed transaction"

# Test deactivating a user
echo -e "\n${YELLOW}🔄 Testing User Deactivation...${NC}"
api_call "DELETE" "/api/users/MEM005" "" "Soft delete user MEM005"

echo -e "\n${GREEN}🎉 Test data setup complete!${NC}"
echo -e "\n${BLUE}📊 Created test data:${NC}"
echo "  👥 5 Users (4 active, 1 deactivated)"
echo "  💰 5 Accounts (3 active, 1 pending, 1 suspended)"
echo "  💸 10 Transactions (7 completed, 2 pending, 1 failed)"
echo ""
echo -e "${BLUE}💡 You can now:${NC}"
echo "  1. Import the Postman collection"
echo "  2. Run all test scenarios"
echo "  3. View data in MongoDB UI: http://localhost:8081"
echo "  4. Test API endpoints with existing data"
echo ""
echo -e "${YELLOW}🧪 Suggested test scenarios:${NC}"
echo "  • Try creating duplicate users/accounts (should fail)"
echo "  • Test pagination with ?page=1&limit=2"
echo "  • Filter transactions by date range"
echo "  • Test balance updates on MEM001 (has highest balance)"
echo "  • Try withdrawing more than available balance"
echo "  • Test account summary endpoints"
