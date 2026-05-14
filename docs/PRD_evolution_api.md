# PRD — Evolution API Implementation for WhatsApp Session Management

**Project:** logicfy-evolution (standalone repository)  
**Date:** May 14, 2026  
**Author:** Jhon Sanchez  
**Assigned Developer:** Santiago Arango (Systems Engineering, Universidad Javeriana — Cali)  
**Context:** This project replaces the paid Wasender API service with a self-hosted open source solution.

---

## 1. Executive Summary

logicfy currently uses **Wasender API** (paid third-party service) to manage WhatsApp sessions. The goal of this project is to implement **Evolution API** (open source) as a standalone self-hosted service on **Railway**, capable of handling **at least 1,000 active WhatsApp sessions** simultaneously.

This service will be consumed as an **external API** from logicfy. The migration from Wasender is **out of scope** for this project.

### Objectives

1. Deploy Evolution API on Railway with a scalable architecture
2. Ensure feature parity with Wasender (messaging, webhooks, sessions)
3. Support at least 1,000 concurrent active sessions
4. Document all endpoints and webhook events for logicfy integration

---

## 2. Technical Context

### 2.1 What is Evolution API?

Evolution API is a multi-tenant, open source WhatsApp API platform built with **Node.js + TypeScript + Express.js**. It uses the **Baileys** library to connect to WhatsApp Web (unofficial protocol).

| Aspect | Details |
|---|---|
| Repository | [github.com/EvolutionAPI/evolution-api](https://github.com/EvolutionAPI/evolution-api) |
| Language | Node.js + TypeScript |
| Database | PostgreSQL (recommended) or MySQL |
| Cache | Redis |
| Containerization | Docker |
| WhatsApp Protocol | Baileys (WhatsApp Web, unofficial) |
| License | Apache 2.0 |

### 2.2 What is Wasender API? (Current System)

Wasender is a paid service that logicfy currently uses for:

- Creating/managing WhatsApp sessions (QR code, connect, disconnect)
- Sending/receiving all message types (text, images, audio, video, documents, location, contacts, polls)
- Receiving webhook events (messages received, session status changes, message updates)
- Reading contact profile pictures
- Sending presence updates (typing, recording)

### 2.3 Why Migrate?

| Wasender (current) | Evolution API (target) |
|---|---|
| Cost per session/month | Fixed infrastructure cost |
| Third-party dependency | Full control over the service |
| Plan-imposed limits | No artificial limits |
| Not scalable on demand | Horizontally scalable |
| Closed source | Open source, auditable |

---

## 3. System Architecture

### 3.1 High-Level Overview

```
┌──────────────┐     HTTPS/REST     ┌──────────────────────────┐
│              │ ──────────────────► │   Evolution API          │
│   logicfy    │                    │   (Railway Service)      │
│   (Django)   │ ◄────────────────  │                          │
│              │     Webhooks       │   ┌─────────┐            │
└──────────────┘                    │   │ Baileys │ ← WhatsApp │
                                    │   └─────────┘            │
                                    └──────────┬───────────────┘
                                               │
                                    ┌──────────┴───────────────┐
                                    │                          │
                              ┌─────┴─────┐            ┌──────┴──────┐
                              │ PostgreSQL│            │    Redis    │
                              │ (Railway) │            │  (Railway)  │
                              └───────────┘            └─────────────┘
```

### 3.2 Railway Components

| Service | Railway Type | Purpose | Estimated Resources |
|---|---|---|---|
| **Evolution API** | Docker Service (multiple replicas) | Main API + WhatsApp connections | 2-4 GB RAM per replica |
| **PostgreSQL** | Railway Plugin or Service | Instance, message, and contact persistence | 2-4 GB RAM |
| **Redis** | Railway Plugin or Service | Cache, cross-replica coordination, pub/sub | 512 MB - 1 GB RAM |

### 3.3 Scaling Strategy for 1,000 Sessions

> **Senior Recommendation:** A single Evolution API instance can reliably handle between 50-100 sessions. For 1,000 sessions, horizontal scaling is required.

#### Phase 1 — MVP (up to 100 sessions)
- 1 Evolution API replica
- 1 PostgreSQL
- 1 Redis
- Ideal for development and initial testing

#### Phase 2 — Growth (100-500 sessions)
- 3-5 Evolution API replicas
- PostgreSQL with more resources
- Redis with more memory
- Active monitoring

#### Phase 3 — Full Scale (500-1,000+ sessions)
- 10-20 Evolution API replicas
- High-availability PostgreSQL
- Redis Cluster
- Message queue (RabbitMQ) for webhook buffering
- Monitoring with alerts

#### Session Distribution

```
┌─────────────────────────────────────────────────┐
│            Railway Internal Network              │
│                                                  │
│  ┌──────────┐ ┌──────────┐     ┌──────────┐    │
│  │ Evo API  │ │ Evo API  │ ... │ Evo API  │    │
│  │ Replica 1│ │ Replica 2│     │ Replica N│    │
│  │ ~100 ses.│ │ ~100 ses.│     │ ~100 ses.│    │
│  └────┬─────┘ └────┬─────┘     └────┬─────┘    │
│       │             │                │           │
│       └─────────────┼────────────────┘           │
│                     │                            │
│              ┌──────┴──────┐  ┌──────────┐      │
│              │  PostgreSQL │  │   Redis   │      │
│              └─────────────┘  └──────────┘      │
└─────────────────────────────────────────────────┘
```

> **⚠️ Important Railway Consideration:** Railway does not have native Kubernetes. For 1,000+ sessions, if Railway presents networking or resource limitations, consider migrating to a VPS with Docker Compose or to Kubernetes (DigitalOcean, Hetzner). The design must be portable — by using Docker, the hosting migration is trivial.

### 3.4 Recommended Database

**PostgreSQL** — for the following reasons:

1. logicfy already uses PostgreSQL, the team has experience
2. Evolution API recommends it as the first option
3. Native JSONB support (ideal for message payloads)
4. Better performance with complex queries and high volume
5. Railway has a native PostgreSQL plugin

---

## 4. Feature Parity with Wasender

### 4.1 Session Management

| Wasender Feature | Wasender Endpoint | Evolution API Equivalent | Status |
|---|---|---|---|
| Create session | `POST /api/whatsapp-sessions` | `POST /instance/create` | ✅ Native |
| Get all sessions | `GET /api/whatsapp-sessions` | `GET /instance/fetchInstances` | ✅ Native |
| Session details | `GET /api/whatsapp-sessions/{id}` | `GET /instance/connectionState/{instance}` | ✅ Native |
| Connect session (QR) | `POST /api/whatsapp-sessions/{id}/connect` | `GET /instance/connect/{instance}` | ✅ Native |
| Get QR code | `GET /api/whatsapp-sessions/{id}/qrcode` | `GET /instance/connect/{instance}` | ✅ Native |
| Phone pairing code | — | `GET /instance/connect/{instance}?number=XXX` | ✅ Native |
| Disconnect session | `POST /api/whatsapp-sessions/{id}/disconnect` | `DELETE /instance/logout/{instance}` | ✅ Native |
| Delete session | `DELETE /api/whatsapp-sessions/{id}` | `DELETE /instance/delete/{instance}` | ✅ Native |
| Restart session | `POST /api/whatsapp-sessions/{id}/restart` | `PUT /instance/restart/{instance}` | ✅ Native |
| Session status | `GET /api/status` | `GET /instance/connectionState/{instance}` | ✅ Native |
| User info | `GET /api/user` | `GET /instance/fetchInstances` | ✅ Native |
| Check if number exists | `GET /api/on-whatsapp/{phone}` | `POST /chat/whatsappNumbers/{instance}` | ✅ Native |

### 4.2 Messaging

| Wasender Feature | Wasender Endpoint | Evolution API Equivalent | Status |
|---|---|---|---|
| Text | `POST /api/send-message` | `POST /message/sendText/{instance}` | ✅ |
| Image | `POST /api/send-message` (with mediaUrl) | `POST /message/sendMedia/{instance}` | ✅ |
| Video | `POST /api/send-message` (with mediaUrl) | `POST /message/sendMedia/{instance}` | ✅ |
| Audio/Voice | `POST /api/send-message` (with mediaUrl) | `POST /message/sendWhatsAppAudio/{instance}` | ✅ |
| Document | `POST /api/send-message` (with mediaUrl) | `POST /message/sendMedia/{instance}` | ✅ |
| Location | `POST /api/send-message` (location) | `POST /message/sendLocation/{instance}` | ✅ |
| Contact | `POST /api/send-message` (vcard) | `POST /message/sendContact/{instance}` | ✅ |
| Poll | `POST /api/send-message` (poll) | `POST /message/sendPoll/{instance}` | ✅ |
| Presence (typing) | `POST /api/send-presence-update` | `POST /chat/updatePresence/{instance}` | ✅ |
| Edit message | `POST /api/edit-message` | `PUT /chat/updateMessage/{instance}` | ✅ |
| Delete message | `POST /api/delete-message` | `DELETE /chat/deleteMessageForEveryone/{instance}` | ✅ |
| Mark as read | `POST /api/mark-as-read` | `PUT /chat/markMessageAsRead/{instance}` | ✅ |
| React to message | `POST /api/send-reaction` | `POST /message/sendReaction/{instance}` | ✅ |
| Sticker | — | `POST /message/sendSticker/{instance}` | ✅ Extra |
| List/Buttons | — | `POST /message/sendList/{instance}` | ✅ Extra |

### 4.3 Contacts

| Feature | Wasender | Evolution API | Status |
|---|---|---|---|
| Profile picture | `GET /api/contacts/{id}/picture` | `POST /chat/fetchProfilePictureUrl/{instance}` | ✅ |
| Contact info | `GET /api/contacts/{id}` | `POST /chat/findContacts/{instance}` | ✅ |
| Block contact | `POST /api/contacts/{id}/block` | `PUT /chat/updateBlockStatus/{instance}` | ✅ |

### 4.4 Webhook Events

| Wasender Event | Evolution API Event | Description | Critical for logicfy |
|---|---|---|---|
| `messages.received` | `MESSAGES_UPSERT` | Message received | ✅ Yes |
| `messages.upsert` | `MESSAGES_UPSERT` | Incoming/outgoing message | ✅ Yes |
| `messages.update` | `MESSAGES_UPDATE` | Message status (sent/delivered/read) | ✅ Yes |
| `messages.delete` | `MESSAGES_DELETE` | Message deleted | ⚠️ Useful |
| `session.status` | `CONNECTION_UPDATE` | Session connected/disconnected | ✅ Yes |
| `qrcode.updated` | `QRCODE_UPDATED` | New QR code generated | ✅ Yes |
| `contacts.update` | `CONTACTS_UPDATE` | Contact photo/status change | ⚠️ Useful |
| `contacts.upsert` | `CONTACTS_UPSERT` | New contact or update | ⚠️ Useful |
| `message.sent` | `SEND_MESSAGE` | Send confirmation | ✅ Yes |
| `chats.update` | `CHATS_UPDATE` | Chat update | ❌ Not used |
| `groups.*` | `GROUPS_UPSERT` / `GROUP_UPDATE` | Group events | ❌ Not used |
| — | `CALL` | Incoming call | ⚠️ New & useful |
| — | `PRESENCE_UPDATE` | Contact typing/online | ⚠️ New |

### 4.5 Key Payload Differences

#### Message Received Webhook

**Wasender:**
```json
{
  "event": "messages.received",
  "data": {
    "messages": {
      "key": {
        "id": "3EB0X123456789",
        "fromMe": false,
        "remoteJid": "123456789@lid",
        "cleanedSenderPn": "5551234567"
      },
      "messageBody": "Hello!",
      "message": { "conversation": "Hello!" }
    }
  }
}
```

**Evolution API:**
```json
{
  "event": "messages.upsert",
  "instance": "instance-name",
  "data": {
    "key": {
      "remoteJid": "5551234567@s.whatsapp.net",
      "fromMe": false,
      "id": "3EB0X123456789"
    },
    "message": { "conversation": "Hello!" },
    "messageType": "conversation",
    "pushName": "Contact Name"
  }
}
```

> **Important difference:** Wasender provides a `cleanedSenderPn` field and a unified `messageBody`. In Evolution API, you must extract the phone number from `remoteJid` (strip `@s.whatsapp.net`) and the text from the `message` field based on the `messageType`.

#### Disconnection Webhook

**Wasender:**
```json
{
  "event": "session.status",
  "data": { "status": "disconnected" }
}
```

**Evolution API:**
```json
{
  "event": "connection.update",
  "instance": "instance-name",
  "data": {
    "instance": "instance-name",
    "state": "close",
    "statusReason": 428
  }
}
```

---

## 5. Evolution API Configuration

### 5.1 Main Environment Variables

```env
# ─── Server ───
SERVER_URL=https://evolution-api.logicfy.com
SERVER_PORT=8080
AUTHENTICATION_API_KEY=your-secure-global-api-key

# ─── Database ───
DATABASE_PROVIDER=postgresql
DATABASE_CONNECTION_URI=postgresql://user:password@host:5432/evolution

# ─── Redis ───
CACHE_REDIS_ENABLED=true
CACHE_REDIS_URI=redis://host:6379

# ─── WhatsApp ───
WA_BUSINESS_TOKEN_WEBHOOK=evolution
CONFIG_SESSION_PHONE_CLIENT=logicfy
CONFIG_SESSION_PHONE_NAME=Chrome

# ─── Webhooks ───
WEBHOOK_GLOBAL_ENABLED=false
WEBHOOK_GLOBAL_URL=
WEBHOOK_EVENTS_APPLICATION_STARTUP=false
WEBHOOK_EVENTS_QRCODE_UPDATED=true
WEBHOOK_EVENTS_MESSAGES_SET=false
WEBHOOK_EVENTS_MESSAGES_UPSERT=true
WEBHOOK_EVENTS_MESSAGES_UPDATE=true
WEBHOOK_EVENTS_MESSAGES_DELETE=true
WEBHOOK_EVENTS_SEND_MESSAGE=true
WEBHOOK_EVENTS_CONTACTS_SET=false
WEBHOOK_EVENTS_CONTACTS_UPSERT=true
WEBHOOK_EVENTS_CONTACTS_UPDATE=true
WEBHOOK_EVENTS_PRESENCE_UPDATE=false
WEBHOOK_EVENTS_CHATS_SET=false
WEBHOOK_EVENTS_CHATS_UPSERT=false
WEBHOOK_EVENTS_CHATS_UPDATE=false
WEBHOOK_EVENTS_CHATS_DELETE=false
WEBHOOK_EVENTS_GROUPS_UPSERT=false
WEBHOOK_EVENTS_GROUP_UPDATE=false
WEBHOOK_EVENTS_GROUP_PARTICIPANTS_UPDATE=false
WEBHOOK_EVENTS_CONNECTION_UPDATE=true
WEBHOOK_EVENTS_CALL=false

# ─── Storage (Cloudflare R2) ───
S3_ENABLED=true
S3_ACCESS_KEY=your-r2-access-key
S3_SECRET_KEY=your-r2-secret-key
S3_BUCKET=logicfy-whatsapp-media
S3_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
S3_REGION=auto
S3_USE_SSL=true

# ─── Rate Limiting ───
API_RATE_LIMIT_ENABLED=true
API_RATE_LIMIT_MAX=100
API_RATE_LIMIT_DURATION=60
```

### 5.2 Instance Creation (Equivalent to Creating a Session)

```bash
curl -X POST "https://evolution-api.logicfy.com/instance/create" \
  -H "apikey: your-global-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "instanceName": "store-abc",
    "integration": "WHATSAPP-BAILEYS",
    "token": "unique-token-per-instance",
    "qrcode": true,
    "webhook": {
      "url": "https://logicfy.com/api/webhooks/whatsapp/",
      "byEvents": false,
      "base64": false,
      "events": [
        "MESSAGES_UPSERT",
        "MESSAGES_UPDATE",
        "MESSAGES_DELETE",
        "CONNECTION_UPDATE",
        "QRCODE_UPDATED",
        "SEND_MESSAGE",
        "CONTACTS_UPDATE"
      ]
    }
  }'
```

---

## 6. Error Handling and Resilience

### 6.1 Automatic Reconnection

Evolution API with Baileys has built-in automatic reconnection. However, `CONNECTION_UPDATE` events must be monitored to detect prolonged disconnections.

| Connection State | `state` | `statusReason` | Action |
|---|---|---|---|
| Connected | `open` | 200 | None |
| QR needed | `close` | 428 | Generate new QR, notify user |
| Temporary disconnect | `close` | 408 | Automatic reconnection (Baileys) |
| Logout from phone | `close` | 401 | Requires QR re-scan, notify user |
| WhatsApp ban | `close` | 403 | Notify user, do not retry |

### 6.2 Rate Limiting

- Configure rate limiting in Evolution API: 100 requests/minute per instance
- WhatsApp has internal limits (~30-60 messages/minute per number)
- Implement message queue if bulk sending is needed

### 6.3 Session Persistence

Baileys sessions are persisted in PostgreSQL. When the container restarts, sessions reconnect automatically without requiring a QR re-scan.

> **Critical:** Session data volumes (`/evolution/instances/`) must have persistent storage on Railway to prevent losing authentication credentials during redeploys.

---

## 7. Security

| Aspect | Implementation |
|---|---|
| API Authentication | Global API Key in `apikey` header |
| Per-instance Authentication | Unique token per instance |
| Communication | HTTPS mandatory (Railway provides SSL) |
| Webhook Validation | Verify header with instance token |
| Internal Network | PostgreSQL and Redis only accessible internally (Railway private networking) |
| Secrets | Environment variables in Railway (never in code) |

---

## 8. Media File Handling

### 8.1 Storage Strategy

**Recommended service: Cloudflare R2** — S3-compatible storage with zero egress (download) costs.

| Service | Free Tier | Cost After | Egress | Recommendation |
|---|---|---|---|---|
| **Cloudflare R2** | 10 GB/month free | $0.015/GB | **Free** | ⭐ Recommended |
| AWS S3 | 5 GB (12 months) | $0.023/GB | $0.09/GB | Expensive egress |
| DigitalOcean Spaces | — | $5/month (250 GB) | $0.01/GB | Viable alternative |

### 8.2 Media Flow

```
Client sends image via WhatsApp
        ↓
Evolution API (Baileys) receives the file
        ↓
Evolution API automatically uploads to Cloudflare R2
        ↓
Webhook sent to logicfy with media URL:
  "mediaUrl": "https://r2.logicfy.com/media/abc123.jpg"
        ↓
logicfy downloads and processes the file (in real time)
        ↓
logicfy sends DELETE to R2 to remove the file  ← Immediate cleanup
```

### 8.3 File Cleanup Policy (TTL)

Since logicfy processes media files **in real time** (at the moment the webhook arrives), files do not need to remain stored for long.

#### 2-Layer Cleanup Strategy:

| Layer | Mechanism | TTL | Purpose |
|---|---|---|---|
| **Layer 1 — Immediate deletion** | logicfy sends `DELETE` to R2 after processing | ~5-30 seconds | Primary cleanup — removes 99% of files |
| **Layer 2 — Lifecycle rule (backup)** | Cron job on logicfy | **15 minutes** | Safety net — removes orphaned files that Layer 1 missed (e.g., failed webhook, network error) |

> **Why 15 minutes and not 5?** If a webhook fails and logicfy needs to retry processing, 5 minutes may be too short. 15 minutes provides margin for 3 retries with exponential backoff without losing the file. The cost of storing files for an extra 15 min is negligible.

> **Why not 1 hour?** There is no technical reason to keep files for 1 hour. At the scale of 1,000 sessions receiving images, 1 hour would accumulate unnecessary GBs.

#### Lifecycle Configuration

Cloudflare R2 supports lifecycle rules from the dashboard, but the minimum granularity is **1 day**. For sub-hour cleanup, a **cron job** is needed as a backup:

```python
# Cron job on logicfy (every 15 minutes)
# Deletes R2 files older than 15 minutes
import boto3
from datetime import datetime, timedelta

s3 = boto3.client('s3', endpoint_url='https://account.r2.cloudflarestorage.com')
threshold = datetime.utcnow() - timedelta(minutes=15)

objects = s3.list_objects_v2(Bucket='logicfy-whatsapp-media')
for obj in objects.get('Contents', []):
    if obj['LastModified'].replace(tzinfo=None) < threshold:
        s3.delete_object(Bucket='logicfy-whatsapp-media', Key=obj['Key'])
```

### 8.4 Outbound Media (Sending)

To send media from logicfy to a client via WhatsApp, Evolution API accepts 3 formats:

| Method | Example | Recommendation |
|---|---|---|
| **Public URL** | `"media": "https://logicfy.com/media/product.jpg"` | ⭐ Simplest and most efficient |
| **Base64** | `"media": "data:image/jpeg;base64,..."` | Works but heavy |
| **Local path** | `"media": "/path/to/file.jpg"` | Not viable on Railway |

logicfy already has its own product images on its server, so for sending media it's enough to pass the public URL of the image.

### 8.5 Media Types and Limits

| Type | WhatsApp Max Size | `mediatype` in Evolution API |
|---|---|---|
| Image | 16 MB | `image` |
| Video | 16 MB | `video` |
| Audio/Voice | 16 MB | `audio` |
| Document | 100 MB | `document` |
| Sticker | 500 KB | `sticker` |

---

## 9. Project Deliverables

### Phase 1 — Base Infrastructure (High Priority)

| # | Deliverable | Description |
|---|---|---|
| 1 | Railway Deployment | Evolution API + PostgreSQL + Redis running |
| 2 | Network Configuration | HTTPS, custom domain, private internal network |
| 3 | Cloudflare R2 Setup | Media bucket with credentials + 15-minute cleanup cron |
| 4 | Test Script | Script that validates: create instance, connect QR, send message, receive webhook |
| 5 | Deployment Documentation | Steps to replicate the deployment from scratch |

### Phase 2 — Parity Validation (High Priority)

| # | Deliverable | Description |
|---|---|---|
| 6 | Complete Endpoint Mapping | Table with each Wasender endpoint → Evolution API equivalent + request/response example |
| 7 | Complete Webhook Mapping | Table with each webhook event and payload transformation |
| 8 | All Message Type Tests | Send and receive: text, image, audio, video, document, location, contact, poll, sticker |
| 9 | Session Management Tests | Create, connect, disconnect, reconnect, delete sessions |
| 10 | Profile Picture Test | Verify that contact profile pictures can be retrieved |
| 11 | Message Edit Test | Verify that a webhook is received when a user edits a message |

### Phase 3 — Scalability and Robustness (Medium Priority)

| # | Deliverable | Description |
|---|---|---|
| 12 | Load Test | Create 10+ simultaneous sessions and validate stability |
| 13 | Scaling Plan | Document with configuration for scaling from 100 to 500 to 1000 sessions |
| 14 | Monitoring | Dashboard or script to view the status of all active sessions |
| 15 | Recovery Procedure | What to do if a node goes down, how to redistribute sessions |

---

## 10. Dependencies and Requirements

### For Railway

| Service | Minimum Plan | Notes |
|---|---|---|
| Evolution API | Pro ($20/month per service) | Needs sufficient RAM for Baileys sessions |
| PostgreSQL | Railway Plugin or external service | Minimum 1 GB RAM |
| Redis | Railway Plugin or external service | Minimum 512 MB RAM |
| Domain | Custom domain on Railway | For fixed webhook URLs |

### Development Tools

- Docker Desktop (for local testing)
- Node.js 20+ (if local debugging is needed)
- Postman or Insomnia (for endpoint testing)
- A phone with WhatsApp (for scanning the test QR code)

---

## 11. Risks and Mitigations

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| WhatsApp number bans due to unofficial API usage | Medium | High | Use dedicated numbers, don't spam, respect rate limits |
| WhatsApp protocol changes that break Baileys | Medium | High | Keep Evolution API updated, monitor releases |
| Railway doesn't support the scale of 1000 sessions | Low | High | Portable Docker design — can migrate to VPS/K8s |
| Session loss on redeploy | Medium | High | Persistent storage + automatic reconnection |
| High webhook latency with many sessions | Medium | Medium | Implement queue (RabbitMQ) for buffering |
| Railway costs higher than Wasender | Low | Medium | Evaluate cost/benefit with actual usage metrics |

---

## 12. Acceptance Criteria

The project is considered successful when:

1. ✅ Evolution API is deployed on Railway and accessible via HTTPS
2. ✅ A session can be created, connected via QR, and text messages can be sent/received
3. ✅ All message types can be sent (image, audio, video, document, location, contact, poll)
4. ✅ Webhooks are correctly received for: messages received, session status, message updates, message edits
5. ✅ Contact profile pictures can be retrieved
6. ✅ Sessions persist after a service redeploy
7. ✅ At least 10 simultaneous sessions can be handled without degradation (scalability proof of concept)
8. ✅ Complete Wasender → Evolution API mapping documentation exists

---

## 13. Future Scope (Not Included)

| Item | Notes |
|---|---|
| logicfy migration from Wasender | Another developer will replace Wasender calls with Evolution API |
| WhatsApp Cloud API (official Meta) | Evaluate in the future for better stability and compliance |
| Admin Panel (Evolution Manager) | Web UI for managing instances visually |
| RabbitMQ for webhook queues | Implement when surpassing 500 sessions |
| Kubernetes | Consider if Railway doesn't support the required scale |
| Chatwoot Integration | Evolution API supports it natively, evaluate if logicfy needs it |

---

## 14. Open Questions / Research Tasks

| # | Question | Assigned to | Status |
|---|---|---|---|
| 1 | Does Railway support persistent volumes for `/evolution/instances/`? | Santiago | Pending |
| 2 | How many sessions can one Evolution API replica handle with 2 GB RAM on Railway? | Santiago | Pending |
| 3 | Does Evolution API support a `cleanedSenderPn` field or does the JID need to be parsed manually? | Santiago | Pending |
| 4 | Can a different webhook URL be configured per instance? (Needed if logicfy wants different routes per session) | Santiago | Pending |
| 5 | How does Evolution API handle WhatsApp LIDs (Linked IDs) vs. traditional phone numbers? | Santiago | Pending |
| 6 | Is it possible to get media (image/audio) directly as a public URL from Evolution API without decryption? | Santiago | Pending |
| 7 | Is the monthly cost on Railway for 1000 sessions competitive vs. Wasender? | Santiago + Jhon | Pending |

---

## 15. Documentation Resources

| Resource | URL |
|---|---|
| Evolution API GitHub | [github.com/EvolutionAPI/evolution-api](https://github.com/EvolutionAPI/evolution-api) |
| Evolution API Docs | [doc.evolution-api.com](https://doc.evolution-api.com) |
| Postman Collection | Search "Evolution API v2" on Postman |
| Railway Docs | [docs.railway.com](https://docs.railway.com) |
| Baileys (WhatsApp library) | [github.com/WhiskeySockets/Baileys](https://github.com/WhiskeySockets/Baileys) |
| Wasender API Docs (reference) | `docs/wasender_api.md` in this repo |
| Evolution API Agent Guidelines | `docs/evolution_agents_md_file.md` in this repo |
