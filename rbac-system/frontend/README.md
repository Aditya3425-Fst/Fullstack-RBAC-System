# RBAC System — Frontend

Production-ready Admin Dashboard built with **React + Vite + JavaScript** implementing OTP login, JWT authentication, role-based navigation, and full user management.

## Tech Stack

- **Framework**: React 18 + Vite
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios (with interceptors)
- **State**: React Context API
- **Notifications**: React Toastify
- **Styling**: Plain CSS with CSS Variables

---

## Quick Start

### Prerequisites
- Node.js >= 18
- Backend running on `http://localhost:5000`

### Installation

```bash
cd frontend
npm install
```

### Environment Variables

Copy `.env.example` to `.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Run Development Server

```bash
npm run dev
```

Application starts at `http://localhost:5173`

---

## Application Flow

```
User Opens App
    ↓
Login Page
    ↓
Enter Mobile Number → POST /auth/send-otp
    ↓
OTP displayed (dev mode)
    ↓
Enter OTP → POST /auth/verify-otp
    ↓
JWT stored in localStorage
    ↓
Dashboard (role-based)
    ↓
All protected API calls auto-attach JWT
    ↓
Logout → Clear token
```

---

## Pages & Access

| Page       | URL          | Roles Allowed                    |
|------------|--------------|----------------------------------|
| Login      | /login       | Public                           |
| Dashboard  | /dashboard   | All authenticated                |
| Profile    | /profile     | All authenticated                |
| Users      | /users       | SUPER_ADMIN, ADMIN, MANAGER      |
| Logs       | /logs        | SUPER_ADMIN, ADMIN               |

---

## Features by Role

### SUPER_ADMIN
- Full dashboard with all stats
- View, create, update role, delete users
- View all audit logs with filters
- View login logs

### ADMIN
- Dashboard with user stats
- View and create users
- View all audit logs and login logs

### MANAGER
- Dashboard
- View users list (read-only)

### USER
- Dashboard (basic)
- Own profile

---

## Project Structure

```
frontend/
├── public/
│   └── favicon.svg
├── src/
│   ├── api/
│   │   └── axiosInstance.js     # Axios with interceptors
│   ├── components/
│   │   ├── common/              # Reusable UI components
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Select.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── ConfirmDialog.jsx
│   │   │   ├── Pagination.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── Loader.jsx
│   │   │   └── EmptyState.jsx
│   │   ├── layout/              # Navbar, Sidebar, Layout
│   │   └── routing/             # ProtectedRoute, RoleProtectedRoute
│   ├── constants/               # Roles, actions, routes
│   ├── context/
│   │   └── AuthContext.jsx      # Auth state, login, logout
│   ├── hooks/
│   │   ├── useUsers.js
│   │   └── useLogs.js
│   ├── pages/
│   │   ├── Login/
│   │   ├── Dashboard/
│   │   ├── Profile/
│   │   ├── Users/
│   │   ├── Logs/
│   │   ├── Unauthorized/
│   │   └── NotFound/
│   ├── services/
│   │   ├── authService.js
│   │   ├── userService.js
│   │   └── logService.js
│   ├── styles/
│   │   ├── global.css
│   │   └── variables.css
│   ├── utils/
│   │   ├── validators.js
│   │   ├── formatters.js
│   │   └── storage.js
│   ├── App.jsx
│   └── main.jsx
├── .env
├── .env.example
├── package.json
└── README.md
```

---

## Key Implementation Details

### Auth Context
Stored in React Context, persisted in localStorage. On mount, validates token by calling `/users/profile`. If invalid, clears session.

### Axios Interceptors
- **Request**: Automatically appends `Authorization: Bearer <token>` to every request.
- **Response**: On `401`, clears auth and redirects to `/login`.

### Route Protection
- `<ProtectedRoute>` — requires valid JWT
- `<RoleProtectedRoute roles={[...]}>`— requires specific role(s), redirects to `/unauthorized` if role doesn't match

### OTP Login (Development)
The API returns the OTP directly in dev mode. The login page displays it in a highlighted banner so you can test without SMS.

---

## Sample Users

Run `npm run seed` in the backend to create:

| Mobile     | Role        |
|------------|-------------|
| 9000000001 | SUPER_ADMIN |
| 9000000002 | ADMIN       |
| 9000000003 | MANAGER     |
| 9000000004 | USER        |

Quick-select buttons are shown on the login page for convenience.
