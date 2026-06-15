# Evolution API - Railway Quick Start

> Visual quick reference for the Railway deployment

---

## Current Status

```
┌─────────────────────────────────────────┐
│    DEPLOYMENT COMPLETE AND FUNCTIONAL   │
├─────────────────────────────────────────┤
│  ✅ PostgreSQL provisioned              │
│  ✅ Redis provisioned                   │
│  ✅ Evolution API deployed              │
│  ✅ GitHub CI/CD configured             │
│  ✅ WhatsApp connected                  │
│  ✅ Documentation complete              │
└─────────────────────────────────────────┘
```

---

## Available Documentation

```
docs/
├── railway-deployment-guide.md      (Full deployment guide)
├── RAILWAY-DEPLOYMENT-SUMMARY.md    (Executive summary)
├── RAILWAY-COMMANDS-REFERENCE.md    (Railway CLI commands)
├── README-RAILWAY.md                (Quick reference)
└── README.md                        (Documentation index)

Environment Variable Templates (repository root):
├── railway.evolution-api.env.template
├── railway.redis.env.template
└── railway.postgres.env.template
```

---

## Deployed Architecture

```
                    ┌─────────────────────────────┐
                    │        RAILWAY CLOUD         │
                    └─────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │     Railway Project      │
                    └─────────────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   PostgreSQL    │  │   Evolution API │  │     Redis       │
│   (Managed)     │◄─┤   (GitHub)      │─►│   (Managed)     │
│                 │  │                 │  │                 │
│ • Auto backups  │  │ • Auto deploy   │  │ • Cache/Session │
│ • 512MB-1GB     │  │ • Auto SSL/TLS  │  │ • 256MB         │
└─────────────────┘  └────────┬────────┘  └─────────────────┘
                              │
                              │ HTTPS
                              ▼
                    ┌─────────────────┐
                    │   PUBLIC URL    │
                    │  railway.app    │
                    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  WhatsApp Users │
                    └─────────────────┘
```

---

## What Was Done?

1. Created a Railway project with 3 integrated services
2. Configured managed PostgreSQL database
3. Configured Redis for caching
4. Deployed Evolution API connected to GitHub
5. Configured environment variables on each service
6. Tested WhatsApp — instance creation and connection working
7. Documented everything for ongoing maintenance

## How Does It Work?

```
You → git push → GitHub → Railway → Build → Deploy → Live!
                  (Automatic CI/CD)
```

---

## Key Metrics

| Metric | Value |
|--------|-------|
| Deploy time | ~5 minutes |
| Active services | 3 (PostgreSQL, Redis, API) |
| Monthly cost | $20-35 USD |
| Railway uptime SLA | 99.9% |
| Build time | 3-5 minutes |
| Variables configured | 150+ |

---

## How to Use the API

### 1. Health Check

```bash
curl https://[your-domain].railway.app
```

### 2. Create a WhatsApp Instance

```bash
curl -X POST https://[your-domain].railway.app/instance/create \
  -H "apikey: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "instanceName": "my-instance",
    "token": "secure-token",
    "qrcode": true
  }'
```

### 3. Scan QR Code

- Open the QR code URL returned by the API
- Scan with WhatsApp
- Wait for the connection to establish

### 4. Send a Message

```bash
curl -X POST https://[your-domain].railway.app/message/sendText/my-instance \
  -H "apikey: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5511999999999",
    "text": "Hello from Railway!"
  }'
```

---

## Basic Maintenance Commands

```bash
# View real-time logs
railway logs --follow

# Restart service
railway restart

# Database backup
railway run pg_dump $DATABASE_URL > backup.sql

# Update code (triggers auto deploy)
git push origin main
```

---

## Do's and Don'ts

**Do:**
- ✅ Use environment variables for secrets
- ✅ Monitor logs regularly
- ✅ Back up before major changes
- ✅ Test changes before pushing to production

**Don't:**
- ❌ Commit secrets to the codebase
- ❌ Deploy directly without testing
- ❌ Ignore resource usage alerts
- ❌ Delete services without a backup

---

## Need Help?

| Problem | Where to look |
|---------|--------------|
| API not responding | `docs/railway-deployment-guide.md` → Troubleshooting |
| Database connection error | `docs/RAILWAY-COMMANDS-REFERENCE.md` → Troubleshooting |
| WhatsApp won't connect | `railway logs --follow` |

- **Railway Docs**: https://docs.railway.app/
- **Evolution API Docs**: https://doc.evolution-api.com/
- **GitHub Issues**: https://github.com/EvolutionAPI/evolution-api/issues

---

## Documentation Index

| Document | Audience |
|----------|----------|
| [railway-deployment-guide.md](./docs/railway-deployment-guide.md) | Developers |
| [RAILWAY-DEPLOYMENT-SUMMARY.md](./docs/RAILWAY-DEPLOYMENT-SUMMARY.md) | Managers |
| [RAILWAY-COMMANDS-REFERENCE.md](./docs/RAILWAY-COMMANDS-REFERENCE.md) | DevOps |
| [README-RAILWAY.md](./docs/README-RAILWAY.md) | Everyone |

---

**Created:** June 2026  
**Version:** 1.0  
**Status:** ✅ Production Ready
