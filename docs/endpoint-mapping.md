# Endpoint Mapping — Wasender API → Evolution API

**Project:** logicfy-evolution  
**Date:** June 2026  
**Status:** Validated via test script on Railway

---

## Session Management

| Wasender Endpoint | Method | Evolution API Endpoint | Method | Notes |
|---|---|---|---|---|
| `/api/whatsapp-sessions` | POST | `/instance/create` | POST | See request example below |
| `/api/whatsapp-sessions` | GET | `/instance/fetchInstances` | GET | Returns all instances |
| `/api/whatsapp-sessions/{id}` | GET | `/instance/connectionState/{instance}` | GET | |
| `/api/whatsapp-sessions/{id}/connect` | POST | `/instance/connect/{instance}` | GET | Returns QR base64 |
| `/api/whatsapp-sessions/{id}/qrcode` | GET | `/instance/connect/{instance}` | GET | Same endpoint as connect |
| `/api/whatsapp-sessions/{id}/disconnect` | POST | `/instance/logout/{instance}` | DELETE | |
| `/api/whatsapp-sessions/{id}/restart` | POST | `/instance/restart/{instance}` | PUT | |
| `/api/whatsapp-sessions/{id}` | DELETE | `/instance/delete/{instance}` | DELETE | Cascades all data |
| `/api/status` | GET | `/instance/connectionState/{instance}` | GET | Per-instance status |
| `/api/on-whatsapp/{phone}` | GET | `/chat/whatsappNumbers/{instance}` | POST | Body: `{"numbers":["573001234567"]}` |

### Create Instance — Request/Response

**Request:**
```json
POST /instance/create
Headers: { "apikey": "YOUR_API_KEY", "Content-Type": "application/json" }

{
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
}
```

**Response:**
```json
{
  "instance": {
    "instanceName": "store-abc",
    "status": "created"
  },
  "hash": {
    "apikey": "unique-token-per-instance"
  },
  "webhook": {
    "webhook": "https://logicfy.com/api/webhooks/whatsapp/"
  },
  "qrcode": {
    "code": "2@abc123...",
    "base64": "data:image/png;base64,..."
  }
}
```

### Connection State — Response

```json
GET /instance/connectionState/store-abc

{
  "instance": {
    "instanceName": "store-abc",
    "state": "open"
  }
}
```

States: `open` (connected), `close` (disconnected), `connecting`

---

## Messaging

| Message Type | Evolution API Endpoint | Method |
|---|---|---|
| Text | `/message/sendText/{instance}` | POST |
| Image | `/message/sendMedia/{instance}` | POST |
| Video | `/message/sendMedia/{instance}` | POST |
| Audio / Voice note | `/message/sendWhatsAppAudio/{instance}` | POST |
| Document | `/message/sendMedia/{instance}` | POST |
| Location | `/message/sendLocation/{instance}` | POST |
| Contact | `/message/sendContact/{instance}` | POST |
| Poll | `/message/sendPoll/{instance}` | POST |
| Sticker | `/message/sendSticker/{instance}` | POST |
| Reaction | `/message/sendReaction/{instance}` | POST |
| Edit message | `/chat/updateMessage/{instance}` | PUT |
| Delete message | `/chat/deleteMessageForEveryone/{instance}` | DELETE |
| Mark as read | `/chat/markMessageAsRead/{instance}` | PUT |

### Send Text — Request/Response

**Request:**
```json
POST /message/sendText/store-abc
{
  "number": "573186139890",
  "text": "Hello from Evolution API"
}
```

**Response:**
```json
{
  "key": {
    "remoteJid": "573186139890@s.whatsapp.net",
    "fromMe": true,
    "id": "3EB0XXXXXXXXX"
  },
  "message": {
    "extendedTextMessage": {
      "text": "Hello from Evolution API"
    }
  },
  "messageTimestamp": 1718000000,
  "status": "PENDING"
}
```

### Send Image — Request

```json
POST /message/sendMedia/store-abc
{
  "number": "573186139890",
  "mediatype": "image",
  "media": "https://picsum.photos/400",
  "caption": "Image caption"
}
```

### Send Audio (voice note) — Request

```json
POST /message/sendWhatsAppAudio/store-abc
{
  "number": "573186139890",
  "audio": "https://example.com/audio.mp3"
}
```

### Send Document — Request

```json
POST /message/sendMedia/store-abc
{
  "number": "573186139890",
  "mediatype": "document",
  "media": "data:application/pdf;base64,<BASE64>",
  "caption": "Document caption",
  "fileName": "file.pdf",
  "mimetype": "application/pdf"
}
```

> **Note:** For documents, sending as base64 is more reliable than external URLs. Railway may fail to fetch PDFs from external servers due to CORS or firewall restrictions.

### Send Location — Request

```json
POST /message/sendLocation/store-abc
{
  "number": "573186139890",
  "latitude": 3.4516,
  "longitude": -76.5320,
  "name": "Cali, Colombia",
  "address": "Universidad Javeriana Cali"
}
```

### Send Contact — Request

```json
POST /message/sendContact/store-abc
{
  "number": "573186139890",
  "contact": [
    {
      "fullName": "John Doe",
      "wuid": "573001234567",
      "phoneNumber": "+57 300 123 4567"
    }
  ]
}
```

### Send Poll — Request

```json
POST /message/sendPoll/store-abc
{
  "number": "573186139890",
  "name": "Favorite color?",
  "selectableCount": 1,
  "values": ["Red", "Blue", "Green", "Yellow"]
}
```

---

## Contacts

| Feature | Evolution API Endpoint | Method |
|---|---|---|
| Check number on WhatsApp | `/chat/whatsappNumbers/{instance}` | POST |
| Get profile picture | `/chat/fetchProfilePictureUrl/{instance}` | POST |
| Find contacts | `/chat/findContacts/{instance}` | POST |
| Block/unblock contact | `/chat/updateBlockStatus/{instance}` | PUT |

### Check Number — Request/Response

**Request:**
```json
POST /chat/whatsappNumbers/store-abc
{ "numbers": ["573186139890"] }
```

**Response:**
```json
[
  {
    "exists": true,
    "jid": "573186139890@s.whatsapp.net",
    "number": "573186139890"
  }
]
```

### Profile Picture — Request/Response

**Request:**
```json
POST /chat/fetchProfilePictureUrl/store-abc
{ "number": "573186139890" }
```

**Response:**
```json
{
  "wuid": "573186139890@s.whatsapp.net",
  "profilePictureUrl": "https://pps.whatsapp.net/v/..."
}
```

> **Important:** The `profilePictureUrl` is a signed WhatsApp URL that expires in ~5-10 seconds. logicfy must download the image immediately upon receiving it and store it in its own storage (Cloudflare R2 or similar). Do not store the WhatsApp URL directly.

---

## Webhook Configuration

| Action | Endpoint | Method |
|---|---|---|
| Set webhook for instance | `/webhook/set/{instance}` | POST |
| Get webhook config | `/webhook/find/{instance}` | GET |

### Set Webhook — Request

```json
POST /webhook/set/store-abc
{
  "webhook": {
    "url": "https://logicfy.com/api/webhooks/whatsapp/",
    "enabled": true,
    "byEvents": false,
    "base64": false,
    "events": [
      "MESSAGES_UPSERT",
      "MESSAGES_UPDATE",
      "MESSAGES_DELETE",
      "SEND_MESSAGE",
      "CONNECTION_UPDATE",
      "QRCODE_UPDATED",
      "CONTACTS_UPDATE"
    ]
  }
}
```

---

## Key Differences from Wasender

| Aspect | Wasender | Evolution API |
|---|---|---|
| Sender phone number | `cleanedSenderPn` (ready to use) | Must parse from `remoteJid` — strip `@s.whatsapp.net` |
| Message body | `messageBody` (unified field) | Depends on `messageType` — check `message.conversation`, `message.imageMessage`, etc. |
| Session ID | Numeric ID | String `instanceName` |
| Auth header | `Authorization: Bearer TOKEN` | `apikey: YOUR_KEY` |
| Webhook event names | `messages.received`, `session.status` | `MESSAGES_UPSERT`, `CONNECTION_UPDATE` (uppercase) |

### Parsing remoteJid in Python (for logicfy)

```python
def get_phone_number(remote_jid: str) -> str:
    """Extract phone number from Evolution API remoteJid."""
    # "573186139890@s.whatsapp.net" -> "573186139890"
    # "573186139890-1234567890@g.us" -> group, handle separately
    if "@s.whatsapp.net" in remote_jid:
        return remote_jid.replace("@s.whatsapp.net", "")
    elif "@g.us" in remote_jid:
        return None  # group message
    return remote_jid
```

### Extracting message body by type (for logicfy)

```python
def get_message_body(data: dict) -> str:
    """Extract text content from Evolution API message payload."""
    message = data.get("message", {})
    message_type = data.get("messageType", "")

    extractors = {
        "conversation":          lambda m: m.get("conversation", ""),
        "extendedTextMessage":   lambda m: m.get("extendedTextMessage", {}).get("text", ""),
        "imageMessage":          lambda m: m.get("imageMessage", {}).get("caption", ""),
        "videoMessage":          lambda m: m.get("videoMessage", {}).get("caption", ""),
        "documentMessage":       lambda m: m.get("documentMessage", {}).get("caption", ""),
        "audioMessage":          lambda m: "[audio]",
        "stickerMessage":        lambda m: "[sticker]",
        "locationMessage":       lambda m: "[location]",
        "contactMessage":        lambda m: "[contact]",
        "pollCreationMessage":   lambda m: m.get("pollCreationMessage", {}).get("name", "[poll]"),
    }

    extractor = extractors.get(message_type)
    return extractor(message) if extractor else ""
```

---

**Last updated:** June 2026  
**Validated on:** Railway (Evolution API v2)
