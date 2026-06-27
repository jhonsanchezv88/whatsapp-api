# Webhook Event Mapping — Wasender → Evolution API

**Project:** logicfy-evolution  
**Date:** June 2026  
**Status:** Validated via webhook.site on Railway

---

## Overview

Evolution API sends webhook events as HTTP POST requests to the configured URL.  
All events share the same base structure:

```json
{
  "event": "EVENT_NAME",
  "instance": "store-abc",
  "data": { ... },
  "destination": "https://logicfy.com/api/webhooks/whatsapp/",
  "date_time": "2026-06-15T10:30:00.000Z",
  "sender": "573186139890@s.whatsapp.net",
  "server_url": "https://whatsapp-api-production-8261.up.railway.app",
  "apikey": "instance-token"
}
```

---

## Event Reference

### MESSAGES_UPSERT
**Wasender equivalent:** `messages.received` / `messages.upsert`  
**Trigger:** New incoming or outgoing message  
**Critical for logicfy:** ✅ Yes

```json
{
  "event": "messages.upsert",
  "instance": "store-abc",
  "data": {
    "key": {
      "remoteJid": "573186139890@s.whatsapp.net",
      "fromMe": false,
      "id": "3EB0XXXXXXXXXXXXXXXXX"
    },
    "pushName": "Contact Name",
    "message": {
      "conversation": "Hello, I want product info"
    },
    "messageType": "conversation",
    "messageTimestamp": 1718000000,
    "instanceId": "abc123",
    "source": "android"
  }
}
```

**For media messages, `messageType` changes and `mediaUrl` appears:**
```json
{
  "data": {
    "messageType": "imageMessage",
    "message": {
      "imageMessage": {
        "caption": "Check this out",
        "mimetype": "image/jpeg"
      }
    },
    "mediaUrl": "https://ACCOUNT.r2.cloudflarestorage.com/logicfy-whatsapp-media/abc123.jpg"
  }
}
```

> `mediaUrl` points to Cloudflare R2 when S3 is configured. Without S3, it is empty and logicfy must call `/chat/getBase64FromMediaMessage` to download the file.

**logicfy processing logic:**
```python
def handle_messages_upsert(payload):
    data = payload["data"]
    
    # Filter out historical messages from initial sync
    import time
    if time.time() - data["messageTimestamp"] > 30:
        return  # skip old messages
    
    # Skip outgoing messages if not needed
    if data["key"]["fromMe"]:
        return
    
    phone   = data["key"]["remoteJid"].replace("@s.whatsapp.net", "")
    name    = data.get("pushName", "")
    body    = get_message_body(data)   # see endpoint-mapping.md
    media   = data.get("mediaUrl", "")
```

---

### MESSAGES_UPDATE
**Wasender equivalent:** `messages.update`  
**Trigger:** Message delivery status changed (sent → delivered → read)  
**Critical for logicfy:** ✅ Yes

```json
{
  "event": "messages.update",
  "instance": "store-abc",
  "data": [
    {
      "key": {
        "remoteJid": "573186139890@s.whatsapp.net",
        "fromMe": true,
        "id": "3EB0XXXXXXXXXXXXXXXXX"
      },
      "update": {
        "status": 3
      }
    }
  ]
}
```

**Status values:**
| Value | Meaning |
|---|---|
| `1` | Pending (clock icon) |
| `2` | Sent (single check) |
| `3` | Delivered (double check) |
| `4` | Read (blue double check) |

> Note: Also fires when a user **edits** a message — in that case `update` contains `"message"` with the new content instead of `"status"`. This covers **Entregable #11**.

**Edit message example:**
```json
{
  "data": [
    {
      "key": { "id": "3EB0XXXXXXXXX", "fromMe": false },
      "update": {
        "message": {
          "protocolMessage": {
            "type": 14,
            "editedMessage": {
              "conversation": "Edited message text"
            }
          }
        }
      }
    }
  ]
}
```

---

### MESSAGES_DELETE
**Wasender equivalent:** `messages.delete`  
**Trigger:** A message was deleted for everyone  
**Critical for logicfy:** ⚠️ Useful

```json
{
  "event": "messages.delete",
  "instance": "store-abc",
  "data": {
    "id": ["3EB0XXXXXXXXXXXXXXXXX"],
    "remoteJid": "573186139890@s.whatsapp.net",
    "fromMe": false,
    "participant": null
  }
}
```

---

### CONNECTION_UPDATE
**Wasender equivalent:** `session.status`  
**Trigger:** Instance connection state changed  
**Critical for logicfy:** ✅ Yes

```json
{
  "event": "connection.update",
  "instance": "store-abc",
  "data": {
    "instance": "store-abc",
    "state": "open",
    "statusReason": 200
  }
}
```

**State/statusReason combinations:**

| `state` | `statusReason` | Meaning | Action |
|---|---|---|---|
| `open` | `200` | Connected ✅ | None |
| `close` | `428` | QR code needed | Show QR to user |
| `close` | `408` | Temporary disconnect | Baileys auto-reconnects |
| `close` | `401` | Logged out from phone | Ask user to re-scan QR |
| `close` | `403` | WhatsApp ban | Notify user, do NOT retry |
| `connecting` | — | Reconnecting | Wait |

---

### QRCODE_UPDATED
**Wasender equivalent:** *(no direct equivalent)*  
**Trigger:** A new QR code is available for scanning  
**Critical for logicfy:** ✅ Yes

```json
{
  "event": "qrcode.updated",
  "instance": "store-abc",
  "data": {
    "qrcode": {
      "code": "2@XXXXXXX,XXXXXXX,XXXXXXX,XXXXXXX",
      "base64": "data:image/png;base64,iVBORw0KGgoAAAA..."
    }
  }
}
```

> QR codes expire in ~20-60 seconds. When a new one is generated, this event fires. logicfy should update the QR display for the end user immediately.

---

### SEND_MESSAGE
**Wasender equivalent:** `message.sent`  
**Trigger:** Evolution API confirms a message was successfully sent  
**Critical for logicfy:** ✅ Yes

```json
{
  "event": "send.message",
  "instance": "store-abc",
  "data": {
    "key": {
      "remoteJid": "573186139890@s.whatsapp.net",
      "fromMe": true,
      "id": "3EB0XXXXXXXXXXXXXXXXX"
    },
    "message": {
      "extendedTextMessage": {
        "text": "Hello from logicfy"
      }
    },
    "messageTimestamp": 1718000000,
    "status": "PENDING"
  }
}
```

---

### CONTACTS_UPDATE
**Wasender equivalent:** `contacts.update`  
**Trigger:** A contact's profile photo or status changed  
**Critical for logicfy:** ⚠️ Useful

```json
{
  "event": "contacts.update",
  "instance": "store-abc",
  "data": [
    {
      "id": "573186139890@s.whatsapp.net",
      "profilePictureUrl": "https://pps.whatsapp.net/v/...",
      "pushName": "Updated Name"
    }
  ]
}
```

---

## Events NOT configured (and why)

| Event | Reason not used |
|---|---|
| `CHATS_UPDATE` | logicfy manages its own chat state |
| `CHATS_UPSERT` | Same as above |
| `GROUPS_UPSERT` | logicfy does not handle group chats |
| `GROUP_UPDATE` | Same as above |
| `PRESENCE_UPDATE` | Not required for current logicfy features |
| `CALL` | Not handled in current scope |

---

## Complete Webhook Handler — Python Template for logicfy

```python
import time
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json

@csrf_exempt
def whatsapp_webhook(request):
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    payload = json.loads(request.body)
    event   = payload.get("event", "")
    instance = payload.get("instance", "")

    handlers = {
        "messages.upsert":    handle_messages_upsert,
        "messages.update":    handle_messages_update,
        "messages.delete":    handle_messages_delete,
        "connection.update":  handle_connection_update,
        "qrcode.updated":     handle_qrcode_updated,
        "send.message":       handle_send_message,
        "contacts.update":    handle_contacts_update,
    }

    handler = handlers.get(event)
    if handler:
        handler(instance, payload["data"])

    return JsonResponse({"status": "ok"})


def handle_messages_upsert(instance, data):
    # Filter historical messages from initial sync
    if time.time() - data.get("messageTimestamp", 0) > 30:
        return

    if data["key"]["fromMe"]:
        return  # skip outgoing if not needed

    phone = data["key"]["remoteJid"].replace("@s.whatsapp.net", "")
    if not phone.replace("@g.us", ""):
        return  # skip group messages for now

    # Process message...


def handle_connection_update(instance, data):
    state         = data.get("state")
    status_reason = data.get("statusReason")

    if state == "open":
        # Mark session as connected in logicfy DB
        pass
    elif state == "close" and status_reason == 428:
        # QR needed — notify user
        pass
    elif state == "close" and status_reason == 401:
        # Logged out — ask user to re-scan
        pass
    elif state == "close" and status_reason == 403:
        # Banned — notify and stop
        pass


def handle_qrcode_updated(instance, data):
    qr_base64 = data["qrcode"]["base64"]
    # Push to frontend via WebSocket or store temporarily
    pass


def handle_messages_update(instance, data):
    for update in data:
        message_id = update["key"]["id"]
        if "status" in update.get("update", {}):
            status = update["update"]["status"]
            # Update message delivery status in DB
        elif "message" in update.get("update", {}):
            # Message was edited
            pass
```

---

**Last updated:** June 2026  
**Validated on:** Railway (Evolution API v2) + webhook.site
