import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# 1. Load Environment Variables (from backend/.env)
# This will find and load the DATABASE_URL from your backend/.env file
load_dotenv() 
DATABASE_URL = os.getenv("DATABASE_URL")

# --- Application Setup ---
app = FastAPI(
    title="Marketing Metrics API",
    version="1.0.0",
    description="API to serve aggregated daily marketing metrics."
)

# CORS configuration to allow the frontend to access the API later
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows all origins for easy development/Postman testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Database Connection ---
# Attempt to initialize the engine immediately upon app start
if DATABASE_URL:
    try:
        # Create the database connection engine
        engine = create_engine(DATABASE_URL)
        print("Database engine created successfully.")
    except Exception as e:
        print(f"Error creating database engine: {e}")
        # Set engine to None if connection fails
        engine = None
else:
    print("WARNING: DATABASE_URL not set. API will not connect to database.")
    engine = None

# --- API Endpoint for Testing ---
@app.get("/api/metrics")
def get_daily_metrics():
    """
    Retrieves aggregated daily marketing metrics grouped by date and platform.
    This is the data feed for your frontend dashboard.
    """
    if not engine:
        # If engine failed to initialize, return an error
        return {"error": "Database connection not initialized. Check server logs and .env file."}, 500

    # The SQL query performs the final aggregation needed for the dashboard charts
    sql_query = """
    SELECT
        date, 
        platform, 
        SUM(spend_usd) AS total_spend, 
        SUM(clicks) AS total_clicks
    FROM daily_marketing_metrics
    GROUP BY date, platform
    ORDER BY date;
    """
    
    try:
        # 1. Connect to the DB
        with engine.connect() as connection:
            # 2. Execute the query
            result = connection.execute(text(sql_query))
            
            # 3. Convert SQL rows to JSON-friendly format
            metrics = [dict(row._mapping) for row in result]
            
        return {"metrics": metrics}
    
    except Exception as e:
        # 4. Handle any query execution errors
        print(f"Database query failed: {e}")
        return {"error": f"Failed to retrieve metrics from DB: {e}"}, 500