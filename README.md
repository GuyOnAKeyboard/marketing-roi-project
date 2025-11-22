# Marketing ROI Project

A small full-stack project that demonstrates an ETL pipeline, a backend API serving aggregated marketing metrics, and a React + Vite frontend dashboard that visualizes those metrics.

## Contents
- `backend/` - FastAPI application that exposes an endpoint to retrieve aggregated daily marketing metrics.
- `etl_scripts/` - Small ETL pipeline that extracts mock ad data (Facebook CSV + Google JSON), transforms and loads into a database table `daily_marketing_metrics`.
- `frontend/marketing-roi-Fo/` - React + Vite frontend that consumes the backend API and renders charts (uses Recharts).

## Quickstart

Prerequisites:
- Python 3.10+ (or 3.11/3.13 as in your venvs)
- Node.js 18+
- A PostgreSQL-compatible database (the code expects `DATABASE_URL` environment variable; a cloud Neon or local Postgres works)

1) Clone the repo (if not already cloned):

```powershell
git clone <your-repo-url>
cd marketing-roi-project
```

2) Backend (FastAPI)

```powershell
cd backend
# create and activate a venv (PowerShell)
python -m venv backend-venv; .\backend-venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Create a backend/.env file with DATABASE_URL set, for example:
# DATABASE_URL=postgresql+psycopg2://user:password@host:port/dbname

# Run the API server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API endpoints:
- GET /api/metrics — returns aggregated daily metrics grouped by date and platform (JSON).

3) ETL (load example data to DB)

```powershell
cd etl_scripts
python -m venv etl-venv; .\etl-venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Ensure backend/.env or .env contains DATABASE_URL
python etl_pipeline.py
```

This will read `facebook_ads.csv` and `google_ads.json`, transform and write to a `daily_marketing_metrics` table in the DB.

4) Frontend (React + Vite)

```powershell
cd frontend\marketing-roi-Fo
npm install
npm run dev
```

By default the frontend expects the backend API to be available at `http://localhost:8000/api/metrics` (CORS is permissive in `backend/app/main.py`). Adjust the API base URL in the frontend if needed.

## Environment & Secrets
- Do not commit `.env` files or virtual environments. A repository-level `.gitignore` is included to ignore common venv names like `backend-venv`, `etl-venv`, `venv`, `.venv`, and `.env` files.

If you accidentally committed secrets, I can help you remove them from git history (using `git filter-repo` or BFG) — tell me which files you need purged.

## Project Structure (short)

- backend/app/main.py — FastAPI app: loads `DATABASE_URL` via `python-dotenv`, creates SQLAlchemy engine, and defines `/api/metrics` to return aggregated metrics.
- etl_scripts/etl_pipeline.py — ETL: reads `facebook_ads.csv` and `google_ads.json`, transforms and writes to `daily_marketing_metrics` using SQLAlchemy.
- frontend/marketing-roi-Fo — React app scaffolded with Vite using `recharts` for charts.

## How this works (high level)

1. ETL reads raw ad data (CSV/JSON), cleans and standardizes fields, and writes to the DB table `daily_marketing_metrics`.
2. Backend connects to the DB and exposes `/api/metrics` which aggregates metrics by date and platform.
3. Frontend fetches the aggregated metrics and renders time series / comparison charts.

## Troubleshooting
- Database connection errors: ensure `DATABASE_URL` is correct and reachable.
- If running locally ensure the database accepts incoming connections and firewall rules / connection strings are correct.
- If frontend cannot reach backend, check CORS settings and the host/port used by `uvicorn`.

## Development notes
- The backend currently prints warnings when no `DATABASE_URL` is found — this is expected until the DB is configured.
- The ETL will `replace` the `daily_marketing_metrics` table each run (safe for development but adjust `if_exists` policy for production).

## 🌟 About Me

Hey there! I'm **Aniruddha Gangly**,also known as **GuyOnAKeyboard**

I currently work as a **Frontend Developer**, crafting clean, smooth, user-friendly interfaces.  
But I'm also leveling up my game and diving into the **data world** analytics, engineering, and all the behind-the-scenes logic that makes products *actually smart*.

In short:  
**Code, curiosity, and a keyboard. That’s the vibe.**

## 🌐 Connect With Me

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/guyonakeyboard/)
