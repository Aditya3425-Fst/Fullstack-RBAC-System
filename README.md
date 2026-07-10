# RBAC System — Full Stack Authentication & User Management

A production-ready Full Stack Web Application implementing **OTP-based Authentication**, **JWT Authorization**, **Role-Based Access Control (RBAC)**, **User Management**, and **Audit Logging**.

---

## Project Structure

```
rbac-system/
├── backend/          Node.js + Express + MongoDB REST API
└── frontend/         React + Vite Application
```

Both projects are fully independent and communicate only through REST APIs.

---

## Tech Stack

### Backend
- **Runtime**: Node.js (LTS)
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Auth**: JWT + OTP (6-digit)
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Winston
- **Validation**: express-validator

### Frontend
- **Framework**: React 18 + Vite
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios (with interceptors)
- **State**: React Context API
- **Notifications**: React Toastify
- **Styling**: Plain CSS

---

## Roles & Permissions

| Role | Access |
|---|---|
| `SUPER_ADMIN` | Full access — manage users, roles, view all logs |
| `ADMIN` | Manage users + view logs |
| `MANAGER` | View users only |
| `USER` | View own profile only |

---

## Quick Start

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas)

---

### 1. Clone / Open the project

```bash
cd rbac-system
```

---

### 2. Setup Backend

```bash
cd backend
npm install
```

Create your `.env` (already included):

```env
PORT=5001
MONGODB_URI=your_mongodb_uri/rbac-system
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
OTP_EXPIRY=60
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Seed sample users:

```bash
npm run seed
```

Start the backend:

```bash
npm run dev
```

Backend runs at → **http://localhost:5001**

---

### 3. Setup Frontend

Open a new terminal:

```bash
cd frontend
npm install
```

Your `.env` (already included):

```env
VITE_API_BASE_URL=http://localhost:5001/api
```

Start the frontend:

```bash
npm run dev
```

Frontend runs at → **http://localhost:5173**

---

## Sample Users (after seed)

| Mobile | Role | Active |
|---|---|---|
| `9000000001` | SUPER_ADMIN | ✅ |
| `9000000002` | ADMIN | ✅ |
| `9000000003` | MANAGER | ✅ |
| `9000000004` | USER | ✅ |
| `9000000005` | USER | ❌ |

> In development mode, the OTP is displayed directly on the login screen — no SMS required.

---

## Application Flow

```
Enter Mobile Number
       ↓
Send OTP  →  POST /api/auth/send-otp
       ↓
Enter OTP  →  POST /api/auth/verify-otp
       ↓
Existing user?     →  Login → Dashboard
New number?        →  Enter name + Select Role → Register → Dashboard
```

---

## API Reference

### Base URL
```
http://localhost:5001/api
```

### Auth
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/auth/send-otp` | Send OTP to any mobile | Public |
| POST | `/auth/verify-otp` | Verify OTP | Public |
| POST | `/auth/register` | Register new user after OTP | Public |

### Users
| Method | Endpoint | Description | Roles |
|---|---|---|---|
| GET | `/users/profile` | Get own profile | All |
| GET | `/users` | List all users | SUPER_ADMIN, ADMIN, MANAGER |
| POST | `/users` | Create a user | SUPER_ADMIN, ADMIN |
| PATCH | `/users/:id/role` | Update user role | SUPER_ADMIN |
| DELETE | `/users/:id` | Delete a user | SUPER_ADMIN |

### Logs
| Method | Endpoint | Description | Roles |
|---|---|---|---|
| GET | `/logs` | All audit logs | SUPER_ADMIN, ADMIN |
| GET | `/logs/login` | Login-related logs | SUPER_ADMIN, ADMIN |

### Health Check
```
GET http://localhost:5001/health
```

---

## Audit Log Events

| Action | Trigger |
|---|---|
| `OTP_GENERATED` | OTP sent to a mobile |
| `OTP_VERIFIED` | OTP successfully verified |
| `OTP_INVALID` | Wrong OTP entered |
| `OTP_EXPIRED` | OTP expired before use |
| `LOGIN_SUCCESS` | Successful login |
| `LOGIN_FAILED` | Failed login attempt |
| `ACCESS_DENIED` | Insufficient role for a route |
| `USER_CREATED` | New user created |
| `ROLE_UPDATED` | User role changed |
| `USER_DELETED` | User deleted |

---

## Security Features

- **Helmet** — secure HTTP headers
- **CORS** — restricted to frontend origin only
- **Rate Limiting** — OTP: 5 req/5min · Auth: 20 req/15min · API: 100 req/15min
- **JWT** — signed tokens with configurable expiry
- **Input Validation** — all inputs validated with express-validator
- **OTP** — 60s expiry, max 3 wrong attempts, single-use
- **Inactive users** — blocked from logging in

---

## MongoDB Collections

### users
```json
{
  "_id": "ObjectId",
  "name": "string",
  "mobile": "string (10 digits)",
  "role": "SUPER_ADMIN | ADMIN | MANAGER | USER",
  "isActive": "boolean",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### otps
```json
{
  "_id": "ObjectId",
  "mobile": "string",
  "otp": "string (6 digits)",
  "expiresAt": "Date",
  "attemptCount": "number",
  "isUsed": "boolean",
  "createdAt": "Date"
}
```

### logs
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: users)",
  "mobile": "string",
  "action": "string",
  "status": "SUCCESS | FAILURE",
  "message": "string",
  "ipAddress": "string",
  "userAgent": "string",
  "createdAt": "Date"
}
```

---

## Frontend Pages

| Page | URL | Access |
|---|---|---|
| Login | `/login` | Public |
| Dashboard | `/dashboard` | All authenticated |
| Profile | `/profile` | All authenticated |
| Users | `/users` | SUPER_ADMIN, ADMIN, MANAGER |
| Audit Logs | `/logs` | SUPER_ADMIN, ADMIN |
| Unauthorized | `/unauthorized` | Shown on access denied |

---

## Available Scripts

### Backend
```bash
npm run dev      # Start with nodemon (development)
npm start        # Start without nodemon (production)
npm run seed     # Seed sample users into database
npm run lint     # Run ESLint
```

### Frontend
```bash
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

---

## Twilio SMS Integration (Optional)

To enable real OTP SMS delivery:

1. Create a Twilio account at [twilio.com](https://twilio.com)
2. Install the SDK: `npm install twilio` in the backend
3. Add to `backend/.env`:
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```
4. Create `src/services/smsService.js` and call it from `sendOTP` in `authService.js`

> In `development` mode the OTP is always returned in the API response, so Twilio is not required for testing.

---

## Author

Built as a production-ready RBAC assignment demonstrating:
- Clean architecture with separated Controllers, Services, Models, Middleware
- SOLID principles and modular code organization
- Secure JWT + OTP authentication
- Role-Based Access Control with audit logging
- Full-stack React + Node.js integration
