# SplitWise Clone

Full-stack SplitWise-style expense sharing app with a React frontend and a Node.js/Express/MongoDB backend.

## Project Structure

```text
splito-main/
├── frontend/        # React + CRACO frontend
├── backend-node/    # Node.js + Express + MongoDB backend
├── contracts.md
└── README.md
```

## Tech Stack

- Frontend: React, CRACO, Tailwind CSS, Axios, Radix UI
- Backend: Node.js, Express, MongoDB, Mongoose, JWT
- Deployment:
  Vercel for frontend
  Render for backend

## Local Development

### 1. Clone and open the project

```bash
git clone <your-repo-url>
cd splito-main
```

### 2. Start the backend

```bash
cd backend-node
npm install
```

Create a `.env` file in `backend-node/` with:

```env
MONGO_URL=your_mongodb_connection_string
DB_NAME=your_database_name
JWT_SECRET=your_jwt_secret
```

Then run:

```bash
npm start
```

Backend runs on:

```text
http://localhost:8001
```

Health check:

```text
http://localhost:8001/api
```

### 3. Start the frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:3000
```

The frontend is configured to use:

```text
http://localhost:8001/api
```

by default, unless `REACT_APP_BACKEND_URL` is set.

## Available Commands

### Frontend

```bash
cd frontend
npm run dev
npm run build
npm test
```

### Backend

```bash
cd backend-node
npm start
npm run dev
```

## API Overview

Base URL:

```text
http://localhost:8001/api
```

Main endpoints:

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `GET /users/friends`
- `GET /users/search?query=...`
- `GET /groups`
- `GET /groups/:id`
- `POST /groups`
- `GET /expenses`
- `POST /expenses`
- `GET /settlements`
- `POST /settlements`
- `GET /balances`
- `GET /activity?type=all|expense|settlement`

## Deployment

### Frontend on Vercel

Use these settings:

- Framework Preset: `Create React App`
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `build`

Environment variable:

```env
REACT_APP_BACKEND_URL=https://your-render-backend-url.onrender.com
```

### Backend on Render

Use these settings:

- Language: `Node`
- Root Directory: `backend-node`
- Build Command: `npm install`
- Start Command: `npm start`
- Health Check Path: `/api`

Environment variables:

```env
MONGO_URL=your_mongodb_connection_string
DB_NAME=your_database_name
JWT_SECRET=your_jwt_secret
```

Do not manually set `PORT` on Render. The app already reads `process.env.PORT`.

## Notes

- The frontend no longer depends on Emergent tooling.
- The frontend production build currently passes successfully.
- The backend listens on `0.0.0.0` and supports Render deployment.

## Troubleshooting

### Frontend build fails on Vercel

If Vercel treats warnings as errors, make sure ESLint warnings are fixed before deploying.

### Backend cannot connect to MongoDB

Check:

- `MONGO_URL` is valid
- `DB_NAME` is set correctly
- MongoDB Atlas network access allows Render/local connections

### CORS or API errors in frontend

Check:

- backend is running
- frontend points to the correct backend URL
- deployed frontend uses `REACT_APP_BACKEND_URL`

## Security

If secrets were committed or shared during setup, rotate them before production:

- MongoDB password
- JWT secret

