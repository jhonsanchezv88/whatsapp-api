# Evolution API - Documentation

Welcome to the complete Evolution API documentation. This directory contains all technical documentation, deployment guides, and project references.

## Documentation Index

### Product Documentation

**[PRD - Product Requirements Document](./PRD_evolution_api.md)**
- Product requirements
- Functional specifications
- Use cases and flows

**[WASender API Documentation](./wasender_api_docs.md)**
- Supplementary API documentation
- Endpoints and integrations

### Deployment Guides

**[Railway Deployment Guide](./railway-deployment-guide.md)** 
- Complete Railway deployment guide
- PostgreSQL, Redis, and Evolution API configuration
- Troubleshooting and monitoring
- Security and scalability best practices

**[Railway - Quick Reference](./README-RAILWAY.md)**
- Quick reference for Railway
- Links to environment variable templates
- Current deployment status

**[Railway - Commands Reference](./RAILWAY-COMMANDS-REFERENCE.md)** 🔧
- Full Railway CLI command reference
- Maintenance and debugging scripts
- CLI-based troubleshooting

**[Railway - Deployment Summary](./RAILWAY-DEPLOYMENT-SUMMARY.md)** 📊
- Executive deployment summary
- Metrics and achieved results
- Management presentation document

## Configuration Templates

Environment variable templates are located at the **repository root**:

| File | Description | Location |
|------|-------------|----------|
| `railway.evolution-api.env.template` | Evolution API variables | `../railway.evolution-api.env.template` |
| `railway.redis.env.template` | Redis variables | `../railway.redis.env.template` |
| `railway.postgres.env.template` | PostgreSQL variables | `../railway.postgres.env.template` |

## Quick Start

### Local Development
```bash
# 1. Clone the repository
git clone https://github.com/EvolutionAPI/evolution-api.git
cd evolution-api

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your settings

# 4. Start services (Docker)
docker-compose up -d

# 5. Run migrations
npm run db:migrate:dev

# 6. Start dev server
npm run dev:server
```

### Railway Deployment

1. **Read the full guide**: [Railway Deployment Guide](./railway-deployment-guide.md)
2. **Configure services**: PostgreSQL + Redis + Evolution API
3. **Set variables**: Use the templates as reference
4. **Auto deploy**: Connect to GitHub for CI/CD

## Additional Documentation

### In the Repository

- **[AGENTS.md](../AGENTS.md)** - Complete AI Agents guide
  - Code standards
  - Project architecture
  - Development conventions
  - Commands and scripts

- **[CONTRIBUTING.md](../CONTRIBUTING.md)** - Contribution guide
  - How to contribute
  - Commit standards
  - Pull Request process

- **[CHANGELOG.md](../CHANGELOG.md)** - Change history
  - Versions and releases
  - New features
  - Bug fixes

- **[CLAUDE.md](../CLAUDE.md)** - Claude AI context
  - Specific context for Claude assistant

### External

- **[Official Documentation](https://doc.evolution-api.com/)** - Official site
- **[GitHub Repository](https://github.com/EvolutionAPI/evolution-api)** - Main repository
- **[API Reference](https://doc.evolution-api.com/api-reference)** - Complete API reference

## Project Architecture

```
evolution-api/
├── src/                    # TypeScript source code
│   ├── api/
│   │   ├── controllers/   # HTTP controllers
│   │   ├── services/      # Business logic
│   │   ├── routes/        # Route definitions
│   │   └── integrations/  # External integrations
│   ├── dto/               # Data Transfer Objects
│   ├── guards/            # Auth middleware
│   ├── types/             # TypeScript definitions
│   └── repository/        # Data layer (Prisma)
├── prisma/                # DB schemas and migrations
├── Docker/                # Docker configurations
├── docs/                  # YOU ARE HERE
└── config/                # App configuration
```

## Tools & Technologies

- **Runtime**: Node.js 20+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL / MySQL
- **Cache**: Redis
- **ORM**: Prisma
- **WhatsApp**: Baileys / Business API
- **Containerization**: Docker
- **Cloud**: Railway (documented)

## Project Status

| Component | Status | Version |
|-----------|--------|---------|
| Evolution API | ✅ Stable | 2.x.x |
| PostgreSQL | ✅ Configured | Latest |
| Redis | ✅ Configured | Latest |
| Railway Deploy | ✅ Active | - |
| Documentation | ✅ Complete | v1.0 |

## Support

- **Issues**: [GitHub Issues](https://github.com/EvolutionAPI/evolution-api/issues)
- **Discussions**: [GitHub Discussions](https://github.com/EvolutionAPI/evolution-api/discussions)
- **Email**: contato@evolution-api.com

## License

This project is licensed under Apache 2.0. See the [LICENSE](../LICENSE) file for details.

---

**Last updated:** June 2026  
**Documentation version:** 1.0  
**Maintained by:** Evolution API Team
