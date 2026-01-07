# Security Analysis Platform - Frontend

A production-grade security analysis web application built with React, TypeScript, and Tailwind CSS.

## Features

- **Google OAuth Authentication** - Secure login with Google accounts
- **Security Analysis Workspace** - Analyze code, API endpoints, SQL queries, and configuration files
- **Vulnerability Views** - Detailed views for attacker, defender, payload, and impact analysis
- **Risk Assessment** - Visual risk scoring and severity badges
- **Dashboard** - Comprehensive metrics with charts and statistics
- **Analysis History** - View and review past security analyses
- **Ethical Guardrails** - Built-in ethical disclaimers and read-only analysis

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- Recharts

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Configure environment variables:
- `VITE_API_BASE_URL` - Your backend API URL (default: http://localhost:3000)
- `VITE_GOOGLE_CLIENT_ID` - Your Google OAuth Client ID

4. Start the development server:
```bash
npm run dev
```

## Project Structure

```
src/
 ├─ api/        # API clients (auth, analysis, ethics)
 ├─ pages/      # Page components (Login, Dashboard, Analysis, History)
 ├─ components/ # Reusable components (ProtectedRoute, RiskMeter, etc.)
 ├─ context/    # React context (AuthContext)
 ├─ types/      # TypeScript type definitions
 └─ utils/      # Utility functions
```

## Backend Integration

This frontend integrates with a Node.js + Express + MongoDB backend. Ensure the backend is running and accessible at the configured `VITE_API_BASE_URL`.

### API Endpoints Used

- `POST /api/auth/google` - Google OAuth authentication
- `POST /api/analyze` - Security analysis
- `GET /api/analyze/history` - Analysis history
- `GET /api/dashboard/metrics` - Dashboard metrics
- `GET /api/ethical-notice` - Ethical notice content

## Important Notes

- This is a **READ-ONLY, ETHICAL** security analysis tool
- No code execution or exploit testing
- All payloads are simulated and non-executable
- For educational purposes only

## Build

```bash
npm run build
```

## Preview Production Build

```bash
npm run preview
```
