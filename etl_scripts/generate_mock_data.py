import pandas as pd
from faker import Faker
import random
import json

fake = Faker()
NUM_RECORDS = 500  # Generate 500 days of data

# --- 1. Generate Facebook Ads Data (Clean CSV Format) ---
def generate_facebook_data():
    data = []
    # Use a clean date format for the CSV
    dates = pd.date_range(start='2024-06-01', periods=NUM_RECORDS, freq='D')
    
    for date in dates:
        spend = round(random.uniform(500, 2000), 2)
        clicks = random.randint(150, 800)
        impressions = clicks * random.randint(10, 25)
        
        data.append({
            'ad_id': random.randint(1000, 9999),
            'date': date.strftime('%Y-%m-%d'), # Clean Format: 2024-06-01
            'platform': 'Facebook',
            'clicks': clicks,
            'spend_usd': spend,
            'impressions': impressions,
        })
    df = pd.DataFrame(data)
    df.to_csv('facebook_ads.csv', index=False)
    print("-> Generated facebook_ads.csv")
    
# --- 2. Generate Google Ads Data (Messy JSON Format) ---
def generate_google_data():
    data = []
    # Use a different, messy date format (ISO string) for the JSON
    dates = pd.date_range(start='2024-06-01', periods=NUM_RECORDS, freq='D')
    
    for date in dates:
        # NOTE: Google reports cost in cents, not dollars!
        cost_in_cents = random.randint(30000, 150000) 
        click_count = random.randint(100, 700)
        
        data.append({
            'campaignId': fake.uuid4(),
            'timestamp': date.isoformat(), # Messy Format: 2024-06-01T00:00:00
            'source_platform': 'Google',
            'clickCount': click_count,
            'costInCents': cost_in_cents, 
        })
    
    with open('google_ads.json', 'w') as f:
        json.dump(data, f)
    print("-> Generated google_ads.json")

if __name__ == '__main__':
    generate_facebook_data()
    generate_google_data()