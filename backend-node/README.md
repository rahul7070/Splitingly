# Splitwise Clone - Node.js Express MongoDB Backend

A complete backend implementation for a Splitwise-like expense splitting application.

## 📁 Project Structure

```
backend-node/
├── config/
│   └── database.js          # MongoDB connection setup
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── models/
│   ├── User.js              # User schema
│   ├── Group.js             # Group schema
│   ├── Expense.js           # Expense schema
│   └── Settlement.js        # Settlement schema
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── users.js             # User management routes
│   ├── groups.js            # Group management routes
│   ├── expenses.js          # Expense routes
│   ├── settlements.js       # Settlement routes
│   └── balancesActivity.js  # Balance & activity routes
├── utils/
│   ├── generateToken.js     # JWT token generation
│   └── generateAvatar.js    # Avatar URL generation
├── .env                     # Environment variables
├── package.json             # Dependencies
└── server.js                # Main server file
```

## 🚀 Getting Started

### Prerequisites
- Node.js v14+ installed
- MongoDB running on localhost:27017

### Installation

1. **Navigate to backend directory:**
```bash
cd /app/backend-node
```

2. **Install dependencies (already done):**
```bash
yarn install
```

3. **Start the server:**
```bash
node server.js
```

The server will start on `http://localhost:8001`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Users
- `GET /api/users/friends` - Get friends list (requires auth)
- `GET /api/users/search?query=email` - Search users (requires auth)

### Groups
- `GET /api/groups` - Get all user groups (requires auth)
- `GET /api/groups/:id` - Get group details (requires auth)
- `POST /api/groups` - Create new group (requires auth)

### Expenses
- `GET /api/expenses?group_id=xxx` - Get expenses (requires auth)
- `POST /api/expenses` - Create expense (requires auth)

### Settlements
- `GET /api/settlements?group_id=xxx` - Get settlements (requires auth)
- `POST /api/settlements` - Record settlement (requires auth)

### Balances & Activity
- `GET /api/balances` - Get user balances (requires auth)
- `GET /api/activity?type=all|expense|settlement` - Get activity feed (requires auth)

## 🔧 Environment Variables

`.env` file contains:
```
PORT=8001
MONGO_URL=mongodb://localhost:27017
DB_NAME=test_database
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRE=7d
```

## 🧪 Testing the API

### 1. Register a User
```bash
curl -X POST http://localhost:8001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Save the token from the response.

### 3. Create a Group (use token)
```bash
curl -X POST http://localhost:8001/api/groups \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Weekend Trip",
    "description": "Trip expenses",
    "member_ids": []
  }'
```

### 4. Create an Expense
```bash
curl -X POST http://localhost:8001/api/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "group_id": "GROUP_ID_HERE",
    "description": "Dinner",
    "amount": 1000,
    "split_type": "equal",
    "splits": [{"user_id": "USER_ID_HERE"}],
    "category": "Food"
  }'
```

### 5. Get Balances
```bash
curl -X GET http://localhost:8001/api/balances \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📝 Features

✅ **JWT Authentication** - Secure token-based auth  
✅ **Password Hashing** - bcryptjs for secure passwords  
✅ **Mongoose ODM** - MongoDB object modeling  
✅ **Input Validation** - Express validator  
✅ **CORS Enabled** - Cross-origin requests allowed  
✅ **Three Split Types** - Equal, Custom, Percentage  
✅ **Balance Calculation** - Auto-calculated balances  
✅ **Activity Feed** - Combined expenses & settlements  

## 🔒 Authentication

All protected routes require JWT token in header:
```
Authorization: Bearer <token>
```

Token is received after successful login/registration and expires in 7 days.

## 💾 Database Schema

### User
- name, email, password (hashed), avatar
- Timestamps: createdAt, updatedAt

### Group
- name, description, avatar, members[], createdBy
- Timestamps: createdAt, updatedAt

### Expense
- groupId, description, amount, paidBy, splitType, splits[], category, date
- Timestamps: createdAt, updatedAt

### Settlement
- groupId, paidBy, paidTo, amount, date
- Timestamps: createdAt, updatedAt

## 🐛 Troubleshooting

**Port already in use:**
```bash
# Kill process on port 8001
sudo fuser -k 8001/tcp
```

**MongoDB connection error:**
```bash
# Check if MongoDB is running
sudo systemctl status mongodb
# OR
ps aux | grep mongod
```

**Module not found:**
```bash
# Reinstall dependencies
cd /app/backend-node
rm -rf node_modules
yarn install
```

## 📦 Dependencies

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT tokens
- **dotenv** - Environment variables
- **cors** - Cross-origin resource sharing
- **express-validator** - Input validation

## 🔗 Integration with Frontend

The frontend at `/app/frontend` is already configured to use this backend via:
- Base URL: `http://localhost:8001/api`
- All API contracts match between frontend and backend
- JWT tokens stored in localStorage

## ✨ Ready to Use!

The backend is complete and ready for manual testing. All routes are implemented following REST best practices.
