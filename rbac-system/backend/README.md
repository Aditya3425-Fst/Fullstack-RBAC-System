# RBAC System — Backend API

Production-ready REST API built with **Node.js + Express + MongoDB** implementing OTP authentication, JWT authorization, and Role-Based Access Control.

## Tech Stack

- **Runtime**: Node.js (LTS)
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Auth**: JWT + OTP (6-digit, 60-second expiry)
- **Security**: Helmet, CORS, Rate Limiting, bcrypt
- **Logging**: Winston (file + console)
- **Validation**: express-validator

---

## Quick Start

### Prerequisites
- Node.js >= 18
- MongoDB running locally or a MongoDB Atlas URI

### Installation

```bash
cd backend
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in values:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/rbac-system
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_EXPIRES_IN=7d
OTP_EXPIRY=60
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Seed Sample Users

```bash
npm run seed
```

This creates 5 sample users:

| Mobile     | Role        | Active |
|------------|-------------|--------|
| 9000000001 | SUPER_ADMIN | ✅     |
| 9000000002 | ADMIN       | ✅     |
| 9000000003 | MANAGER     | ✅     |
| 9000000004 | USER        | ✅     |
| 9000000005 | USER        | ❌     |

### Run Development Server

```bash
npm run dev
```

Server starts at `http://localhost:5000`

### Run Production

```bash
npm start
```

---

## API Reference

### Base URL
```
http://localhost:5000/api
```

### Authentication

#### Send OTP
```
POST /auth/send-otp
Content-Type: application/json

{
  "mobile": "9000000001"
}
```

**Response (development mode)**:
```json
{
  "success": true,
  "message": "OTP sent successfully.",
  "data": {
    "message": "OTP sent successfully",
    "expiresIn": 60,
    "otp": "123456"
  }
}
```

#### Verify OTP
```
POST /auth/verify-otp
Content-Type: application/json

{
  "mobile": "9000000001",
  "otp": "123456"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "_id": "...",
      "name": "Super Admin",
      "mobile": "9000000001",
      "role": "SUPER_ADMIN",
      "isActive": true
    }
  }
}
```

### Protected Routes

All protected routes require:
```
Authorization: Bearer <token>
```

#### Get My Profile
```
GET /users/profile
```

#### Get All Users (SUPER_ADMIN, ADMIN, MANAGER)
```
GET /users?page=1&limit=10&search=&role=&isActive=
```

#### Create User (SUPER_ADMIN, ADMIN)
```
POST /users
Content-Type: application/json

{
  "name": "New User",
  "mobile": "9876543210",
  "role": "USER",
  "isActive": true
}
```

#### Update Role (SUPER_ADMIN)
```
PATCH /users/:id/role
Content-Type: application/json

{
  "role": "ADMIN"
}
```

#### Delete User (SUPER_ADMIN)
```
DELETE /users/:id
```

#### Get All Logs (SUPER_ADMIN, ADMIN)
```
GET /logs?page=1&limit=10&action=&status=&search=&startDate=&endDate=&sortBy=createdAt&sortOrder=desc
```

#### Get Login Logs (SUPER_ADMIN, ADMIN)
```
GET /logs/login?page=1&limit=10
```

---

## Roles & Permissions

| Endpoint              | SUPER_ADMIN | ADMIN | MANAGER | USER |
|-----------------------|:-----------:|:-----:|:-------:|:----:|
| GET /users/profile    | ✅          | ✅    | ✅      | ✅   |
| GET /users            | ✅          | ✅    | ✅      | ❌   |
| POST /users           | ✅          | ✅    | ❌      | ❌   |
| PATCH /users/:id/role | ✅          | ❌    | ❌      | ❌   |
| DELETE /users/:id     | ✅          | ❌    | ❌      | ❌   |
| GET /logs             | ✅          | ✅    | ❌      | ❌   |
| GET /logs/login       | ✅          | ✅    | ❌      | ❌   |

---

## Audit Log Actions

| Action         | Description                        |
|----------------|------------------------------------|
| OTP_GENERATED  | OTP generated for a mobile number  |
| OTP_VERIFIED   | OTP successfully verified          |
| OTP_INVALID    | Wrong OTP entered                  |
| OTP_EXPIRED    | OTP expired before use             |
| LOGIN_SUCCESS  | Successful login                   |
| LOGIN_FAILED   | Failed login attempt               |
| ACCESS_DENIED  | Insufficient role for resource     |
| USER_CREATED   | New user created                   |
| ROLE_UPDATED   | User role changed                  |
| USER_DELETED   | User deleted                       |

---

## Project Structure

```
backend/
├── src/
│   ├── config/          # Database connection
│   ├── constants/       # Roles, action types
│   ├── controllers/     # Request/response handlers
│   ├── middleware/      # Auth, RBAC, validation, errors
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express route definitions
│   ├── services/        # Business logic
│   ├── utils/           # Helpers (JWT, OTP, seed, logger)
│   ├── validators/      # express-validator chains
│   ├── app.js           # Express app setup
│   └── server.js        # Entry point
├── logs/                # Winston log files
├── .env
├── .env.example
├── package.json
└── README.md
```

---

## Security Features

- **Helmet** — sets secure HTTP headers
- **CORS** — restricted to frontend origin
- **Rate Limiting** — 5 OTP requests/5min, 20 auth requests/15min, 100 API requests/15min
- **JWT** — signed tokens with expiry
- **Input Validation** — all inputs validated with express-validator
- **Error Handling** — no stack traces exposed in production
- **OTP** — 60-second expiry, max 3 wrong attempts, single-use
