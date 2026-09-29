# IncidentMind — Intelligent Incident Response System

IncidentMind is an AI-powered incident management and response platform designed to streamline incident investigation, root cause analysis, resolution playbooks, and organizational memory retrieval.

---

## 🚀 Features

- **Automated Incident Triage & Severity Assessment**: Rapidly analyze and categorize production incidents.
- **AI-Powered Root Cause Analysis (RCA)**: Integrated with Google Gemini for intelligent root cause identification and step-by-step mitigation plans.
- **Hindsight by Vectorize**: Memory and semantic search over historical incidents, failed approaches, and proven resolutions.
- **Interactive SRE Dashboard**: High-level telemetry, MTTR analytics, service health metrics, and incident resolution tracking.
- **Simulations & Demo Mode**: Full demo dataset ready out of the box for testing without third-party API dependencies.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, React 18, TypeScript)
- **Styling**: Tailwind CSS
- **Charts & Visuals**: Recharts, Lucide React
- **Notifications**: React Hot Toast

### Backend
- **Runtime**: Node.js & TypeScript
- **Server Framework**: Express.js
- **Database**: SQLite (`better-sqlite3`) with WAL mode
- **AI Engine**: `@google/generative-ai` (Google Gemini)
- **Vector Search**: Hindsight by Vectorize API client
- **Security**: Helmet, CORS, Express Rate Limit, JWT authentication

---

## 📂 Project Structure

```
Incident Response/
├── backend/
│   ├── data/                 # SQLite database & data persistence
│   ├── src/
│   │   ├── ai/               # Gemini AI prompt orchestration & analysis
│   │   ├── auth/             # Authentication & token verification
│   │   ├── db/               # SQLite schema definition and initial demo seed
│   │   ├── demo/             # Mock datasets and simulation runners
│   │   ├── hindsight/        # Vectorize API integration
│   │   ├── routes/           # Express API endpoints
│   │   └── utils/            # Shared utilities and helpers
│   ├── .env.example          # Backend environment variables template
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── app/                  # Next.js App Router pages and layout
│   ├── components/           # Reusable UI widgets and incident panels
│   ├── lib/                  # Frontend API client and type definitions
│   ├── .env.example          # Frontend environment variables template
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── .gitignore                # Comprehensive Git ignore rules
└── README.md                 # Project documentation
```

---

## 🏁 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or v20.x recommended)
- `npm` or `yarn`

---

### 1. Backend Setup

1. Open a terminal and navigate to `backend/`:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   *(Optional)* Add your `GEMINI_API_KEY` and `VECTORIZE_*` credentials. By default, `DEMO_MODE=true` runs the system with full offline mock data.

4. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend API runs at `http://localhost:3001`.

---

### 2. Frontend Setup

1. In a separate terminal, navigate to `frontend/`:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Start the Next.js frontend:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:3000`.

---

## 🔒 Environment Variables

### Backend (`backend/.env`)
| Variable | Description | Default |
|---|---|---|
| `PORT` | Backend server port | `3001` |
| `NODE_ENV` | Environment mode | `development` |
| `JWT_SECRET` | Secret key for JWT token signing | *(Set a secure string in prod)* |
| `GEMINI_API_KEY` | Google Gemini API key | *(Optional in demo mode)* |
| `VECTORIZE_API_KEY` | Vectorize API key | *(Optional in demo mode)* |
| `VECTORIZE_PROJECT_ID` | Vectorize Project ID | *(Optional in demo mode)* |
| `VECTORIZE_PIPELINE_ID`| Vectorize Pipeline ID | *(Optional in demo mode)* |
| `FRONTEND_URL` | Frontend client origin | `http://localhost:3000` |
| `DEMO_MODE` | Toggle demo fallback mode | `true` |

### Frontend (`frontend/.env.local`)
| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL for backend API | `http://localhost:3001/api` |

---

## 📄 License
ISC
