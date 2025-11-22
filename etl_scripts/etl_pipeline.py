import pandas as pd
import json
from datetime import datetime
from sqlalchemy import create_engine
from dotenv import load_dotenv
import os

# 1. Load Environment Variables (for DB connection)
load_dotenv()

# --- E: Extract (Read the files) ---
def extract_data():
    print("E: Extracting data...")
    fb_df = pd.read_csv('facebook_ads.csv')
    
    with open('google_ads.json', 'r') as f:
        google_data = json.load(f)
    google_df = pd.DataFrame(google_data)
    
    return fb_df, google_df

# --- T: Transform (Clean and Merge) ---
def transform_data(fb_df, google_df):
    print("T: Transforming data...")
    
    # 1. Facebook: Already mostly clean, just rename columns if needed
    fb_df_cleaned = fb_df[['date', 'platform', 'clicks', 'spend_usd']]
    
    # 2. Google: Requires three cleaning steps!
    google_df['date'] = pd.to_datetime(google_df['timestamp']).dt.strftime('%Y-%m-%d')
    google_df['spend_usd'] = google_df['costInCents'] / 100
    google_df_cleaned = google_df.rename(columns={
        'clickCount': 'clicks',
        'source_platform': 'platform'
        })
    google_df_cleaned = google_df_cleaned[['date', 'platform', 'clicks', 'spend_usd']]
    
    # 3. Merge: Concatenate the two DataFrames
    final_df = pd.concat([fb_df_cleaned, google_df_cleaned], ignore_index=True)
    
    return final_df

# --- L: Load (Send to Neon DB) ---
def load_data(df):
    print("L: Loading data to Neon DB...")
    # NOTE: We need the DATABASE_URL from your .env file here!
    DATABASE_URL = os.getenv("DATABASE_URL")
    
    if not DATABASE_URL:
        raise ValueError("DATABASE_URL not found in .env file. Please check Phase 2 setup.")
        
    engine = create_engine(DATABASE_URL)
    
    # Send the clean DataFrame to a table named 'daily_marketing_metrics'
    df.to_sql('daily_marketing_metrics', engine, if_exists='replace', index=False)
    print("Successfully loaded to the 'daily_marketing_metrics' table.\n",df)

# --- Main Execution ---
if __name__ == '__main__':
    fb_raw, google_raw = extract_data()
    clean_metrics = transform_data(fb_raw, google_raw)
    load_data(clean_metrics)
    print("ETL Pipeline completed successfully!")