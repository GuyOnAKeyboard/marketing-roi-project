"""
Run only the extract + transform steps from the ETL and save a snapshot CSV into ../snapshots/
Usage:
    python save_transform_snapshot.py
This script does not write to the database.
"""
from etl_pipeline import extract_data, transform_data
import os

SNAP_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'snapshots'))
os.makedirs(SNAP_DIR, exist_ok=True)

if __name__ == '__main__':
    fb_raw, google_raw = extract_data()
    clean_metrics = transform_data(fb_raw, google_raw)
    out_path = os.path.join(SNAP_DIR, 'etl_transformed.csv')
    clean_metrics.to_csv(out_path, index=False)
    print(f"Snapshot saved to: {out_path}")
