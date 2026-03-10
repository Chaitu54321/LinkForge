# LinkForge - Scalable Smart Link Platform

LinkForge is a production-style link management and analytics platform (similar to Bitly). It is engineered specifically to demonstrate mastery over modern full-stack development, scalable backend architecture, asynchronous processing, and polished frontend UI design.

**Made by Sri Chaitanya**

---

## 🌟 Key Features

- **High-Performance Redirect Engine:** Short links point to a blazingly fast FastAPI endpoint that utilizes Redis write-through caching (`O(1)` access time) instead of querying a SQL database, minimizing latency.
- **Asynchronous Analytics Queue:** Instead of blocking redirect requests to write analytics (browser, device, country, time) to a database, the redirect engine publishes lightweight events to a **Redis Stream**. A background Python worker silently pulls these events and bulk-inserts them into PostgreSQL without affecting user experience.
- **Redis Rate Limiting:** The API protects against spam and exhaustion attacks by utilizing a Redis token-bucket rate limiter (capped at 10 requests per minute per user).
- **Glassmorphic UI Design:** A custom, premium React interface featuring dynamic CSS variables, deep slate backgrounds, custom gradients, and smooth micro-animations.
- **Data Visualization:** Integrated `Chart.js` for interactive graphs rendering device breakdowns, browser usage, and click trends.
- **Secure Authentication:** JSON Web Token (JWT) based authentication with Bcrypt password hashing.

---

## 🏗️ Architecture Stack

### Frontend

- **Framework:** React + Vite
- **Routing:** React Router v6
- **Styling:** Vanilla CSS (Glassmorphism design system)
- **Data Fetching:** Axios (with generic interceptors)
- **Charts:** Chart.js + react-chartjs-2
- **Icons:** Lucide React

### Backend

- **Framework:** FastAPI (Python)
- **Database ORM:** SQLAlchemy
- **Data Validation:** Pydantic
- **Short-Code Algorithm:** Base62 Encoding
- **Security:** passlib[bcrypt], python-jose

### Infrastructure Layer

- **Primary Database:** PostgreSQL (Neon / Supabase)
- **Cache & Message Queue:** Redis (Upstash)
- **DevOps:** Docker, GitHub Actions CI/CD workflows (Vercel / Render ready)

---

## 🚀 Getting Started Locally

### Prerequisites

You will need Node.js, Python 3.11+, and an instance of PostgreSQL and Redis running (or cloud URL equivalents from Neon/Upstash).

### 1. Backend Setup

1. Open a terminal and navigate to the `backend` directory.
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment (optional but recommended).
3. Install the dependencies.
   ```bash
   pip install -r requirements.txt
   ```
4. Configure your `.env` file. Rename `.env.example` to `.env` and fill in your credentials.
   ```env
   DATABASE_URL=postgresql://linkuser:linkpassword@localhost:5432/linkdb
   REDIS_URL=rediss://default:YOUR_PASSWORD_HERE@your-endpoint.upstash.io:6379
   SECRET_KEY=generate_a_secure_random_string_here
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=1440
   ```
5. Run the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```

_(Note: When deploying to platforms like Render, the Analytics Worker runs automatically in the background of the main Web Service via a daemon thread. There is no need to deploy a separate worker instance!)_

### 2. Frontend Setup

Open a terminal window:

```bash
cd frontend
npm install
npm run dev
```

Visit the frontend at `http://localhost:5173/` and enjoy!

---

## 📈 Platform Modules Overview

1. **Frontend Application:** Handles UI/UX, token storage, request interception, and real-time chart rendering.
2. **API Backend:** Services business logic (Users, Links generation, Dashboard Data gathering).
3. **Redirect Engine:** Highly optimized `GET /{short_code}` endpoint purely dedicated to returning 302 statuses via Redis verification.
4. **Analytics Processing System:** The decoupled `workers/analytics_worker.py` system.
5. **Infrastructure Layer:** Docker containers and CI/CD `.yaml` deployments.
