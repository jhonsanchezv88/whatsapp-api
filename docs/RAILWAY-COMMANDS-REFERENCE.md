# Evolution API - Railway Commands Reference

## Railway CLI

### Installation

```bash
# Install Railway CLI globally
npm install -g @railway/cli

# Verify installation
railway --version
```

### Authentication

```bash
# Login to Railway
railway login

# Check authenticated user
railway whoami
```

### Linking to a Project

```bash
# List available projects
railway list

# Link to a project
railway link

# Link by specific project ID
railway link [project-id]
```

---

## Service Management

### List Services

```bash
# View all services in the project
railway status

# View detailed service information
railway service
```

### Real-Time Logs

```bash
# View Evolution API logs
railway logs

# Follow logs in real time
railway logs --follow

# Logs from a specific service
railway logs --service evolution-api
```

### Environment Variables

```bash
# List all variables
railway variables

# Set a variable
railway variables set KEY=value

# Delete a variable
railway variables delete KEY

# Load from a .env file
railway variables set --file .env
```

---

## Deploy & Build

### Manual Deploy

```bash
# Deploy current directory
railway up

# Force rebuild
railway up --force
```

### Rollback

```bash
# List deployments
railway deployments

# Rollback to a previous deployment
railway rollback [deployment-id]
```

### Restart Service

```bash
# Restart current service
railway restart

# Restart a specific service
railway restart --service evolution-api
```

---

## Database

### PostgreSQL

```bash
# Connect to PostgreSQL via CLI
railway run psql $DATABASE_URL

# Run a query directly
railway run psql $DATABASE_URL -c "SELECT * FROM instances LIMIT 10;"

# Backup the database
railway run pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore a backup
railway run psql $DATABASE_URL < backup_20260615.sql
```

### Run Migrations

```bash
# Run Prisma migrations
railway run npm run db:deploy

# Generate Prisma Client
railway run npm run db:generate

# Open Prisma Studio
railway run npm run db:studio
```

### Redis

```bash
# Connect to Redis
railway run redis-cli -u $REDIS_URL

# Test connection
railway run redis-cli -u $REDIS_URL ping

# List all keys
railway run redis-cli -u $REDIS_URL keys '*'

# Clear specific cache keys
railway run redis-cli -u $REDIS_URL del evolution_v2:*
```

---

## Running Commands Remotely

```bash
# Run a command in the Railway environment
railway run [command]

# Useful examples:
railway run node --version
railway run npm list
railway run ls -la
```

### Interactive Shell

```bash
# Open a shell inside the Railway container
railway shell

# You are now inside the container
pwd
ls
exit
```

---

## Debugging & Diagnostics

### System Information

```bash
# View project information
railway info

# View resource usage
railway metrics

# Check all service statuses
railway status
```

### Health Checks

```bash
# Test the health endpoint
curl $(railway variables get SERVER_URL)

# Test with authentication header
curl -H "apikey: $(railway variables get AUTHENTICATION_API_KEY)" \
     $(railway variables get SERVER_URL)/instance/fetchInstances
```

### Connectivity Check

```bash
# Test PostgreSQL connection
railway run node -e "const { PrismaClient } = require('@prisma/client'); \
                     const prisma = new PrismaClient(); \
                     prisma.\$connect().then(() => console.log('DB Connected'))"

# Test Redis connection
railway run node -e "const redis = require('redis'); \
                     const client = redis.createClient({ url: process.env.REDIS_URI }); \
                     client.connect().then(() => console.log('Redis Connected'))"
```

---

## Troubleshooting

### Build Failed

```bash
# View full build logs
railway logs --deployment [deployment-id]

# Force clean rebuild
railway up --force

# Clear cache and rebuild
railway service delete-cache
railway up
```

### Database Connection Error

```bash
# Check DATABASE_URL variable
railway variables get DATABASE_URL

# Test connection directly
railway run psql $DATABASE_URL -c "SELECT 1;"

# Regenerate credentials via Railway Dashboard:
# PostgreSQL Service → Settings → Regenerate Credentials
```

### Redis Connection Error

```bash
# Check REDIS_URI variable
railway variables get REDIS_URI

# Test connection
railway run redis-cli -u $REDIS_URI ping

# View Redis service logs
railway logs --service redis
```

### Application Won't Start

```bash
# View startup logs
railway logs --tail 100

# Check critical variables
railway variables | grep -E "(DATABASE_URL|REDIS_URI|AUTHENTICATION_API_KEY)"

# Restart service
railway restart
```

---

## npm Scripts via Railway

```bash
# Development
railway run npm run dev:server

# Build
railway run npm run build

# Production
railway run npm start

# Linting
railway run npm run lint

# Tests
railway run npm test
```

---

## Domains & Networking

```bash
# List domains
railway domains

# Add a custom domain
railway domain add example.com

# Remove a domain
railway domain delete example.com

# Get the public URL
railway variables get SERVER_URL
```

---

## Monitoring

```bash
# CPU and Memory metrics
railway metrics

# Filter HTTP requests from logs
railway logs --filter "GET\|POST\|PUT\|DELETE"

# Filter errors from logs
railway logs --filter "ERROR\|error"
```

Configure alerts in the Railway Dashboard:
- Settings → Notifications
- Resource usage alerts
- Deploy notifications
- Error alerts

---

## Security

### Rotate API Key

```bash
# Generate a new API key
NEW_KEY=$(openssl rand -base64 32)

# Update in Railway
railway variables set AUTHENTICATION_API_KEY=$NEW_KEY

# Confirm update
railway variables get AUTHENTICATION_API_KEY
```

### Regenerate Database Credentials

```bash
# Must be done via Dashboard:
# 1. Open Railway Dashboard
# 2. PostgreSQL Service → Settings
# 3. Regenerate Credentials
# 4. Restart Evolution API
railway restart --service evolution-api
```

---

## Emergency Commands

### Quick Rollback

```bash
# List last 5 deployments
railway deployments | head -5

# Rollback to previous version
railway rollback [deployment-id]
```

### Stop / Pause Application

```bash
# Pause service (data is preserved)
railway service pause evolution-api

# Resume service
railway service resume evolution-api
```

### Full Backup

```bash
# Database backup
railway run pg_dump $DATABASE_URL > backup_db.sql

# Variables backup
railway variables > backup_vars.txt

# Code backup (via git)
git archive --format=tar.gz -o backup_code.tar.gz HEAD
```

---

## Monthly Maintenance Checklist

```bash
# 1. Check error logs
railway logs --filter "ERROR" --tail 1000

# 2. Check resource usage
railway metrics

# 3. Database backup
railway run pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# 4. Check versions and outdated packages
railway run node --version
railway run npm outdated

# 5. Clear Redis cache if needed
railway run redis-cli -u $REDIS_URI FLUSHDB

# 6. Check all service statuses
railway status
```

---

## Useful Shell Aliases

Add these to your `.bashrc` or `.zshrc`:

```bash
alias rw='railway'
alias rwl='railway logs --follow'
alias rwr='railway restart'
alias rws='railway status'
alias rwv='railway variables'

function railway_backup() {
    railway run pg_dump $DATABASE_URL > "backup_$(date +%Y%m%d_%H%M%S).sql"
    echo "Backup created"
}

function railway_health() {
    curl -s $(railway variables get SERVER_URL) | jq .
}
```

---

## Useful Links

- **Railway CLI Docs**: https://docs.railway.app/develop/cli
- **Railway Dashboard**: https://railway.app/dashboard
- **Evolution API Docs**: https://doc.evolution-api.com/

---

**Last updated:** June 2026  
**Version:** 1.0
