"""
R2 Cleanup Script — Cloudflare R2 media file cleanup
Deletes files older than 15 minutes from the R2 bucket.

Usage:
    python scripts/r2-cleanup.py

Environment variables required:
    S3_ACCESS_KEY   - Cloudflare R2 Access Key ID
    S3_SECRET_KEY   - Cloudflare R2 Secret Access Key
    S3_BUCKET       - Bucket name
    S3_ENDPOINT     - Account endpoint (without https://)
    CLEANUP_MAX_AGE - Max file age in minutes (default: 15)
"""

import os
import boto3
from datetime import datetime, timezone, timedelta
from botocore.client import Config

# ── Configuration ──────────────────────────────────────────────
ACCESS_KEY  = os.environ["S3_ACCESS_KEY"]
SECRET_KEY  = os.environ["S3_SECRET_KEY"]
BUCKET      = os.environ["S3_BUCKET"]
ENDPOINT    = os.environ["S3_ENDPOINT"]  # without https://
MAX_AGE_MIN = int(os.getenv("CLEANUP_MAX_AGE", "15"))
# ───────────────────────────────────────────────────────────────

def get_client():
    return boto3.client(
        "s3",
        endpoint_url=f"https://{ENDPOINT}",
        aws_access_key_id=ACCESS_KEY,
        aws_secret_access_key=SECRET_KEY,
        config=Config(signature_version="s3v4"),
        region_name="auto",
    )

def cleanup():
    client    = get_client()
    threshold = datetime.now(timezone.utc) - timedelta(minutes=MAX_AGE_MIN)
    deleted   = 0
    errors    = 0

    print(f"[R2 Cleanup] Bucket: {BUCKET}")
    print(f"[R2 Cleanup] Deleting files older than {MAX_AGE_MIN} minutes (before {threshold.isoformat()})")

    paginator = client.get_paginator("list_objects_v2")

    for page in paginator.paginate(Bucket=BUCKET):
        objects = page.get("Contents", [])

        if not objects:
            print("[R2 Cleanup] No files found.")
            continue

        to_delete = [
            obj for obj in objects
            if obj["LastModified"] < threshold
        ]

        if not to_delete:
            print(f"[R2 Cleanup] {len(objects)} file(s) found, none older than {MAX_AGE_MIN} min.")
            continue

        # Delete in batches of 1000 (S3 API limit)
        for i in range(0, len(to_delete), 1000):
            batch = to_delete[i:i + 1000]
            response = client.delete_objects(
                Bucket=BUCKET,
                Delete={
                    "Objects": [{"Key": obj["Key"]} for obj in batch],
                    "Quiet": False,
                },
            )

            deleted += len(response.get("Deleted", []))
            errors  += len(response.get("Errors",  []))

            for err in response.get("Errors", []):
                print(f"[R2 Cleanup] ERROR deleting {err['Key']}: {err['Message']}")

    print(f"[R2 Cleanup] Done. Deleted: {deleted} | Errors: {errors}")

if __name__ == "__main__":
    cleanup()
