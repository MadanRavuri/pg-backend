# PG Backend

Express.js + MongoDB backend for PG Management System.

## Setup

1. Copy `.env.example` to `.env` and fill in your MongoDB URI.
2. Run `npm install` in the `server` folder.
3. Start server: `npm start` or `node index.js`

## Endpoints
- `/api/rooms`
- `/api/tenants`
- `/api/expenses`
- `/api/rentPayments`
- `/api/settings`

## Environment Variables
- `VITE_MONGODB_URI`: MongoDB connection string
- `PORT`: Server port (default: 3001)
