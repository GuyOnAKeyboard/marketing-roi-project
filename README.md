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

---

If you'd like, I can also:
- Add a small Docker Compose file to run a Postgres DB + backend + frontend for local development.
- Add a simple README inside the frontend folder with dev notes on environment variables for the API base URL.

Feel free to tell me which follow-up you'd like.

## Snapshots (generated)

I created some local snapshot artifacts to help demonstrate the ETL and API flow. You'll find them in the `snapshots/` folder at the repo root.

- `snapshots/etl_transformed.csv` — Output of the ETL transform step (concatenated Facebook + Google data). This was generated by running `etl_scripts/save_transform_snapshot.py` and contains cleaned rows for `date`, `platform`, `clicks`, and `spend_usd`.
- `snapshots/api_metrics_response.json` — Attempted API response saved by calling `GET /api/metrics` on `http://127.0.0.1:8000`. The file is empty because the backend was not reachable in this environment (uvicorn failed to start due to missing uvicorn in the active Python environment). When you run the backend locally and call the endpoint, this file will contain the JSON response.
- `snapshots/backend_stdout.log` and `snapshots/backend_stderr.log` — Captured stdout/stderr from an attempt to start the backend. The stderr contains `No module named uvicorn` from the virtual environment that was active in this session; ensure `uvicorn` is installed in the correct Python environment before starting the server.

How I generated them here:
1. Created `etl_scripts/save_transform_snapshot.py` which runs the ETL extract+transform and writes `snapshots/etl_transformed.csv`.
2. Attempted to start the backend (`uvicorn`) and captured logs to `snapshots/` (start failed due to environment mismatch in this session).
3. Attempted an API call to `/api/metrics` and saved the response to `snapshots/api_metrics_response.json` (empty because the server wasn't reachable).

If you want, I can:
- Re-run the backend + API call locally on your machine (I can provide the exact PowerShell commands). 
- Add a small `Makefile` or PowerShell script to automate: create venvs, install deps, run ETL snapshot, start backend, call API, and collect snapshots.
