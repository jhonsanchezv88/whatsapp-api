"""
R2 Cleanup Runner — runs the cleanup every CLEANUP_INTERVAL minutes.
This is the entry point for the Railway cron service.

Environment variables:
    CLEANUP_INTERVAL - Interval in minutes between runs (default: 15)
    All variables required by r2-cleanup.py
"""

import os
import time
import importlib.util
from pathlib import Path

INTERVAL_MIN = int(os.getenv("CLEANUP_INTERVAL", "15"))
INTERVAL_SEC = INTERVAL_MIN * 60

# Load the cleanup module
spec   = importlib.util.spec_from_file_location("cleanup", Path(__file__).parent / "r2-cleanup.py")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

print(f"[Runner] R2 cleanup runner started. Interval: {INTERVAL_MIN} minutes.")

while True:
    try:
        module.cleanup()
    except Exception as e:
        print(f"[Runner] Cleanup failed: {e}")

    print(f"[Runner] Next run in {INTERVAL_MIN} minutes...")
    time.sleep(INTERVAL_SEC)
