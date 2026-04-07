# Backend Integration Contracts

## Overview
This document outlines the API contracts, data models, and integration strategy for replacing mock data with actual backend implementation.

## Data Currently Mocked (in /app/frontend/src/mock/mockData.js)
1. **Users** - currentUser, friends list
2. **Groups** - groups with members
3. **Expenses** - expenses with split details
4. **Settlements** - payment records
5. **Balances** - calculated from expenses and settlements
6. **Activities** - combined feed of expenses and settlements

---

## Database Models

### 1. User Model
```python
{
    "id": ObjectId,
    "name": str,
    "email": str (unique, indexed),
    "password": str (hashed),
    "avatar": str (URL),
    "created_at": datetime,
    "updated_at": datetime
}
```

### 2. Group Model
```python
{
    "id": ObjectId,
    "name": str,
    "description": str,
    "avatar": str (URL),
    "members": [ObjectId],  # user IDs
    "created_by": ObjectId,  # user ID
    "created_at": datetime,
    "updated_at": datetime
}
```

### 3. Expense Model
```python
{
    "id": ObjectId,
    "group_id": ObjectId,
    "description": str,
    "amount": float,
    "paid_by": ObjectId,  # user ID
    "split_type": str,  # "equal", "custom", "percentage"
    "splits": [
        {
            "user_id": ObjectId,
            "amount": float,
            "percentage": float (optional)
        }
    ],
    "category": str,
    "date": datetime,
    "created_at": datetime,
    "updated_at": datetime
}
```

### 4. Settlement Model
```python
{
    "id": ObjectId,
    "group_id": ObjectId,
    "paid_by": ObjectId,  # user ID
    "paid_to": ObjectId,  # user ID
    "amount": float,
    "date": datetime,
    "created_at": datetime,
    "updated_at": datetime
}
```

---

## API Contracts

### Authentication APIs

#### POST /api/auth/register
**Request:**
```json
{
    "name": "string",
    "email": "string",
    "password": "string"
}
```
**Response:**
```json
{
    "user": {
        "id": "string",
        "name": "string",
        "email": "string",
        "avatar": "string"
    },
    "token": "string"
}
```

#### POST /api/auth/login
**Request:**
```json
{
    "email": "string",
    "password": "string"
}
```
**Response:**
```json
{
    "user": {
        "id": "string",
        "name": "string",
        "email": "string",
        "avatar": "string"
    },
    "token": "string"
}
```

#### GET /api/auth/me
**Headers:** Authorization: Bearer {token}
**Response:**
```json
{
    "id": "string",
    "name": "string",
    "email": "string",
    "avatar": "string"
}
```

---

### User APIs

#### GET /api/users/friends
**Headers:** Authorization: Bearer {token}
**Response:**
```json
[
    {
        "id": "string",
        "name": "string",
        "email": "string",
        "avatar": "string"
    }
]
```

#### GET /api/users/search?query=email
**Headers:** Authorization: Bearer {token}
**Response:**
```json
[
    {
        "id": "string",
        "name": "string",
        "email": "string",
        "avatar": "string"
    }
]
```

---

### Group APIs

#### GET /api/groups
**Headers:** Authorization: Bearer {token}
**Response:**
```json
[
    {
        "id": "string",
        "name": "string",
        "description": "string",
        "avatar": "string",
        "members": ["user_id"],
        "created_by": "user_id",
        "created_at": "ISO date"
    }
]
```

#### GET /api/groups/{group_id}
**Headers:** Authorization: Bearer {token}
**Response:**
```json
{
    "id": "string",
    "name": "string",
    "description": "string",
    "avatar": "string",
    "members": [
        {
            "id": "string",
            "name": "string",
            "email": "string",
            "avatar": "string"
        }
    ],
    "created_by": "user_id",
    "created_at": "ISO date"
}
```

#### POST /api/groups
**Headers:** Authorization: Bearer {token}
**Request:**
```json
{
    "name": "string",
    "description": "string",
    "member_ids": ["user_id"]
}
```
**Response:**
```json
{
    "id": "string",
    "name": "string",
    "description": "string",
    "avatar": "string",
    "members": ["user_id"],
    "created_by": "user_id",
    "created_at": "ISO date"
}
```

---

### Expense APIs

#### GET /api/expenses?group_id={group_id}
**Headers:** Authorization: Bearer {token}
**Response:**
```json
[
    {
        "id": "string",
        "group_id": "string",
        "description": "string",
        "amount": 1000,
        "paid_by": "user_id",
        "paid_by_name": "string",
        "split_type": "equal",
        "splits": [
            {
                "user_id": "string",
                "user_name": "string",
                "amount": 500,
                "percentage": 50
            }
        ],
        "category": "Food",
        "date": "ISO date",
        "created_at": "ISO date"
    }
]
```

#### POST /api/expenses
**Headers:** Authorization: Bearer {token}
**Request:**
```json
{
    "group_id": "string",
    "description": "string",
    "amount": 1000,
    "split_type": "equal|custom|percentage",
    "splits": [
        {
            "user_id": "string",
            "amount": 500,
            "percentage": 50
        }
    ],
    "category": "Food",
    "date": "ISO date"
}
```
**Response:**
```json
{
    "id": "string",
    "group_id": "string",
    "description": "string",
    "amount": 1000,
    "paid_by": "user_id",
    "split_type": "equal",
    "splits": [...],
    "category": "Food",
    "date": "ISO date",
    "created_at": "ISO date"
}
```

---

### Settlement APIs

#### GET /api/settlements?group_id={group_id}
**Headers:** Authorization: Bearer {token}
**Response:**
```json
[
    {
        "id": "string",
        "group_id": "string",
        "paid_by": "user_id",
        "paid_by_name": "string",
        "paid_to": "user_id",
        "paid_to_name": "string",
        "amount": 500,
        "date": "ISO date",
        "created_at": "ISO date"
    }
]
```

#### POST /api/settlements
**Headers:** Authorization: Bearer {token}
**Request:**
```json
{
    "group_id": "string",
    "paid_to": "user_id",
    "amount": 500
}
```
**Response:**
```json
{
    "id": "string",
    "group_id": "string",
    "paid_by": "user_id",
    "paid_to": "user_id",
    "amount": 500,
    "date": "ISO date",
    "created_at": "ISO date"
}
```

---

### Balance & Activity APIs

#### GET /api/balances
**Headers:** Authorization: Bearer {token}
**Response:**
```json
{
    "user_id_1": 500,   // positive means they owe you
    "user_id_2": -300,  // negative means you owe them
    "user_id_3": 0
}
```

#### GET /api/activity
**Headers:** Authorization: Bearer {token}
**Query Params:** ?type=all|expense|settlement
**Response:**
```json
[
    {
        "id": "string",
        "type": "expense|settlement",
        "description": "string",
        "amount": 1000,
        "group_id": "string",
        "group_name": "string",
        "paid_by": "user_id",
        "paid_by_name": "string",
        "paid_to": "user_id",  // for settlements
        "paid_to_name": "string",  // for settlements
        "category": "Food",  // for expenses
        "split_type": "equal",  // for expenses
        "date": "ISO date",
        "created_at": "ISO date"
    }
]
```

---

## Backend Implementation Plan

### 1. Authentication & Authorization
- Implement JWT token generation and validation
- Hash passwords using bcrypt/passlib
- Create authentication middleware for protected routes
- Generate avatar URLs using dicebear API

### 2. User Management
- User registration with email validation
- User login with password verification
- Get friends (users in same groups)
- Search users by email

### 3. Group Management
- Create groups with members
- Get user's groups
- Get group details with populated member info
- Add/remove members (future enhancement)

### 4. Expense Management
- Create expenses with split validation
- Calculate splits based on type (equal/custom/percentage)
- Get expenses by group
- Validate split totals match expense amount

### 5. Settlement Management
- Record settlements between users
- Get settlements by group
- Update balances after settlement

### 6. Balance Calculation
- Calculate balances from expenses and settlements
- Handle multi-group scenarios
- Return consolidated balances per user

### 7. Activity Feed
- Combine expenses and settlements
- Sort by created_at timestamp
- Filter by type
- Include user and group names

---

## Frontend Integration Changes

### Files to Update:

#### 1. Create API Service Layer: `/app/frontend/src/services/api.js`
- Centralized axios instance with auth headers
- All API calls in one place

#### 2. Update Context: `/app/frontend/src/context/AuthContext.js`
- Replace mock login/register with actual API calls
- Store JWT token
- Add token to all requests

#### 3. Update Pages:
- **Dashboard.js** - fetch balances and activities from API
- **Groups.js** - fetch groups from API
- **GroupDetail.js** - fetch group details, expenses, settlements
- **AddExpense.js** - submit expense to API
- **Balances.js** - fetch balances from API, create settlements
- **Activity.js** - fetch activity feed from API
- **Login.js** - call login API
- **Register.js** - call register API

#### 4. Remove Mock Data:
- Delete `/app/frontend/src/mock/mockData.js` after integration
- Remove all imports of mock data

---

## Error Handling Strategy

### Backend:
- Use proper HTTP status codes
- Return consistent error format:
```json
{
    "error": "Error message",
    "details": "Detailed error description"
}
```

### Frontend:
- Handle 401 (unauthorized) - redirect to login
- Handle 404 (not found) - show friendly message
- Handle 500 (server error) - show error toast
- Show loading states during API calls

---

## Testing Checklist

### Backend:
- [ ] User registration
- [ ] User login
- [ ] JWT token validation
- [ ] Create group
- [ ] Add expense (all split types)
- [ ] Record settlement
- [ ] Calculate balances correctly
- [ ] Activity feed sorting

### Frontend Integration:
- [ ] Login flow
- [ ] Registration flow
- [ ] Dashboard loads real data
- [ ] Groups page loads real groups
- [ ] Add expense submits correctly
- [ ] Balance calculations match
- [ ] Settlements update balances
- [ ] Activity feed shows real data
- [ ] Logout clears token

---

## Notes:
- Currency is INR only (no multi-currency)
- All dates stored in UTC, displayed in Indian timezone
- Avatar URLs generated using dicebear API
- Token expiry: 7 days
- Password minimum length: 6 characters
