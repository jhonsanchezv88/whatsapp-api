FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY r2-cleanup.py .
COPY r2-cleanup-runner.py .

CMD ["python", "r2-cleanup-runner.py"]
