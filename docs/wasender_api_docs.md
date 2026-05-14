# Wasender API Documentation

*Comprehensive documentation scraped from official Wasender API.*

---

## Getting Started with WasenderAPI

**Source:** https://www.wasenderapi.com/api-docs/getting-started/getting-started-with-wasenderapi

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Getting Started with WasenderAPI

Getting Started

Learn how to quickly set up your WasenderAPI account and start sending WhatsApp messages in minutes. This guide covers account creation, token generation, sending your first message, and tracking delivery using our developer-friendly REST API.

# Getting Started with WasenderAPI – WhatsApp Messaging API

## Introduction

Welcome to **WasenderAPI** – your reliable WhatsApp API platform. This guide will walk you through the steps to set up and start sending messages using our powerful API. It's quick, secure, and developer-friendly.

## Step 1: Create an Account

* Go to the [registration page](https://wasenderapi.com/register).
* Fill in your details and verify your email address.
* Once verified, log in to access your dashboard.

## Step 2: Create Your First WhatsApp Session

1. **Log In to Your Dashboard**: Access your account at [wasenderapi.com/dashboard](https://wasenderapi.com/dashboard).
2. **Navigate to the Sessions Section**: In the dashboard, go to the **Sessions** tab.
3. **Create a New Session**: Click on **Create New Session**.
4. **Scan the QR Code**: A QR code will appear. Open WhatsApp on your phone, go to **Settings > Linked Devices**, and scan the QR code to link your WhatsApp account.
5. **Session Activation**: Once scanned, your session will connected, and you can copy your API key.

For a more advanced walkthrough, check out the detailed guide here:

[Creating Your First Session – WasenderAPI Help Center](https://wasenderapi.com/help/getting-started/creating-first-session)

## Step 3: Send Your First Message

### API Endpoint

```
POST https://www.wasenderapi.com/api/send-message
```

### Headers

```
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

### Request Body

```
{
  "to": "212612345678",
  "text": "Hello from WasenderAPI!"
}
```

**Note:** The number you're messaging must have agreed to receive WhatsApp messages.

## Step 4: Track Message Delivery

You can track the status of your messages through the session page or set up  [webhooks](https://wasenderapi.com/api-docs/webhooks/webhook-setup)  for real-time updates.

## Need Help?

Check out our [Help Center](https://wasenderapi.com/help) or reach out to our support team at [[email protected]](/cdn-cgi/l/email-protection#93f0fcfde7f2f0e7d3e4f2e0f6fdf7f6e1f2e3fabdf0fcfe).

[Go to Dashboard](https://wasenderapi.com/dashboard)

[Next

Using Our API with Postman](https://www.wasenderapi.com/api-docs/getting-started/using-our-api-with-postman)

---

## Using Our API with Postman

**Source:** https://www.wasenderapi.com/api-docs/getting-started/using-our-api-with-postman

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Using Our API with Postman

Getting Started

Learn how to interact with our API using the official Postman collection.

# Postman Collection for API Integration

To help you get started quickly, we've prepared a Postman collection that contains all our API endpoints. You can use it to test requests and understand how the API works.

## Option 1: Run in Postman

Click the button below to open the collection directly in Postman:

[Run in Postman](https://www.postman.com/wasenderapi/workspace/wasenderapi/collection/35370845-af49beab-1a02-4ae5-b01d-d9debfca0442)

## Option 2: Download Collection

If you'd rather import it manually, download the collection below:

[Download JSON File](https://raw.githubusercontent.com/wasenderapi/wasenderapi-postman/refs/heads/main/Wasender%20API.postman_collection.json)
> Tip: Make sure you're logged into your Postman account for the best experience.

---

### Need Help?

Visit our [Getting Started](/api-docs/getting-started) section for a walkthrough on authentication, headers, and example requests.

[Previous

Getting Started with WasenderAPI](https://www.wasenderapi.com/api-docs/getting-started/getting-started-with-wasenderapi)[Next

How To Receive Messages and Media From Wasenderapi](https://www.wasenderapi.com/api-docs/getting-started/how-to-receive-messages-and-media-from-wasenderapi)

---

## How To Receive Messages and Media From Wasenderapi

**Source:** https://www.wasenderapi.com/api-docs/getting-started/how-to-receive-messages-and-media-from-wasenderapi

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# How To Receive Messages and Media From Wasenderapi

Getting Started

A developer's guide to receiving and processing real-time message events. This documentation details the flattened JSON payload, unified messageBody field, and handling for both Private and Group chats.

# How to Handle Incoming WhatsApp Messages

When you get a new WhatsApp message, we send a `POST` request to your server (webhook). Inside is a JSON payload with all the message details.

## The Message Payload

The JSON structure has been updated. The `data.messages` field is now a single object (not an array) containing the normalized `key`, the unified `messageBody`, and the raw `message` content.

```
{
  "event": "messages.received",
  "timestamp": 1633456789,
  "data": {
    "messages": {
      "key": {
        "id": "3EB0X123456789",
        "fromMe": false,
        "remoteJid": "123456789@lid", 
        "cleanedSenderPn": "5551234567",
        "senderLid": "123456789@lid"
      },
      "messageBody": "Hello! This is a test.",
      "message": {
        "conversation": "Hello! This is a test."
      }
    }
  }
}
```

### Key Fields Explained:

* **`key.cleanedSenderPn`**: (Recommended) The sender's phone number in private chats. Use this for your database or logic.
* **`key.cleanedParticipantPn`**: (Recommended) The sender's phone number in group chats.
* **`key.remoteJid`**: The unique ID of the chat.   

  **⚠️ Important:** Do not rely on `remoteJid` to be a phone number. It can often be a **LID** (Linked ID, ending in `@lid`). Always use the "cleaned" fields if you need the specific phone number.
* **`messageBody`**: The unified text content of the message. Whether it's a text message, an image caption, or a reply, the text will always be here.

## Reading the Message Content

### 1. The Easy Way (Text)

You no longer need to check multiple fields (like `conversation` vs `extendedTextMessage`). Just use `data.messages.messageBody`.

### 2. Media Messages

For media, look inside the raw `data.messages.message` object for keys like `imageMessage`, `videoMessage`, or `audioMessage`.

## How to Decrypt Media Files

**Important Update:** You no longer have to decrypt the media yourself if you don’t want to. We now provide a secure API endpoint that does it for you automatically: [Decrypt Media File API](https://wasenderapi.com/api-docs/messages/decrypt-media-file).

If you choose to decrypt manually, use the code examples below.

#### Code Examples

phpjavascriptpythonn8n code - javascriptCsharp

```
<?php

declare(strict_types=1);

// The directory to save downloaded media files.
// Make sure this directory exists and your web server can write to it.
define('DOWNLOAD_DIR', __DIR__ . '/downloads');

/**
 * A simple logging function for demonstration.
 * In a real application, you would use a proper logger like Monolog.
 */
function logMessage(string $message): void
{
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents('webhook.log', "[$timestamp] $message\n", FILE_APPEND);
}

/**
 * Finds the first available media object and its type from the message.
 */
function findMediaInfo(array $messageObject): ?array
{
    $mediaKeys = [
        'imageMessage'    => 'image',
        'videoMessage'    => 'video',
        'audioMessage'    => 'audio',
        'documentMessage' => 'document',
        'stickerMessage'  => 'sticker',
    ];

    foreach ($mediaKeys as $key => $type) {
        if (isset($messageObject[$key])) {
            return [$messageObject[$key], $type];
        }
    }
    return null;
}

/**
 * Downloads a file from a URL.
 */
function downloadFile(string $url)
{
    $context = stream_context_create(['http' => ['follow_location' => true]]);
    return file_get_contents($url, false, $context);
}

/**
 * Derives the decryption keys using HKDF.
 */
function getDecryptionKeys(string $mediaKey, string $mediaType): string
{
    $info = match ($mediaType) {
        'image', 'sticker' => 'WhatsApp Image Keys',
        'video'           => 'WhatsApp Video Keys',
        'audio'           => 'WhatsApp Audio Keys',
        'document'        => 'WhatsApp Document Keys',
        default           => throw new Exception("Invalid media type: {$mediaType}"),
    };
    
    return hash_hkdf('sha256', base64_decode($mediaKey), 112, $info, '');
}

/**
 * Main function to decrypt and save a media file.
 */
function handleMediaDecryption(array $mediaInfo, string $mediaType, string $messageId): void
{
    $url = $mediaInfo['url'] ?? null;
    $mediaKey = $mediaInfo['mediaKey'] ?? null;
    
    if (!$url || !$mediaKey) {
        throw new Exception("Media object is missing url or mediaKey.");
    }

    $encryptedData = downloadFile($url);
    if (!$encryptedData) {
        throw new Exception("Failed to download media from URL: {$url}");
    }

    $keys = getDecryptionKeys($mediaKey, $mediaType);
    $iv = substr($keys, 0, 16);
    $cipherKey = substr($keys, 16, 32);
    $ciphertext = substr($encryptedData, 0, -10);

    $decryptedData = openssl_decrypt($ciphertext, 'aes-256-cbc', $cipherKey, OPENSSL_RAW_DATA, $iv);
    if ($decryptedData === false) {
        throw new Exception('Failed to decrypt media.');
    }

    if (!is_dir(DOWNLOAD_DIR)) {
        mkdir(DOWNLOAD_DIR, 0755, true);
    }
    $mimeType = $mediaInfo['mimetype'] ?? 'application/octet-stream';
    $extension = explode('/', $mimeType)[1] ?? 'bin';
    $filename = $mediaInfo['fileName'] ?? "{$messageId}.{$extension}";
    $outputPath = DOWNLOAD_DIR . '/' . basename($filename);
    
    file_put_contents($outputPath, $decryptedData);
    logMessage("Successfully decrypted and saved media to: {$outputPath}");
}

// --- MAIN WEBHOOK PROCESSING LOGIC ---

$jsonPayload = file_get_contents('php://input');
$payload = json_decode($jsonPayload, true);

// 1. Access data.messages (Direct Object Access)
$messageData = $payload['data']['messages'] ?? null;

if (!$messageData) {
    logMessage('Webhook received but no message data found.');
    http_response_code(200);
    exit();
}

$key = $messageData['key'] ?? [];
$messageId = $key['id'] ?? 'unknown_id';

// 2. Identify Sender (Group vs Private)
$sender = $key['cleanedParticipantPn'] ?? $key['cleanedSenderPn'] ?? $key['remoteJid'];

// 3. Get Unified Text Body
$messageContent = $messageData['messageBody'] ?? '';

logMessage("Processing message from {$sender}. ID: {$messageId}");

if (!empty($messageContent)) {
    logMessage("Text: {$messageContent}");
    // TODO: Save text message to your database here.
}

// 4. Handle Media
$mediaInfo = findMediaInfo($messageData['message'] ?? []);
if ($mediaInfo) {
    try {
        logMessage("Media found. Type: {$mediaInfo[1]}. Attempting to decrypt...");
        handleMediaDecryption($mediaInfo[0], $mediaInfo[1], $messageId);
    } catch (Exception $e) {
        logMessage("ERROR processing media: " . $e->getMessage());
    }
}

http_response_code(200);
logMessage("--- Finished processing webhook ---");
```

[Previous

Using Our API with Postman](https://www.wasenderapi.com/api-docs/getting-started/using-our-api-with-postman)[Next

Model Context Protocol (MCP) Integration](https://www.wasenderapi.com/api-docs/getting-started/model-context-protocol-mcp-integration)

---

## Model Context Protocol (MCP) IntegrationNew

**Source:** https://www.wasenderapi.com/api-docs/getting-started/model-context-protocol-mcp-integration

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Model Context Protocol (MCP) Integration

Getting Started

Connect WasenderAPI to AI agents and automation tools using the Model Context Protocol. This remote MCP server exposes WhatsApp session management, messaging, contacts, and groups as callable tools for Claude Code, OpenCode, n8n, and other MCP-compatible platforms. Requires a paid plan and Personal Access Token for authentication.

# WasenderAPI MCP Integration Guide

Add the WasenderAPI MCP to your favorite tools (Claude Code/Desktop/CLI, OpenCode, or n8n) using your Personal Access Token.

MCP integration is only available on paid plans. This feature is not available on trial accounts.

Replace `YOUR_PERSONAL_ACCESS_TOKEN` with the token from your WasenderAPI account settings. Keep it secret.

## Claude Code / Desktop / CLI

1. Ensure the Claude CLI is installed and logged in.
2. Register the MCP using your token:

```
claude mcp add --transport http wasenderapi https://wasenderapi.com/mcp \
  --header "Authorization: Bearer YOUR_PERSONAL_ACCESS_TOKEN"
```

3. Verify it appears with `claude mcp list` and start a new Claude Code session; the WasenderAPI tools will be available.

## OpenCode

1. Open your OpenCode config (defaults to `~/.config/opencode/config.json`).
2. Paste the configuration snippet below under the `"mcp"` key:

```
{
  "mcp": {
    "WasenderAPI": {
      "type": "remote",
      "url": "https://wasenderapi.com/mcp",
      "enabled": true,
      "headers": {
        "Authorization": "Bearer YOUR_PERSONAL_ACCESS_TOKEN"
      }
    }
  },
  "$schema": "https://opencode.ai/config.json"
}
```

3. Restart or reload OpenCode. The WasenderAPI MCP will show up as `WasenderAPI`.

If you already have other MCP entries, just add the `"WasenderAPI"` block alongside them.

## n8n (MCP Client Tool Node)

Requires n8n v2.0 or later. n8n ships an MCP Tool node that can call external MCP servers.

1. Install/upgrade to n8n v2.0+
2. Create a new workflow and add the **MCP Client Tool** node.
3. Configure MCP endpoint: `https://wasenderapi.com/mcp`.
4. Add header `Authorization: Bearer YOUR_PERSONAL_ACCESS_TOKEN`.
5. Pick the desired tool (e.g., send-message, contacts, groups).
6. Execute the node; n8n will call the MCP tool and return the response.

Ensure your WasenderAPI session is connected and the token is valid before running.

## Available Tools (MCP)

The WasenderAPI MCP exposes the following tools for AI agents:

### Sessions Management

* **list\_whatsapp\_sessions** – Retrieve all WhatsApp sessions with pagination.
* **get\_specific\_whatsapp\_session** – Retrieve details of a specific session by ID.
* **get\_session\_user** – Get information about the WhatsApp user associated with a session.
* **create\_whatsapp\_session** – Create a new WhatsApp session.
* **update\_whatsapp\_session** – Update a specific WhatsApp session.
* **connect\_whatsapp\_session** – Start/connect a WhatsApp session (returns QR code if needed).
* **disconnect\_whatsapp\_session** – Disconnect a WhatsApp session.
* **get\_message\_logs** – Retrieve message logs for a specific session.
* **get\_session\_logs** – Retrieve session logs for a specific session.

### Messaging

* **send\_text\_message** – Send a text message via a specified session.
* **send\_mention\_text\_message** – Send a text message with mentions.
* **send\_image\_message** – Send an image message via WhatsApp.
* **send\_audio\_message** – Send an audio message (voice note or audio file).
* **send\_video\_message** – Send a video message via WhatsApp.
* **send\_document\_message** – Send a document/file via WhatsApp.
* **send\_location\_message** – Send a location message via WhatsApp.
* **send\_contact\_message** – Send a contact card via WhatsApp.
* **send\_poll\_message** – Send a poll via WhatsApp.
* **send\_presence\_update** – Send a presence update (available, unavailable, composing, recording, paused).
* **resend\_message** – Resend a failed WhatsApp message.
* **edit\_message** – Edit an existing WhatsApp message.
* **delete\_message** – Delete a WhatsApp message.
* **get\_message\_info** – Get information about a specific message (delivery status, read receipts).

### Contacts

* **list\_contacts** – List all WhatsApp contacts for a specified session.
* **add\_or\_edit\_contact** – Add a new contact or edit an existing contact in WhatsApp.
* **get\_contact\_info** – Get information about a specific WhatsApp contact.
* **get\_contact\_picture** – Get the profile picture URL of a WhatsApp contact.
* **block\_contact** – Block a WhatsApp contact.
* **unblock\_contact** – Unblock a WhatsApp contact.
* **check\_jid\_on\_whatsapp** – Check if a phone number/JID exists on WhatsApp.
* **get\_lid\_from\_phone\_number** – Get the LID (Linked Device ID) for a given phone number.
* **get\_phone\_number\_from\_lid** – Get the phone number for a given LID.
* **search\_contacts** – Search for WhatsApp contacts by name or phone number.

### Groups

* **list\_groups** – List all WhatsApp groups for a specified session.
* **create\_group** – Create a new WhatsApp group with specified name and participants.
* **get\_group\_metadata** – Get metadata for a specific group (name, description, participants).
* **get\_group\_participants** – Get participants of a specific WhatsApp group.
* **add\_group\_participants** – Add participants to a WhatsApp group.
* **remove\_group\_participants** – Remove participants from a WhatsApp group.
* **update\_group\_participants** – Promote or demote participants in a WhatsApp group.
* **update\_group\_settings** – Update settings for a WhatsApp group (subject, description, announce mode, etc.).
* **leave\_group** – Leave a WhatsApp group.
* **generate\_invite\_link** – Generate an invite link for a WhatsApp group.
* **accept\_group\_invite** – Accept a WhatsApp group invite by code.
* **search\_groups** – Search for WhatsApp groups by name.

### Documentation

* **get\_api\_documentation\_tool** – Get API documentation. Returns index of all APIs if no ID provided, or detailed docs for a specific entry.

#### Code Examples

json

```
{
  "mcp": {
    "WasenderAPI": {
      "type": "remote",
      "url": "https://wasenderapi.com/mcp",
      "enabled": true,
      "headers": {
        "Authorization": "Bearer YOUR_PERSONAL_ACCESS_TOKEN"
      }
    }
  }
}
```

[Previous

How To Receive Messages and Media From Wasenderapi](https://www.wasenderapi.com/api-docs/getting-started/how-to-receive-messages-and-media-from-wasenderapi)[Next

Using Proxies](https://www.wasenderapi.com/api-docs/getting-started/using-proxies)

---

## Using ProxiesNew

**Source:** https://www.wasenderapi.com/api-docs/getting-started/using-proxies

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Using Proxies

Getting Started

Learn how to configure proxies for your WhatsApp sessions to prevent frequent disconnects and ensure fast, reliable message delivery. SOCKS5 is highly recommended.

# Configuring Proxies for WhatsApp Sessions

Using a proxy helps mask our server's IP address and routes your session's traffic through a dedicated IP, which helps with connection stability. Proxies can be configured individually per session.

**Supported Protocols:** We support `http://`, `https://`, and `socks5://` proxies, but **SOCKS5 is highly recommended** for the best performance and seamless compatibility with WhatsApp.

## Best Practices & Recommendations

To ensure your sessions remain stable, please follow these guidelines when selecting a proxy:

* **Location Matching:** Always use a proxy located in the **same country** as the phone number registered to the WhatsApp session.
* **Sticky IPs:** Use a **sticky proxy** (an IP that remains the same for a prolonged period) rather than a frequently rotating proxy.
* **Speed is Key:** Ensure your proxy is fast and has low latency. Slow proxies will cause connection timeouts and lead to `session not ready` errors.

**Recommended Provider:** If you are looking for fast, reliable, and sticky SOCKS5 proxies that work perfectly with our system, we highly recommend [GeoNode](https://geonode.com/?ref=133350).

*(Disclaimer: This is an affiliate link. Using it helps support our platform at no extra cost to you.)*

## Configuration via Dashboard

You can easily assign a proxy to a session without writing any code:

1. Navigate to your dashboard and go to **Sessions**.
2. Click **Edit Session** on the session you want to modify.
3. Locate the **Proxy URL** field.
4. Enter your proxy string (e.g., `socks5://user:[email protected]:1080`) and save.

## Configuration via API

You can also programmatically update a session's proxy using our REST API.

**Authentication Note:** Because updating a session's core configuration is an account-level action, you must authenticate this request using your **Personal Access Token** (found in your profile settings), *not* the Session API Key.

Make a `PUT` request to the session endpoint with your proxy URL (example below)

#### Code Examples

bash

```
curl -X PUT "https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}" 
  -H "Authorization: Bearer YOUR_PERSONAL_ACCESS_TOKEN" 
  -H "Content-Type: application/json" 
  -d '{
      "proxy_url": "socks5://username:password@ip:port"
  }'
```

[Previous

Model Context Protocol (MCP) Integration](https://www.wasenderapi.com/api-docs/getting-started/model-context-protocol-mcp-integration)[Next

Official SDKs – Node.js, Python & Laravel](https://www.wasenderapi.com/api-docs/developer-sdks/official-sdks-nodejs-python-laravel)

---

## Official SDKs – Node.js, Python & Laravel

**Source:** https://www.wasenderapi.com/api-docs/developer-sdks/official-sdks-nodejs-python-laravel

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Official SDKs – Node.js, Python & Laravel

Developer SDKs

WasenderAPI provides official SDKs to help developers integrate quickly and efficiently using their preferred programming language or framework.

# Official SDKs – Node.js, Python & Laravel

WasenderAPI provides official SDKs to help developers integrate quickly and efficiently using their preferred programming language or framework.

## Node.js SDK

Install the Node.js SDK using npm:

```
npm install wasenderapi
```

View full documentation and usage examples on
[npmjs.com](https://www.npmjs.com/package/wasenderapi).

## Python SDK

Install the Python SDK using pip:

```
pip install wasenderapi
```

View full documentation and usage examples on
[PyPI](https://pypi.org/project/wasenderapi).

## Laravel SDK

Install the Laravel SDK using Composer:

```
composer require wasenderapi/wasenderapi-laravel
```

View the package and installation details on
[Packagist](https://packagist.org/packages/wasenderapi/wasenderapi-laravel).

[Previous

Using Proxies](https://www.wasenderapi.com/api-docs/getting-started/using-proxies)[Next

How to Authenticate API Requests Using Bearer Tokens](https://www.wasenderapi.com/api-docs/authentication/how-to-authenticate-api-requests-using-bearer-tokens)

---

## How to Authenticate API Requests Using Bearer Tokens

**Source:** https://www.wasenderapi.com/api-docs/authentication/how-to-authenticate-api-requests-using-bearer-tokens

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# How to Authenticate API Requests Using Bearer Tokens

Authentication

This guide explains how to authenticate API requests using a Bearer Token, generated after connecting your WhatsApp session through the Session Management screen.

# Authentication

All WasenderAPI endpoints are secured and require authentication via an API Key. This API key is automatically generated when you create or restore a session from the Session Management screen.

## Obtaining Your API Key

Once your WhatsApp session is connected, a unique API Key will be available. This API Key must be included in the `Authorization` header for every API request.

## Authorization Header Format

```
Authorization: Bearer token  YOUR_SESSION_API_KEY
```

Replace `YOUR_SESSION_API_KEY` with the API key you received from the session screen.

ℹ️ API Keys are tied to a specific session. If the session is deleted, the key becomes invalid.

Keep your API Key private. Avoid exposing it in public repositories or frontend code.

#### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| Authorization | string | Yes | Bearer token obtained after session connection. Format: Bearer YOUR\_SESSION\_API\_JEY |

#### Response Examples

No API KEY ResponseInvalid API KEY Response

```
{
 "success": false,
 "message": "API key is required"
}
```

[Previous

Official SDKs – Node.js, Python & Laravel](https://www.wasenderapi.com/api-docs/developer-sdks/official-sdks-nodejs-python-laravel)[Next

How to Authenticate API Requests Using Personal Access Token](https://www.wasenderapi.com/api-docs/authentication/how-to-authenticate-api-requests-using-personal-access-token)

---

## How to Authenticate API Requests Using Personal Access Token

**Source:** https://www.wasenderapi.com/api-docs/authentication/how-to-authenticate-api-requests-using-personal-access-token

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# How to Authenticate API Requests Using Personal Access Token

Authentication

This guide explains how to authenticate API requests using a Bearer Token, generated from your settings - personal access token page.

# Authentication

To authenticate account-level requests on WasenderAPI, you must use a **Personal Access Token**.

## What Is a Personal Access Token?

A Personal Access Token (PAT) is used to authorize access to your account-level endpoints, such as:

* Creating or deleting WhatsApp sessions
* Listing all existing sessions
* Accessing user account information

## Where to Get It

You can generate and manage your Personal Access Token from the **Settings > Personal Access Token** page in your Wasender dashboard.

## Authorization Header Format

Include your token in the `Authorization` header of your HTTP requests using the following format:

```
Authorization: Bearer YOUR_PERSONAL_ACCESS_TOKEN
```

Replace `YOUR_PERSONAL_ACCESS_TOKEN` with the token you obtained from the settings page.

⚠️ Your Personal Access Token provides full access to your account. Keep it confidential and avoid sharing or exposing it in public code repositories or frontend code.

#### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| Authorization | string | Yes | Bearer token obtained from the settings - personal access token page . Format: Bearer YOUR\_PERSONAL\_ACCESS\_TOKEN |

#### Response Examples

No API KEY Response

```
{
 "success": false,
 "message": "Unnotarized"
}
```

[Previous

How to Authenticate API Requests Using Bearer Tokens](https://www.wasenderapi.com/api-docs/authentication/how-to-authenticate-api-requests-using-bearer-tokens)[Next

Get All WhatsApp Sessions](https://www.wasenderapi.com/api-docs/sessions/get-all-whatsapp-sessions)

---

## Get All WhatsApp Sessions

**Source:** https://www.wasenderapi.com/api-docs/sessions/get-all-whatsapp-sessions

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Get All WhatsApp Sessions

Sessions

GET`/api/whatsapp-sessions`

Copy endpoint

Retrieves a list of all WhatsApp sessions available to the authenticated user.

# Get All WhatsApp Sessions

Retrieves a list of all WhatsApp sessions available to the authenticated user.

This endpoint requires an access token to be included in the Authorization header.
You can get the token from [here](https://wasenderapi.com/settings/tokens).

#### Code Examples

bashpythonjavascriptphprubygocsharpjavaswiftpowershelltypescriptrust

```
curl "https://www.wasenderapi.com/api/whatsapp-sessions"
  -H "Authorization: Bearer YOUR_PERSONAL_ACCESS_TOKEN"
```

#### Response Examples

Success Response

```
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "Business WhatsApp",
            "phone_number": "+1234567890",
            "status": "connected",
            "account_protection": true,
            "log_messages": true,
            "webhook_url": "https:\/\/example.com\/webhook",
            "webhook_enabled": true,
            "webhook_events": [
                "message",
                "group_update"
            ],
            "created_at": "2025-04-01T12:00:00Z",
            "updated_at": "2025-05-08T15:30:00Z"
        },
        {
            "id": 2,
            "name": "Support WhatsApp",
            "phone_number": "+9876543210",
            "status": "DISCONNECTED",
            "account_protection": false,
            "log_messages": false,
            "webhook_url": null,
            "webhook_enabled": false,
            "webhook_events": null,
            "created_at": "2025-04-15T09:45:00Z",
            "updated_at": "2025-05-07T11:20:00Z"
        }
    ]
}
```

[Previous

How to Authenticate API Requests Using Personal Access Token](https://www.wasenderapi.com/api-docs/authentication/how-to-authenticate-api-requests-using-personal-access-token)[Next

Create WhatsApp Session](https://www.wasenderapi.com/api-docs/sessions/create-whatsapp-session)

---

## Create WhatsApp Session

**Source:** https://www.wasenderapi.com/api-docs/sessions/create-whatsapp-session

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Create WhatsApp Session

Sessions

POST`/api/whatsapp-sessions`

Copy endpoint

Creates a new WhatsApp session with the provided details. Requires an active subscription and is subject to session limits.

# Create WhatsApp Session

Creates a new WhatsApp session with the provided details. Requires an active subscription and is subject to session limits.

This endpoint requires an access token to be included in the Authorization header.
You can get the token from [here](https://wasenderapi.com/settings/tokens).

#### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| name | string | Yes | Name of the WhatsApp session. |
| phone\_number | string | Yes | Phone number in international format. |
| account\_protection | boolean | Yes | Enable account protection features. |
| log\_messages | boolean | Yes | Enable message logging. |
| webhook\_url | string | No | URL for receiving webhook notifications. |
| webhook\_enabled | boolean | No | Enable webhook notifications. |
| webhook\_events | array | No | Array of events to receive webhook notifications for. |
| read\_incoming\_messages | boolean | No | Enable the option to automatically mark messages as read when they are received. |
| auto\_reject\_calls | boolean | No | Enable automatic rejection of incoming calls. |
| ignore\_groups | boolean | No | ignore all webhook events from groups. |
| ignore\_channels | boolean | No | ignore all webhook events from channels (newsletters). |
| ignore\_broadcasts | boolean | No | ignore all webhook events from broadcast lists. |
| proxy\_url | string | No | Allowed protocols: http, https, socks5. Use a public domain only (IP addresses and local/private networks are blocked). |
| always\_online | boolean | No | When enabled, your session will always appear online to your contacts, even when you're not actively using WhatsApp. |

#### Code Examples

bashpythonjavascriptphprubygocsharpjavaswiftpowershelltypescriptrust

```
curl -X POST "https://www.wasenderapi.com/api/whatsapp-sessions"
  -H "Authorization: Bearer YOUR_PERSONAL_ACCESS_TOKEN"
  -H "Content-Type: application/json"
  -d '{
    "name": "Sample Name",
    "phone_number": "Sample Phone_number",
    "account_protection": true,
    "log_messages": true,
    "read_incoming_messages": false,
    "webhook_url": "Sample Webhook_url",
    "webhook_enabled": true,
    "webhook_events": [
        "messages.received",
        "session.status",
        "messages.update"
    ]
  }'
```

#### Response Examples

Success ResponseError Response - Session Limit

```
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Business WhatsApp",
    "phone_number": "+1234567890",
    "status": "connected",
    "account_protection": true,
    "log_messages": true,
    "read_incoming_messages": false,
    "webhook_url": "https://example.com/webhook",
    "webhook_enabled": true,
    "webhook_events": [
      "messages.received",
      "session.status",
      "messages.update"
    ],
    "api_key": "75075a7bf6417bff59e76fb7205382c2dc74cf1769e76f382c2dc74cf176c0bf",
    "webhook_secret": "fb61be92ddb7935e0cedcec58e470f6c",
    "created_at": "2025-04-01T12:00:00Z",
    "updated_at": "2025-05-08T15:30:00Z"
  }
}
```

[Previous

Get All WhatsApp Sessions](https://www.wasenderapi.com/api-docs/sessions/get-all-whatsapp-sessions)[Next

Get WhatsApp Session Details](https://www.wasenderapi.com/api-docs/sessions/get-whatsapp-session-details)

---

## Get WhatsApp Session Details

**Source:** https://www.wasenderapi.com/api-docs/sessions/get-whatsapp-session-details

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Get WhatsApp Session Details

Sessions

GET`/api/whatsapp-sessions/{whatsappSession}`

Copy endpoint

Retrieves details for a specific WhatsApp session.

# Get WhatsApp Session Details

Retrieves details for a specific WhatsApp session.

This endpoint requires an access token to be included in the Authorization header.
You can get the token from [here](https://wasenderapi.com/settings/tokens).

#### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| whatsappSession | integer | Yes | ID of the WhatsApp session. |

#### Code Examples

bashpythonjavascriptphprubygocsharpjavaswiftpowershelltypescriptrust

```
curl "https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}"
  -H "Authorization: Bearer YOUR_PERSONAL_ACCESS_TOKEN"
```

#### Response Examples

Success Response

```
{
    "success": true,
    "data": {
        "id": 1,
        "name": "Business WhatsApp",
        "phone_number": "+1234567890",
        "status": "connected",
        "account_protection": true,
        "log_messages": true,
        "webhook_url": "https://example.com/webhook",
        "webhook_enabled": true,
        "webhook_events": [
            "message",
            "group_update"
        ],
        "api_key": "75075a7bf6417bff59e76fb7205382c2dc74cf1769e76f382c2dc74cf176c0bf",
        "webhook_secret": "fb61be92ddb7935e0cedcec58e470f6c",
        "created_at": "2025-04-01T12:00:00Z",
        "updated_at": "2025-05-08T15:30:00Z"
    }
}
```

[Previous

Create WhatsApp Session](https://www.wasenderapi.com/api-docs/sessions/create-whatsapp-session)[Next

Update WhatsApp Session](https://www.wasenderapi.com/api-docs/sessions/update-whatsapp-session)

---

## Update WhatsApp Session

**Source:** https://www.wasenderapi.com/api-docs/sessions/update-whatsapp-session

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Update WhatsApp Session

Sessions

PUT`/api/whatsapp-sessions/{whatsappSession}`

Copy endpoint

Updates details for a specific WhatsApp session. If the session is connected, webhook settings will be synced with the WhatsApp API server.

# Update WhatsApp Session

Updates details for a specific WhatsApp session. If the session is connected, webhook settings will be synced with the WhatsApp API server.

This endpoint requires an access token to be included in the Authorization header.
You can get the token from [here](https://wasenderapi.com/settings/tokens).

#### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| whatsappSession | integer | Yes | ID of the WhatsApp session. |
| name | string | No | Name of the WhatsApp session. |
| phone\_number | string | No | Phone number in international format. |
| account\_protection | boolean | No | Enable account protection features. |
| log\_messages | boolean | No | Enable message logging. |
| webhook\_url | string | No | URL for receiving webhook notifications. |
| webhook\_enabled | boolean | No | Enable webhook notifications. |
| webhook\_events | array | No | Array of events to receive webhook notifications for. |
| read\_incoming\_messages | boolean | No | Enable the option to automatically mark messages as read when they are received. |
| auto\_reject\_calls | boolean | No | Enable automatic rejection of incoming calls. |
| ignore\_groups | boolean | No | ignore all webhook events from groups. |
| ignore\_channels | boolean | No | ignore all webhook events from channels (newsletters). |
| ignore\_broadcasts | boolean | No | ignore all webhook events from broadcast lists. |
| proxy\_url | string | No | Allowed protocols: http, https, socks5. Use a public domain only (IP addresses and local/private networks are blocked). |
| always\_online | boolean | No | When enabled, your session will always appear online to your contacts, even when you're not actively using WhatsApp. |

#### Code Examples

bashpythonjavascriptphprubygocsharpjavaswiftpowershelltypescriptrust

```
curl -X PUT "https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}"
  -H "Authorization: Bearer YOUR_PERSONAL_ACCESS_TOKEN"
  -H "Content-Type: application/json"
  -d '{
      "name": "Sample Name",
      "phone_number": "Sample Phone_number",
      "account_protection": true,
      "log_messages": true,
      "webhook_url": "Sample Webhook_url",
      "webhook_enabled": true,
      "webhook_events": [
        "messages.received",
        "session.status",
        "messages.update"
      ]
  }'
```

#### Response Examples

Success ResponseSuccess with Warning

```
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Business WhatsApp",
    "phone_number": "+1234567890",
    "status": "connected",
    "account_protection": true,
    "log_messages": true,
    "read_incoming_messages": true,
    "webhook_url": "https://example.com/webhook",
    "webhook_enabled": true,
    "webhook_events": [
      "messages.received",
      "session.status",
      "messages.update"
    ],
    "api_key": "75075a7bf6417bff59e76fb7205382c2dc74cf1769e76f382c2dc74cf176c0bf",
    "webhook_secret": "fb61be92ddb7935e0cedcec58e470f6c",
    "created_at": "2025-04-01T12:00:00Z",
    "updated_at": "2025-05-08T15:30:00Z"
  }
}
```

[Previous

Get WhatsApp Session Details](https://www.wasenderapi.com/api-docs/sessions/get-whatsapp-session-details)[Next

Get WhatsApp Session Status](https://www.wasenderapi.com/api-docs/sessions/get-whatsapp-session-status)

---

## Get WhatsApp Session Status

**Source:** https://www.wasenderapi.com/api-docs/sessions/get-whatsapp-session-status

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Get WhatsApp Session Status

Sessions

GET`/api/status`

Copy endpoint

Returns the current status of the connected WhatsApp session.

# Get WhatsApp Session Status

This endpoint returns the current status of a specific WhatsApp session. The session must be previously initialized and authenticated.

## Session Statuses Explained

The following are the possible statuses that may be returned by this endpoint:

* **connecting** — The session is attempting to establish a connection with WhatsApp servers. This typically occurs right after initialization.
* **connected** — The session is successfully authenticated and actively connected to WhatsApp. You can send and receive messages.
* **disconnected** — This is the first status before the user attempts to connect. Once the user tries to connect, this status will no longer be shown.
* **need\_scan** — This status means the session needs to be scanned with a QR code. It usually occurs when initializing a new session or if the previous session is no longer valid.
* **logged\_out** — The user has logged out of the WhatsApp session either manually or from another device. You'll need to re-authenticate by scanning a QR code again.
* **expired** — The session is no longer valid, often due to extended inactivity or because it was invalidated remotely. Reinitialization is required.

#### Code Examples

bashpythonjavascriptphprubygocsharpjavaswiftpowershelltypescriptrust

```
curl "https://www.wasenderapi.com/api/status"
  -H "Authorization: Bearer YOUR_API_KEY"
```

#### Response Examples

Session Connected ResponseSession Logged out ResponseSession Needs Scan ResponseSession Expired ResponseSession Disconnected

```
{
  "status":"connected"
}
```

[Previous

Update WhatsApp Session](https://www.wasenderapi.com/api-docs/sessions/update-whatsapp-session)[Next

Delete WhatsApp Session](https://www.wasenderapi.com/api-docs/sessions/delete-whatsapp-session)

---

## Delete WhatsApp Session

**Source:** https://www.wasenderapi.com/api-docs/sessions/delete-whatsapp-session

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Delete WhatsApp Session

Sessions

DELETE`/api/whatsapp-sessions/{whatsappSession}`

Copy endpoint

Deletes a specific WhatsApp session. If the session is connected, it will attempt to disconnect from the WhatsApp API server first.

# Delete WhatsApp Session

Deletes a specific WhatsApp session. If the session is connected, it will attempt to disconnect from the WhatsApp API server first.

This endpoint requires an access token to be included in the Authorization header.
You can get the token from [here](https://wasenderapi.com/settings/tokens).

#### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| whatsappSession | integer | Yes | ID of the WhatsApp session. |

#### Code Examples

bashpythonjavascriptphprubygocsharpjavaswiftpowershelltypescriptrust

```
curl -X DELETE "https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}"
  -H "Authorization: Bearer YOUR_PERSONAL_ACCESS_TOKEN"
  -H "Content-Type: application/json"
```

#### Response Examples

Success Response (204 No content)

```
{
}
```

[Previous

Get WhatsApp Session Status](https://www.wasenderapi.com/api-docs/sessions/get-whatsapp-session-status)[Next

Restart WhatsApp Session](https://www.wasenderapi.com/api-docs/sessions/restart-whatsapp-session)

---

## Restart WhatsApp Session

**Source:** https://www.wasenderapi.com/api-docs/sessions/restart-whatsapp-session

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Restart WhatsApp Session

Sessions

POST`/api/whatsapp-sessions/{whatsappSession}/restart`

Copy endpoint

Restarts a specific, currently connected WhatsApp session.

# Restart WhatsApp Session

This endpoint initiates a soft restart of the WhatsApp session connection. It is useful for refreshing the connection to the server without needing to re-scan a QR code.

The session must be in a **connected** state for the restart to be successful. If the session is disconnected or in another state, the request will fail.

#### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| whatsappSession | integer | Yes | The unique identifier of the WhatsApp session to restart. |

#### Code Examples

bashpythonjavascriptphprubygocsharpjavaswiftpowershelltypescriptrust

```
curl -X POST "https://www.wasenderapi.com/api/whatsapp-sessions/my-session-123/restart" 
  -H "Authorization: Bearer YOUR_API_KEY"
```

#### Response Examples

Success ResponseError Response (Not Connected)

```
{
    "success": true,
    "message": "WhatsApp session restarted successfully."
}
```

[Previous

Delete WhatsApp Session](https://www.wasenderapi.com/api-docs/sessions/delete-whatsapp-session)[Next

Connect WhatsApp Session](https://www.wasenderapi.com/api-docs/sessions/connect-whatsapp-session)

---

## Connect WhatsApp Session

**Source:** https://www.wasenderapi.com/api-docs/sessions/connect-whatsapp-session

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Connect WhatsApp Session

Sessions

POST`/api/whatsapp-sessions/{whatsappSession}/connect`

Copy endpoint

Initiates the connection process for a WhatsApp session. Requires an active subscription.

# Connect WhatsApp Session

Initiates the connection process for a WhatsApp session. Requires an active subscription.

This endpoint requires an access token to be included in the Authorization header.
You can get the token from [here](https://wasenderapi.com/settings/tokens).

#### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| whatsappSession | integer | Yes | ID of the WhatsApp session. |

#### Code Examples

bashpythonjavascriptphprubygocsharpjavaswiftpowershelltypescriptrust

```
curl -X POST "https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}/connect"
  -H "Authorization: Bearer YOUR_PERSONAL_ACCESS_TOKEN"
  -H "Content-Type: application/json"
```

#### Response Examples

Success Response - QR Code NeededSuccess Response - Already InitializedError Response - No SubscriptionError Response - Connection Failure

```
{
  "success": true,
  "data": {
    "status": "NEED_SCAN",
    "qrCode": "2@DTMUHeYfa9/RMXr8A2IP3/...", // This is the QR string. Use a QR code library to generate an image expires after 45s call GetQrCode endpoint to generate a fresh one.
  }
}
```

[Previous

Restart WhatsApp Session](https://www.wasenderapi.com/api-docs/sessions/restart-whatsapp-session)[Next

Get Message Logs](https://www.wasenderapi.com/api-docs/sessions/get-message-logs)

---

## Get Message Logs

**Source:** https://www.wasenderapi.com/api-docs/sessions/get-message-logs

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Get Message Logs

Sessions

GET`/api/whatsapp-sessions/{whatsappSession}/message-logs`

Copy endpoint

Retrieves a paginated list of message logs for a specific session.

# Get Message Logs

This endpoint fetches a paginated history of messages sent  `using our API`  by the specified WhatsApp session. It is useful for auditing, analytics, or displaying message history in an application.

**Important:** Message logging must be enabled for each session individually in your settings. If logging is disabled, the `content` and the `to` field will be`null`.

The response is structured as a standard paginated object, which you can navigate using the optional `page` and `per_page` query parameters.

#### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| whatsappSession | string | Yes | The unique identifier of the WhatsApp session. |
| page | integer | No | The page number to retrieve. Defaults to 1. |
| per\_page | integer | No | The number of items to retrieve per page. Defaults to 10. |

#### Code Examples

bashpythonjavascriptphprubygocsharpjavaswiftpowershelltypescriptrust

```
curl -X GET "https://www.wasenderapi.com/api/whatsapp-sessions/my-session-123/message-logs?page=1&per_page=20" 
  -H "Authorization: Bearer YOUR_API_KEY"
```

#### Response Examples

Success Response (Paginated)

```
{
    "success": true,
    "data": {
        "current_page": 1,
        "data": [
            {
                "id": "1001",
                "whatsapp_session_id": "501",
                "to": "+155501001234",
                "content": "{\"text\":\"This is a sample message. Lorem ipsum dolor sit amet, consectetur adipiscing elit.\"}",
                "status": "sent",
                "failed_reason": null,
                "created_at": "2023-10-27 10:30:15",
                "updated_at": "2023-10-27 10:30:17"
            },
            {
                "id": "1002",
                "whatsapp_session_id": "502",
                "to": "+4455501005678",
                "content": "{\"text\":\"Hello! This is an example message sent to a user. How can we help you today?\"}",
                "status": "in_progress",
                "failed_reason": null,
                "created_at": "2023-10-27 10:32:45",
                "updated_at": "2023-10-27 10:32:48"
            },
            {
                "id": "1003",
                "whatsapp_session_id": "503",
                "to": "+5255501009876",
                "content": "{\"text\":\"Just a test message to verify the connection.\"}",
                "status": "failed",
                "failed_reason": "invalid WhatsApp number",
                "created_at": "2023-10-27 10:35:01",
                "updated_at": "2023-10-27 10:35:03"
            }
        ],
        "first_page_url": "/api/session-id-123/message-logs?page=1",
        "from": 1,
        "last_page": 5,
        "last_page_url": "/api/session-id-123/message-logs?page=5",
        "next_page_url": "/api/session-id-123/message-logs?page=2",
        "path": "/api/session-id-123/message-logs",
        "per_page": 3,
        "prev_page_url": null,
        "to": 3,
        "total": 15
    }
}
```

[Previous

Connect WhatsApp Session](https://www.wasenderapi.com/api-docs/sessions/connect-whatsapp-session)[Next

Get WhatsApp Session QR Code](https://www.wasenderapi.com/api-docs/sessions/get-whatsapp-session-qr-code)

---

## Get WhatsApp Session QR Code

**Source:** https://www.wasenderapi.com/api-docs/sessions/get-whatsapp-session-qr-code

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Get WhatsApp Session QR Code

Sessions

GET`/api/whatsapp-sessions/{whatsappSession}/qrcode`

Copy endpoint

Retrieves the QR code needed to connect a WhatsApp session with the WhatsApp client. Requires an active subscription.

# Get WhatsApp Session QR Code

Retrieves the QR code needed to connect a WhatsApp session with the WhatsApp client. Requires an active subscription.

This endpoint requires an access token to be included in the Authorization header.
You can get the token from
[here](https://wasenderapi.com/settings/tokens).

**Important:** Before calling this endpoint, you must first initialize the WhatsApp session by calling the
[Connect WhatsApp Session](https://wasenderapi.com/api-docs/sessions/connect-whatsapp-session) endpoint.

#### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| whatsappSession | integer | Yes | ID of the WhatsApp session. |

#### Code Examples

bashpythonjavascriptphprubygocsharpjavaswiftpowershelltypescriptrust

```
curl "https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}/qrcode"
  -H "Authorization: Bearer YOUR_PERSONAL_ACCESS_TOKEN"
```

#### Response Examples

Success ResponseError Response - No SubscriptionError Response - QR Code FailureError Response - Session Not initialized

```
{
    "success": true,
    "data": {
        "qrCode": "2@DfzdTHeYfa9/RMXr8A2IP3/....", // This is the QR string. Use a QR code library to generate an image.
    }
}
```

[Previous

Get Message Logs](https://www.wasenderapi.com/api-docs/sessions/get-message-logs)[Next

Get Session Logs](https://www.wasenderapi.com/api-docs/sessions/get-session-logs)

---

## Get Session Logs

**Source:** https://www.wasenderapi.com/api-docs/sessions/get-session-logs

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Get Session Logs

Sessions

GET`/api/whatsapp-sessions/{whatsappSession}/session-logs`

Copy endpoint

Retrieves a paginated list of session activity logs.

# Get Session Logs

This endpoint fetches a paginated history of significant events for the specified WhatsApp session. These logs are crucial for debugging connection issues, tracking the session's lifecycle (e.g., when it connected, disconnected, or received a QR code), and general auditing.

The response is a standard paginated object, which you can navigate using the `page` and `per_page` query parameters.

#### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| whatsappSession | integer | Yes | The unique identifier of the WhatsApp session. |
| page | integer | No | The page number to retrieve. Defaults to 1. |
| per\_page | integer | No | The number of items to retrieve per page. Defaults to 10. |

#### Code Examples

bashpythonjavascriptphprubygocsharpjavaswiftpowershelltypescriptrust

```
curl -X GET "https://www.wasenderapi.com/api/whatsapp-sessions/my-session-123/session-logs?page=1&per_page=15" 
  -H "Authorization: Bearer YOUR_API_KEY"
```

#### Response Examples

Success Response (Paginated)Error Response

```
{
    "success": true,
    "data": {
        "current_page": 1,
        "data": [
            {
                "id": 201,
                "whatsapp_session_id": 1,
                "event_type": "session_restarted",
                "status":"connected",
                "occurred_at": "2025-09-23T12:00:00.000000Z"
            },
            {
                "id": 200,
                "whatsapp_session_id": 1,
                "event_type": "status_change",
                "status": "need_scan",
                "occurred_at": "2025-09-23T11:59:30.000000Z"
            }
        ],
        "first_page_url": "/api/whatsapp-sessions/my-session-123/session-logs?page=1",
        "from": 1,
        "last_page": 3,
        "last_page_url": "/api/whatsapp-sessions/my-session-123/session-logs?page=3",
        "next_page_url": "/api/whatsapp-sessions/my-session-123/session-logs?page=2",
        "path": "/api/whatsapp-sessions/my-session-123/session-logs",
        "per_page": 2,
        "prev_page_url": null,
        "to": 2,
        "total": 6
    }
}
```

[Previous

Get WhatsApp Session QR Code](https://www.wasenderapi.com/api-docs/sessions/get-whatsapp-session-qr-code)[Next

Disconnect WhatsApp Session](https://www.wasenderapi.com/api-docs/sessions/disconnect-whatsapp-session)

---

## Disconnect WhatsApp Session

**Source:** https://www.wasenderapi.com/api-docs/sessions/disconnect-whatsapp-session

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Disconnect WhatsApp Session

Sessions

POST`/api/whatsapp-sessions/{whatsappSession}/disconnect`

Copy endpoint

Disconnects an active WhatsApp session.

# Disconnect WhatsApp Session

Disconnects an active WhatsApp session.

This endpoint requires an access token to be included in the Authorization header.
You can get the token from [here](https://wasenderapi.com/settings/tokens).

#### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| whatsappSession | integer | Yes | ID of the WhatsApp session. |

#### Code Examples

bashpythonjavascriptphprubygocsharpjavaswiftpowershelltypescriptrust

```
curl -X POST "https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}/disconnect"
  -H "Authorization: Bearer YOUR_API_KEY"
  -H "Content-Type: application/json"
```

#### Response Examples

Success Response

```
{
    "success": true,
    "data": {
        "status": "disconnected",
        "message": "WhatsApp session disconnected successfully"
    }
}
```

[Previous

Get Session Logs](https://www.wasenderapi.com/api-docs/sessions/get-session-logs)[Next

Get Session User Info](https://www.wasenderapi.com/api-docs/sessions/get-session-user-info)

---

## Get Session User Info

**Source:** https://www.wasenderapi.com/api-docs/sessions/get-session-user-info

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Get Session User Info

Sessions

GET`/api/user`

Copy endpoint

Retrieves information about the WhatsApp user associated with the current API key session.

# Get Session User Info

Retrieves information about the WhatsApp user associated with the current API key session.

#### Code Examples

bashpythonjavascriptphprubygocsharpjavaswiftpowershelltypescriptrust

```
curl "https://www.wasenderapi.com/api/user"
  -H "Authorization: Bearer YOUR_API_KEY"
```

#### Response Examples

Success Response

```
{
  "success": true,
  "data": {
     "id": "1234567890:[email protected]",
     "name": "Your WhatsApp Name",
     "lid": "Your LID"
  }
}
```

[Previous

Disconnect WhatsApp Session](https://www.wasenderapi.com/api-docs/sessions/disconnect-whatsapp-session)[Next

Check if a number is on WhatsApp](https://www.wasenderapi.com/api-docs/sessions/check-if-a-number-is-on-whatsapp)

---

## Check if a number is on WhatsApp

**Source:** https://www.wasenderapi.com/api-docs/sessions/check-if-a-number-is-on-whatsapp

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Check if a number is on WhatsApp

Sessions

GET`/api/on-whatsapp/{phone_number}`

Copy endpoint

Verifies if a given Phone Number is registered on WhatsApp.

# Check if a number is on WhatsApp

Verifies if a given Phone Number is registered on WhatsApp.

#### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| phone\_number | string | Yes | The Phone Number of the user to check, e.g., +1234567890 |

#### Code Examples

bashpythonjavascriptphprubygocsharpjavaswiftpowershelltypescriptrust

```
curl "https://www.wasenderapi.com/api/on-whatsapp/{phone_number}"
  -H "Authorization: Bearer YOUR_API_KEY"
```

#### Response Examples

Success Response

```
{
      "success": true,
      "data": {
        "exists": true,
}
```

[Previous

Get Session User Info](https://www.wasenderapi.com/api-docs/sessions/get-session-user-info)[Next

Regenerate API Key](https://www.wasenderapi.com/api-docs/sessions/regenerate-api-key)

---

## Regenerate API Key

**Source:** https://www.wasenderapi.com/api-docs/sessions/regenerate-api-key

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Regenerate API Key

Sessions

POST`/api/whatsapp-sessions/{whatsappSession}/regenerate-key`

Copy endpoint

Regenerates the API key for a specific WhatsApp session.

# Regenerate API Key

Regenerates the API key for a specific WhatsApp session.

This endpoint requires an access token to be included in the Authorization header.
You can get the token from [here](https://wasenderapi.com/settings/tokens).

#### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| whatsappSession | integer | Yes | ID of the WhatsApp session. |

#### Code Examples

bashpythonjavascriptphprubygocsharpjavaswiftpowershelltypescriptrust

```
curl -X POST "https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}/regenerate-key"
  -H "Authorization: Bearer YOUR_API_KEY"
  -H "Content-Type: application/json"
```

#### Response Examples

Success Response

```
{
    "success": true,
    "api_key": "new_whatsapp_api_key_abc456"
}
```

[Previous

Check if a number is on WhatsApp](https://www.wasenderapi.com/api-docs/sessions/check-if-a-number-is-on-whatsapp)[Next

Send Presence Update](https://www.wasenderapi.com/api-docs/sessions/send-presence-update)

---

## Send Presence Update

**Source:** https://www.wasenderapi.com/api-docs/sessions/send-presence-update

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Send Presence Update

Sessions

POST`/api/send-presence-update`

Copy endpoint

Sends a presence update to a specific JID (e.g., 'typing...' or 'recording...') to indicate user activity. This requires an active session.

# Send Presence Update

Sends a presence update to a specific JID (e.g., `typing...` or `recording...`)
to indicate user activity. This requires an active session.

## Supported Types

* `composing` – Indicates the user is typing.
* `recording` – Indicates the user is recording a voice message.
* `available` – Marks the user as online/active.
* `unavailable` – Marks the user as offline/inactive.

## Rules

* When using `composing` or `recording`, the presence
  **must be sent to the contact’s JID** (the person you are chatting with).
* When using `available` or `unavailable`, the presence
  **must be sent with your own number as the JID**.

#### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| jid | string | Yes | WhatsApp JID of the recipient (e.g., `[[email protected]](/cdn-cgi/l/email-protection)`). |
| type | string | Yes | The presence state to send. Must be one of: composing, recording, available, or unavailable. |
| delayMs | integer | No | Optional duration in milliseconds to show the presence update. |

#### Code Examples

bashpythonjavascriptphprubyGoC#javaswiftpoweshelltypescriptrust

```
curl -X POST \
  "https://www.wasenderapi.com/api/send-presence-update" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "jid": "[email protected]",
    "type": "composing"
  }'
```

#### Response Examples

Success ResponseError Response - Invalid JID

```
{
  "success": true,
  "data": {
    "jid": "[email protected]",
    "type": "composing"
  }
}
```

[Previous

Regenerate API Key](https://www.wasenderapi.com/api-docs/sessions/regenerate-api-key)[Next

Decrypt Media File](https://www.wasenderapi.com/api-docs/messages/decrypt-media-file)

---

## Decrypt Media File

**Source:** https://www.wasenderapi.com/api-docs/messages/decrypt-media-file

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Decrypt Media File

Messages

POST`/api/decrypt-media`

Copy endpoint

This endpoint is used to decrypt media files sent in messages. You need to provide the encrypted media information, including the mediaKey and the url where the encrypted file is hosted. The API will then decrypt the file and store it temporarily, returning a publicUrl from which the decrypted file can be downloaded. This public URL will be active for one hour.

## Decrypt Media File

POST
`/api/decrypt-media`

This endpoint decrypts an encrypted media file (image, video, audio, document, or sticker). You provide the encrypted media information, and the API returns a temporary public URL to access the decrypted file. This URL is valid for one hour.

### Request Body

The request body must be a JSON object containing the message data. The structure is as follows:

```
{
  "data": {
    "messages": {
      "key": {
        "id": "YOUR_UNIQUE_MESSAGE_ID"
      },
      "message": {
        "imageMessage": {
          "url": "URL_OF_ENCRYPTED_IMAGE",
          "mimetype": "image/jpeg",
          "mediaKey": "YOUR_MEDIA_KEY",
          "fileSha256": "FILE_SHA256_HASH",
          "fileLength": "FILE_SIZE_IN_BYTES",
          "fileName": "example.jpg"
        }
      }
    }
  }
}
```

**Note:** The `message` object can contain `imageMessage`, `videoMessage`, `audioMessage`, `documentMessage`, or `stickerMessage`.

#### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| data | object | Yes | Note: The message object must contain imageMessage, videoMessage, audioMessage, documentMessage, or stickerMessage, depending on the type of media you are decrypting. |

#### Code Examples

bashpythonjavascriptphprubygocsharpjavaswiftpowershelltypescriptrust

```
curl -X POST "https://www.wasenderapi.com/api/decrypt-media" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "messages": {
        "key": {
          "id": "YOUR_UNIQUE_MESSAGE_ID"
        },
        "message": {
          "imageMessage": {
            "url": "URL_OF_ENCRYPTED_IMAGE",
            "mimetype": "image/jpeg",
            "mediaKey": "YOUR_MEDIA_KEY"
          }
        }
      }
    }
  }'
```

#### Response Examples

Success ResponseError Response

```
{
  "success": true,
  "publicUrl": "https://www.wasenderapi.com/api/decrypted-media/YOUR_UNIQUE_MESSAGE_ID"
}
```

[Previous

Send Presence Update](https://www.wasenderapi.com/api-docs/sessions/send-presence-update)[Next

Upload Media File](https://www.wasenderapi.com/api-docs/messages/upload-media-file)

---

## Upload Media File

**Source:** https://www.wasenderapi.com/api-docs/messages/upload-media-file

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Upload Media File

Messages

POST`/api/upload`

Copy endpoint

This documentation details how to use the media upload endpoint, which supports both raw binary and Base64-encoded file uploads.

## Upload Media File

POST
`/api/upload`

This endpoint uploads a media file (image, video, audio, sticker, or document) to the server. The file is validated, stored temporarily, and made accessible via a unique URL that is active for **24-hours**.

There are two methods for uploading a file:

1. **Raw Binary Upload:** Send the file directly as the request body. This is the most efficient method for file uploads from servers or modern web clients.
2. **JSON (Base64) Upload:** Send a JSON object containing the Base64-encoded file. This is useful for clients where file data is handled as a string.

### Request Method 1: Raw Binary Upload

When uploading a binary file, the `Content-Type` header is **mandatory** and must accurately reflect the file's MIME type (e.g., `image/jpeg`, `application/pdf`). The server uses this header for validation.

### Request Method 2: JSON (Base64) Upload

To upload via Base64, send a request with `Content-Type: application/json` and a body containing a `base64` string. The MIME type can be provided in two ways:

* **Recommended:** Provide the full Data URL scheme within the `base64` string. The API will automatically parse the MIME type.

```
{
"base64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgA..."
}
```

* **Alternate:** Provide the MIME type in a separate `mimetype` field. This will override any MIME type found in the Data URL.

```
{
"mimetype": "image/png",
"base64": "iVBORw0KGgoAAAANSUhEUgA..."
}
```

### Validation Rules

The API enforces the following size limits per file category:

* **Documents:** 100 MB
* **Images:** 16 MB
* **Videos:** 50 MB
* **Audio:** 16 MB
* **Stickers (webp):** 5 MB

Files are also validated by their "magic numbers" to ensure the file content matches its declared type, enhancing security.

#### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| base64 | string | No | The Base64-encoded file data. Can optionally include the Data URL prefix (e.g., data:image/png;base64,...). Required if using JSON upload method. |
| mimetype | string | No | The MIME type of the file (e.g., image/png). This is only needed for JSON uploads if the base64 string does not include the Data URL prefix. |
| Request Body | binary | No | The request body can either be the raw binary data of the file or a JSON object for Base64 uploads. |

#### Code Examples

bashpythonjavascriptphprubygocsharpjavaswiftpowershelltypescriptrust

```
# Raw Binary Upload (Recommended)
curl -X POST "https://wasenderapi.com/api/upload" \
  -H "Content-Type: image/jpeg" \
  --data-binary "@path/to/your/image.jpg"

# JSON (Base64) Upload
curl -X POST "https://wasenderapi.com/api/upload" \
  -H "Content-Type: application/json" \
  -d '{
    "base64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQE..."
  }'
```

#### Response Examples

Success ResponseError Response

```
{
  "success": true,
  "publicUrl": "https://wasenderapi.com/media/a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg"
}
```

[Previous

Decrypt Media File](https://www.wasenderapi.com/api-docs/messages/decrypt-media-file)[Next

Send Text Message](https://www.wasenderapi.com/api-docs/messages/send-text-message)

---

## Send Text Message

**Source:** https://www.wasenderapi.com/api-docs/messages/send-text-message

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Send Text Message

Messages

POST`/api/send-message`

Copy endpoint

Sends a plain text message to a recipient.

# Send Basic Text Messages

Use this endpoint to send basic text messages. You can specify a single recipient phone number (E.164 format) .

#### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| to | string | Yes | Recipient phone number in E.164 format or, Group JID, or Community Channel JID. |
| text | string | Yes | The text content of the message. Required if no media/contact/location is sent. |

#### Code Examples

bashpythonjavascriptphprubygocsharpjavaswiftpowershelltypescriptrust

```
curl -X POST "https://www.wasenderapi.com/api/send-message" 
  -H "Authorization: Bearer YOUR_API_KEY" 
  -H "Content-Type: application/json" 
  -d '{
    "to": "+1234567890",
    "text": "Hello, this is your requested update."
}'
```

#### Response Examples

Success Response

```
{
  "success": true,
  "data": {
    "msgId": 100000,
    "jid": "+123456789",
    "status": "in_progress"
  }
}
```

[Previous

Upload Media File](https://www.wasenderapi.com/api-docs/messages/upload-media-file)[Next

Send Image Message](https://www.wasenderapi.com/api-docs/messages/send-image-message)

---

## Send Image Message

**Source:** https://www.wasenderapi.com/api-docs/messages/send-image-message

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Send Image Message

Messages

POST`/api/send-message`

Copy endpoint

Sends a message with an image attached via a URL.

# Send Image Message

Send a message that includes an image. Provide the image via a publicly accessible URL in the `imageUrl` parameter. You can optionally include caption text in the `text` parameter.

Supported image formats: JPEG, PNG. Maximum file size: 5MB.

#### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| to | string | Yes | Recipient phone number in E.164 format or, Group JID. |
| text | string | No | The text content of the message. Required if no media/contact/location is sent. |
| imageUrl | string | Yes | URL of the image to send. |

#### Code Examples

bashpythonjavascriptphprubygocsharpjavaswiftpowershelltypescriptrust

```
curl -X POST "https://www.wasenderapi.com/api/send-message"
  -H "Authorization: Bearer YOUR_API_KEY"
  -H "Content-Type: application/json"
  -d '{
      "to": "+1234567890",
      "text": "Check out this image!",
      "imageUrl": "https://wasenderapi.com/logo.png"
  }'
```

#### Response Examples

Success Response

```
{
  "success": true,
  "data": {
    "msgId": 100000,
    "jid": "+123456789",
    "status": "in_progress"
  }
}
```

[Previous

Send Text Message](https://www.wasenderapi.com/api-docs/messages/send-text-message)[Next

Send Video Message](https://www.wasenderapi.com/api-docs/messages/send-video-message)

---

## Send Video Message

**Source:** https://www.wasenderapi.com/api-docs/messages/send-video-message

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Send Video Message

Messages

POST`/api/send-message`

Copy endpoint

Sends a message with a video attached via a URL.

# Send Video Message

Send a message that includes a video. Provide the video via a publicly accessible URL in the `videoUrl` parameter. You can optionally include caption text in the `text` parameter.

Supported video formats: MP4, 3GPP. Maximum file size: 50MB.

#### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| to | string | Yes | Recipient phone number in E.164 format or, Group JID. |
| text | string | No | The text content of the message. Required if no media/contact/location is sent. |
| videoUrl | string | Yes | URL of the video to send. |

#### Code Examples

bashpythonjavascriptphprubygocsharpjavaswiftpowershelltypescriptrust

```
curl -X POST "https://www.wasenderapi.com/api/send-message"
  -H "Authorization: Bearer YOUR_API_KEY"
  -H "Content-Type: application/json"
  -d '{
      "to": "+1234567890",
      "text": "Training video!",
      "videoUrl": "https://example.com/training-video.mp4"
  }'
```

#### Response Examples

Success Response

```
{
  "success": true,
  "data": {
    "msgId": 100000,
    "jid": "+123456789",
    "status": "in_progress"
  }
}
```

[Previous

Send Image Message](https://www.wasenderapi.com/api-docs/messages/send-image-message)[Next

Send Document Message](https://www.wasenderapi.com/api-docs/messages/send-document-message)

---

## Send Document Message

**Source:** https://www.wasenderapi.com/api-docs/messages/send-document-message

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Send Document Message

Messages

POST`/api/send-message`

Copy endpoint

Sends a message with a document attached via a URL.

# Send Document Message

Send a message with a document attached. Provide the document via a publicly accessible URL in the `documentUrl` parameter. You can optionally include caption text in the `text` parameter and specify a `filename`.

Most common document types are supported (PDF, DOCX, XLSX, etc.). Maximum file size: 100MB.

#### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| to | string | Yes | Recipient phone number in E.164 format or, Group JID. |
| text | string | No | The text content of the message. Required if no media/contact/location is sent. |
| documentUrl | string | Yes | URL of the document to send. |
| fileName | string | No | The file name of the document. If not provided, document.{extension} will be used. |

#### Code Examples

bashpythonjavascriptphprubygocsharpjavaswiftpowershelltypescriptrust

```
curl -X POST "https://www.wasenderapi.com/api/send-message"
  -H "Authorization: Bearer YOUR_API_KEY"
  -H "Content-Type: application/json"
  -d '{
      "to": "+1234567890",
      "text": "Quarterly report",
      "documentUrl": "https://example.com/report.pdf",
      "fileName:"report-02-2025.pdf"
  }'
```

#### Response Examples

Success Response

```
{
  "success": true,
  "data": {
    "msgId": 100000,
    "jid": "+123456789",
    "status": "in_progress"
  }
}
```

[Previous

Send Video Message](https://www.wasenderapi.com/api-docs/messages/send-video-message)[Next

Send Audio Message](https://www.wasenderapi.com/api-docs/messages/send-audio-message)

---

## Send Audio Message

**Source:** https://www.wasenderapi.com/api-docs/messages/send-audio-message

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Send Audio Message

Messages

POST`/api/send-message`

Copy endpoint

Sends a message with an audio file attached via a URL.

# Send Audio Message

Send a message with an audio file attached. Provide the audio file via a publicly accessible URL in the `audioUrl` parameter.

Supported audio formats: AAC, MP3, OGG, AMR. Maximum file size: 16MB.

#### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| to | string | Yes | Recipient phone number in E.164 format or, Group JID. |
| text | string | No | The text content of the message. Required if no media/contact/location is sent. |
| audioUrl | string | Yes | URL of the audio file to send (sent as voice note). |

#### Code Examples

bashpythonjavascriptphprubygocsharpjavaswiftpowershelltypescriptrust

```
curl -X POST "https://www.wasenderapi.com/api/send-message"
  -H "Authorization: Bearer YOUR_API_KEY"
  -H "Content-Type: application/json"
  -d '{
      "to": "+1234567890",
      "audioUrl": "https://example.com/announcement.mp3"
  }'
```

#### Response Examples

Success Response

```
{
  "success": true,
  "data": {
    "msgId": 100000,
    "jid": "+123456789",
    "status": "in_progress"
  }
}
```

[Previous

Send Document Message](https://www.wasenderapi.com/api-docs/messages/send-document-message)[Next

Send Sticker Message](https://www.wasenderapi.com/api-docs/messages/send-sticker-message)

---

## Send Sticker Message

**Source:** https://www.wasenderapi.com/api-docs/messages/send-sticker-message

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Send Sticker Message

Messages

POST`/api/send-message`

Copy endpoint

Sends a message with a sticker attached via a URL (supports .webp format).

# Send Sticker Message

Send a message with a sticker attached. Provide the sticker file (must be .webp format) via a publicly accessible URL in the `stickerUrl` parameter.

Only the WEBP format is supported for stickers. Maximum file size: 100KB.

#### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| to | string | Yes | Recipient phone number in E.164 format or, Group JID. |
| text | string | No | The text content of the message. Required if no media/contact/location is sent. |
| stickerUrl | string | Yes | URL of the sticker (.webp) to send. |

#### Code Examples

bashpythonjavascriptphprubygocsharpjavaswiftpowershelltypescriptrust

```
curl -X POST "https://www.wasenderapi.com/api/send-message"
  -H "Authorization: Bearer YOUR_API_KEY"
  -H "Content-Type: application/json"
  -d '{
      "to": "+1234567890",
      "stickerUrl": "https://example.com/sticker.webp"
  }'
```

#### Response Examples

Success Response

```
{
  "success": true,
  "data": {
    "msgId": 100000,
    "jid": "+123456789",
    "status": "in_progress"
  }
}
```

[Previous

Send Audio Message](https://www.wasenderapi.com/api-docs/messages/send-audio-message)[Next

Send Contact Card](https://www.wasenderapi.com/api-docs/messages/send-contact-card)

---

## Send Contact Card

**Source:** https://www.wasenderapi.com/api-docs/messages/send-contact-card

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Send Contact Card

Messages

POST`/api/send-message`

Copy endpoint

Sends a message containing a contact card.

# Send Contact Card

Send a message containing a contact card (vCard). Provide the contact details within the `contact` object parameter.

#### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| to | string | Yes | Recipient phone number in E.164 format or, Group JID. |
| contact | object | Yes | Contact card object. |

#### Code Examples

bashpythonjavascriptphprubygocsharpjavaswiftpowershelltypescriptrust

```
curl -X POST "https://www.wasenderapi.com/api/send-message"
  -H "Authorization: Bearer YOUR_API_KEY"
  -H "Content-Type: application/json"
  -d '{
      "to": "+1234567890",
      "contact": {
          "name": "Support Team",
          "phone": "+1234567890"
      }
  }'
```

#### Response Examples

Success Response

```
{
  "success": true,
  "data": {
    "msgId": 100000,
    "jid": "+123456789",
    "status": "in_progress"
  }
}
```

[Previous

Send Sticker Message](https://www.wasenderapi.com/api-docs/messages/send-sticker-message)[Next

Resend Failed Message](https://www.wasenderapi.com/api-docs/messages/resend-failed-message)

---

## Resend Failed Message

**Source:** https://www.wasenderapi.com/api-docs/messages/resend-failed-message

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Resend Failed Message

Messages

POST`/api/messages/{message}/resend`

Copy endpoint

Initiates the resending of a previously failed message from the logs.

# Resend Failed Message

This endpoint allows you to attempt to resend a message from your logs that has previously failed. The message must have a status of "failed" for this operation to be permitted.

**Important:** Message logging must be enabled for your session to use this feature, as the endpoint relies on the stored message content to perform the resend. The API key you use must belong to the same session that originally sent the message.

Upon a successful request, the message status is updated to "in\_progress" and it is re-queued for sending. The success response indicates that the resend has been initiated, not that it has been delivered.

#### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| message | integer | Yes | The unique ID of the failed message log to be resent. |

#### Code Examples

bashpythonjavascriptphprubygocsharpjavaswiftpowershelltypescriptrust

```
curl -X POST "https://www.wasenderapi.com/api/messages/failed-msg-id-123/resend" 
  -H "Authorization: Bearer YOUR_API_KEY"
```

#### Response Examples

Success ResponseError Response (Not Failed)Error Response (Unauthorized)

```
{
    "success": true,
    "message": "Message resend initiated successfully."
}
```

[Previous

Send Contact Card](https://www.wasenderapi.com/api-docs/messages/send-contact-card)[Next

Send Location](https://www.wasenderapi.com/api-docs/messages/send-location)

---

## Send Location

**Source:** https://www.wasenderapi.com/api-docs/messages/send-location

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Send Location

Messages

POST`/api/send-message`

Copy endpoint

Sends a message containing a location pin.

# Send Location

Send a message containing a location pin. Provide the latitude and longitude within the `location` object parameter. You can optionally include a `name` and `address` for the location.

#### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| to | string | Yes | Recipient phone number in E.164 format or, Group JID. |
| text | string | No | The text content of the message. Required if no media/contact/location is sent. |
| location | object | Yes | Location object. |

#### Code Examples

bashpythonjavascriptphprubygocsharpjavaswiftpowershelltypescriptrust

```
curl -X POST "https://www.wasenderapi.com/api/send-message"
  -H "Authorization: Bearer YOUR_API_KEY"
  -H "Content-Type: application/json"
  -d '{
      "to": "+1234567890",
      "text": "Our office location",
      "location": {
          "latitude": 37.7749,
          "longitude": -122.4194,
          "name": "Company HQ",
          "address": "123 Business St, San Francisco, CA 94105"
      }
  }'
```

#### Response Examples

Success Response

```
{
  "success": true,
  "data": {
    "msgId": 100000,
    "jid": "+123456789",
    "status": "in_progress"
  }
}
```

[Previous

Resend Failed Message](https://www.wasenderapi.com/api-docs/messages/resend-failed-message)[Next

Send Quoted Message](https://www.wasenderapi.com/api-docs/messages/send-quoted-message)

---

## Send Quoted Message

**Source:** https://www.wasenderapi.com/api-docs/messages/send-quoted-message

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Send Quoted Message

Messages

POST`/api/send-message`

Copy endpoint

Sends a message that quotes or replies to a previous message. This is useful for creating conversational context.

# Send Quoted Messages

Use this endpoint to send a message in reply to a previously sent message. To do this, you must provide the `replyTo` parameter with the `msgId` of the message you wish to quote. The `msgId` is returned in the success response of any message sending request. You can quote any type of message (text, image, etc.) by including the `replyTo` parameter alongside the content of your new message.

#### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| to | string | Yes | Recipient phone number in E.164 format or, Group JID, or Community Channel JID. |
| text | string | No | The text content of the message. Required if no media/contact/location is sent. |
| replyTo | integer | No | The msgId of the message to reply to. The msgId is returned in the success response of any message sending request. |
| imageUrl | string | No | URL of the image to send. |
| videoUrl | string | No | URL of the video to send. |
| documentUrl | string | No | URL of the document to send. |
| audioUrl | string | No | URL of the audio file to send (sent as voice note). |
| stickerUrl | string | No | URL of the sticker (.webp) to send. |
| contact | object | No | Contact card object. |
| location | object | No | Location object. |

#### Code Examples

bashpythonjavascriptphprubygocsharpjavaswiftpowershelltypescriptrust

```
curl -X POST "https://www.wasenderapi.com/api/send-message" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+1234567890",
    "text": "This is a reply to the previous message.",
    "replyTo": 12345
  }'
```

#### Response Examples

Success Response

```
{
  "success": true,
  "data": {
    "msgId": 100000,
    "jid": "+123456789",
    "status": "in_progress"
  }
}
```

[Previous

Send Location](https://www.wasenderapi.com/api-docs/messages/send-location)[Next

Send Poll Message](https://www.wasenderapi.com/api-docs/messages/send-poll-message)

---

## Send Poll Message

**Source:** https://www.wasenderapi.com/api-docs/messages/send-poll-message

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Send Poll Message

Messages

POST`/api/send-message`

Copy endpoint

Sends a message containing a poll with multi select support.

# Send Poll Message

Send a message that lets recipients vote on a question. Put the poll’s
question and answer options inside the `poll` object, and (if
needed) set `multiSelect` to allow voters to pick more than one
option.

#### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| to | string | Yes | Recipient phone number in E.164 format or, Group JID. |
| poll | object | Yes | Poll object. |
| pool.multiSelect | boolean | No | Allow multiple options to be selected by the user (default false) |
| pool.question | string | Yes | The question you want to ask in the poll |
| pool.options | string[] | Yes | Array of answer options for the poll (min:2 - max:12) |

#### Code Examples

bashpythonjavascriptphprubygocsharpjavaswiftpowershelltypescriptrust

```
curl -X POST "https://www.wasenderapi.com/api/send-message" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
      "to": "+1234567890",
      "poll": {
          "question": "What is your favorite color?",
          "options": [
              "Blue",
              "Green",
              "Red",
              "Yellow"
          ],
          "multiSelect": false
      }
  }'
```

#### Response Examples

Success Response

```
{
  "success": true,
  "data": {
    "msgId": 100000,
    "jid": "+123456789",
    "status": "in_progress"
  }
}
```

[Previous

Send Quoted Message](https://www.wasenderapi.com/api-docs/messages/send-quoted-message)[Next

Edit a Message](https://www.wasenderapi.com/api-docs/messages/edit-a-message)

---

## Edit a Message

**Source:** https://www.wasenderapi.com/api-docs/messages/edit-a-message

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Edit a Message

Messages

PUT`/api/messages/{msgId}`

Copy endpoint

Edits the text content of a previously sent message. Note: This is usually only possible for a short period after the message was sent.

# Edit a Message

Edits the text content of a previously sent message. Note: This is usually only possible for a short period after the message was sent.

#### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| msgId | integer | Yes | The ID of the message to retrieve information for its returned from send-message endpoints. |
| text | string | Yes | The new text content for the message. |

#### Code Examples

bashpythonjavascriptphprubygocsharpjavaswiftpowershelltypescriptrust

```
curl -X PUT "https://www.wasenderapi.com/api/messages/{msgId}"
  -H "Authorization: Bearer YOUR_API_KEY"
  -H "Content-Type: application/json"
  -d '{
      "text": "This is the new message content",
  }'
```

#### Response Examples

Success Response

```
{
    "success": true,
    "data": {
        "remoteJid": "[email protected]",
        "id": "EN82FV0387IVR54JTE2R1",
        "msgId": 100000,
        "key": {
            "id": "EN82FV0387IVR54JTE2R1",
            "fromMe": true,
            "remoteJid": "[email protected]"
        },
      "message": {
            "protocolMessage": {
                "key": {
                    "id": "EN82FV0387IVR54JTE2R1",
                    "fromMe": true,
                    "remoteJid": "[email protected]"
                },
                "type": 14,
                "timestampMs": 1751302295563,
                "editedMessage": {
                    "extendedTextMessage": {
                        "text": "updated"
                    }
                }
            }
        "messageTimestamp": "1751297488",
        "status": 1
    }
}
```

[Previous

Send Poll Message](https://www.wasenderapi.com/api-docs/messages/send-poll-message)[Next

Get Message Info](https://www.wasenderapi.com/api-docs/messages/get-message-info)

---

## Get Message Info

**Source:** https://www.wasenderapi.com/api-docs/messages/get-message-info

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Get Message Info

Messages

GET`/api/messages/{msgId}/info`

Copy endpoint

Retrieves detailed information about a specific message, such as its content, sender, receiver, status and timestamps.

# Get Message Info

Retrieves detailed information about a specific message, such as its content, sender, receiver, status and timestamps.

## Status Codes

| Status Code | Description | Explanation |
| --- | --- | --- |
| 0 | ERROR | The message failed to send due to an error. |
| 1 | PENDING | The message is queued and waiting to be sent. |
| 2 | SENT | The message has been sent from the server but not yet delivered. |
| 3 | DELIVERED | The message has reached the recipient’s device. |
| 4 | READ | The recipient has opened and read the message. |
| 5 | PLAYED | The recipient has played the media message (e.g., audio or video). |

#### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| msgId | integer | Yes | The ID of the message to retrieve information for its returned from send-message endpoints. |

#### Code Examples

bashpythonjavascriptphprubygocsharpjavaswiftpowershelltypescriptrust

```
curl "https://www.wasenderapi.com/api/messages/{msgId}/info"
  -H "Authorization: Bearer YOUR_API_KEY"
```

#### Response Examples

Success Response

```
{
    "success": true,
    "data": {
        "remoteJid": "[email protected]",
        "id": "EN82FV0387IVR54JTE2R1",
        "msgId": 100000,
        "key": {
            "id": "EN82FV0387IVR54JTE2R1",
            "fromMe": true,
            "remoteJid": "[email protected]"
        },
        "message": {
            "extendedTextMessage": {
                "text": "quoted",
                "contextInfo": {
                    "stanzaId": "SNE5U4M5OSPWHXHN1WBGV",
                    "participant": "[email protected]",
                    "quotedMessage": {
                        "extendedTextMessage": {
                            "text": "quoted"
                        }
                    }
                }
            }
        },
        "messageTimestamp": "1751297488",
        "status": 2
    }
}
```

[Previous

Edit a Message](https://www.wasenderapi.com/api-docs/messages/edit-a-message)[Next

Delete a Message](https://www.wasenderapi.com/api-docs/messages/delete-a-message)

---

## Delete a Message

**Source:** https://www.wasenderapi.com/api-docs/messages/delete-a-message

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Delete a Message

Messages

DELETE`/api/messages/{msgId}`

Copy endpoint

Deletes a specific message for everyone. Note: This is usually only possible for a short period after the message was sent.

# Delete a Message

Deletes a specific message for everyone. Note: This is usually only possible for a short period after the message was sent.

#### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| msgId | integer | Yes | The ID of the message to retrieve information for its returned from send-message endpoints. |

#### Code Examples

bashpythonjavascriptphprubygocsharpjavaswiftpowershelltypescriptrust

```
curl -X DELETE "https://www.wasenderapi.com/api/messages/{msgId}"
  -H "Authorization: Bearer YOUR_API_KEY"
  -H "Content-Type: application/json"
```

#### Response Examples

Success Response

```
{
    "success": true,
    "message": "Message deleted successfully."

}
```

[Previous

Get Message Info](https://www.wasenderapi.com/api-docs/messages/get-message-info)[Next

Mark Message as Read](https://www.wasenderapi.com/api-docs/messages/mark-message-as-read)

---

## Mark Message as ReadNew

**Source:** https://www.wasenderapi.com/api-docs/messages/mark-message-as-read

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Mark Message as Read

Messages

POST`/api/messages/read`

Copy endpoint

Marks a specific received WhatsApp message as read (blue ticks).

# Mark Message as Read

This endpoint allows you to programmatically mark a message as read, which will trigger the "blue ticks" on the sender's device.

To mark a message as read, you must pass the exact `key` object associated with the message. You typically receive this `key` object in incoming message webhooks (e.g., `messages.received`).

The `key` object must contain three properties: `id`, `remoteJid`, and `fromMe`.

#### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| key | object | Yes | The exact message key object representing the message you want to mark as read. |
| key.id | string | Yes | The unique message ID (e.g., 3EB06A5E244031B4A5D1). |
| key.remoteJid | string | Yes | The JID of the chat where the message was sent (e.g., [[email protected]](/cdn-cgi/l/email-protection)). |
| key.fromMe | boolean | Yes | Indicates if the message was sent by you (`true`) or received (`false`). Usually `false` when marking incoming messages as read. |

#### Code Examples

bashpythonjavascriptphprubygocsharpjavaswiftpowershelltypescriptrust

```
curl -X POST "https://www.wasenderapi.com/api/messages/read" 
  -H "Authorization: Bearer YOUR_API_KEY" 
  -H "Content-Type: application/json" 
  -d '{
    "key": {
        "id": "3EB06A5E244031B4A5D1",
        "remoteJid": "[email protected]",
        "fromMe": false
    }
}'
```

#### Response Examples

Success ResponseError Response (Validation)

```
{
    "success": true,
    "data": {
        "status": "read"
    }
}
```

[Previous

Delete a Message](https://www.wasenderapi.com/api-docs/messages/delete-a-message)[Next

Send View Once Message](https://www.wasenderapi.com/api-docs/messages/send-view-once-message)

---

## Send View Once Message

**Source:** https://www.wasenderapi.com/api-docs/messages/send-view-once-message

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Send View Once Message

Messages

POST`/api/send-message`

Copy endpoint

Sends an image, video, or audio message that can only be viewed a single time.

# Send View Once Media

This feature allows you to send media (an image, video, or audio file) that will disappear from the chat after the recipient has opened it once. It uses the same `/api/send-message` endpoint as other message types.

To enable this functionality, you must include the `viewOnce: true` parameter in your request body, along with the media url (`imageUrl`, `videoUrl`, or `audioUrl`).

The recipient will see a placeholder indicating a "View Once" message and will not be able to save, forward, or screenshot the media (on most devices).

#### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| to | string | Yes | Recipient's JID (e.g., [[email protected]](/cdn-cgi/l/email-protection) or [[email protected]](/cdn-cgi/l/email-protection)). |
| viewOnce | boolean | Yes | Must be set to `true` to send the media as a view-once message. |
| imageUrl | string | No | The direct URL of the image to be sent. Required if `videoUrl` or `audioUrl` are not provided. |
| videoUrl | string | No | The direct URL of the video to be sent. Required if `imageUrl` or `audioUrl` are not provided. |
| audioUrl | string | No | The direct URL of the audio to be sent. Required if `imageUrl` or `videoUrl` are not provided. |

#### Code Examples

bashpythonjavascriptphprubygocsharpjavaswiftpowershelltypescriptrust

```
curl -X POST "https://www.wasenderapi.com/api/send-message" 
  -H "Authorization: Bearer YOUR_API_KEY" 
  -H "Content-Type: application/json" 
  -d '{
    "to": "[email protected]",
    "imageUrl":"https://example.com/image.jpg",
    "viewOnce": true
}'
```

#### Response Examples

Success Response

```
{
    "success": true,
    "data": {
        "msgId": 100002,
        "jid": "[email protected]",
        "status": "in_progress"
    }
}
```

[Previous

Mark Message as Read](https://www.wasenderapi.com/api-docs/messages/mark-message-as-read)[Next

Get All Contacts](https://www.wasenderapi.com/api-docs/contacts/get-all-contacts)

---

## Get All Contacts

**Source:** https://www.wasenderapi.com/api-docs/contacts/get-all-contacts

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Get All Contacts

Contacts

GET`/api/contacts`

Copy endpoint

Retrieves a list of all contacts synced with the WhatsApp session.

# Get All Contacts

Retrieves a list of all contacts synced with the WhatsApp session.

## Query Parameters

* **paginated** (boolean, optional) — When `true`, returns `data.items` and `data.pagination`. Default: `false`.
* **page** (integer, optional) — Page number (only used when `paginated=true`). Default: `1`.
* **limit** (integer, optional) — Items per page (only used when `paginated=true`). Default: `20`.

#### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| paginated | boolean | No | When true, returns a paginated response with data.items and data.pagination. When false, returns a simple array of contacts in data. |
| page | integer | No | Page number (only used when paginated=true). |
| limit | integer | No | Items per page (only used when paginated=true). |

#### Code Examples

bashpythonjavascriptphprubygocsharpjavaswiftpowershelltypescriptrust

```
curl "https://www.wasenderapi.com/api/contacts?paginated=true&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

#### Response Examples

Success Response (non-paginated)Success Response (paginated=true)

```
{
  "success": true,
  "data": [
    {
      "jid": "1234567890",
      "name": "Contact Name",
      "notify": "Contact Display Name",
      "verifiedName": "Verified Business Name",
      "imgUrl": "https:\/\/profile.pic.url\/image.jpg",
      "status": "Hey there! I am using WhatsApp."
    }
  ]
}
```

[Previous

Send View Once Message](https://www.wasenderapi.com/api-docs/messages/send-view-once-message)[Next

Get Contact Info](https://www.wasenderapi.com/api-docs/contacts/get-contact-info)

---

## Get Contact Info

**Source:** https://www.wasenderapi.com/api-docs/contacts/get-contact-info

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Get Contact Info

Contacts

GET`/api/contacts/{contactPhoneNumber}`

Copy endpoint

Retrieves detailed information for a specific contact.

# Get Contact Info

Retrieves detailed information for a specific contact.

#### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| contactPhoneNumber | string | Yes | The JID (Jabber ID) of the contact in E.164 format (international phone number) e.g., 1234567890. |

#### Code Examples

bashpythonjavascriptphprubygocsharpjavaswiftpowershelltypescriptrust

```
curl "https://www.wasenderapi.com/api/contacts/{contactPhoneNumber}"
  -H "Authorization: Bearer YOUR_API_KEY"
```

#### Response Examples

Success Response

```
{
  "success": true,
  "data": {
    "id": "[email protected]",
    "name": "Contact Name",
    "notify": "Notification Name",
    "verifiedName": null,
    "imgUrl": null,
    "status": null
  }
}
```

[Previous

Get All Contacts](https://www.wasenderapi.com/api-docs/contacts/get-all-contacts)[Next

Get Contact Profile Picture](https://www.wasenderapi.com/api-docs/contacts/get-contact-profile-picture)

---

## Get Contact Profile Picture

**Source:** https://www.wasenderapi.com/api-docs/contacts/get-contact-profile-picture

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Get Contact Profile Picture

Contacts

GET`/api/contacts/{contactPhoneNumber}/picture`

Copy endpoint

Retrieves the URL of the profile picture for a specific contact.

# Get Contact Profile Picture

Retrieves the URL of the profile picture for a specific contact.

#### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| contactPhoneNumber | string | Yes | The JID (Jabber ID) of the contact in E.164 format (international phone number) e.g., 1234567890. |

#### Code Examples

bashpythonjavascriptphprubygocsharpjavaswiftpowershelltypescriptrust

```
curl "https://www.wasenderapi.com/api/contacts/{contactPhoneNumber}/picture"
  -H "Authorization: Bearer YOUR_API_KEY"
```

#### Response Examples

Success Response

```
{
    "success": true,
    "data": {
        "imgUrl": "https:\/\/profile.pic.url\/image.jpg"
    }
}
```

[Previous

Get Contact Info](https://www.wasenderapi.com/api-docs/contacts/get-contact-info)[Next

Block Contact](https://www.wasenderapi.com/api-docs/contacts/block-contact)

---

## Block Contact

**Source:** https://www.wasenderapi.com/api-docs/contacts/block-contact

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Block Contact

Contacts

POST`/api/contacts/{contactPhoneNumber}/block`

Copy endpoint

Blocks a specific contact.

# Block Contact

Blocks a specific contact.

#### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| contactPhoneNumber | string | Yes | The JID (Jabber ID) of the contact in E.164 format (international phone number) e.g., 1234567890. |

#### Code Examples

bashpythonjavascriptphprubygocsharpjavaswiftpowershelltypescriptrust

```
curl -X POST "https://www.wasenderapi.com/api/contacts/{contactPhoneNumber}/block"
  -H "Authorization: Bearer YOUR_API_KEY"
  -H "Content-Type: application/json"
```

#### Response Examples

Success Response

```
{
    "success": true,
    "data": {
        "message": "Contact blocked"
    }
}
```

[Previous

Get Contact Profile Picture](https://www.wasenderapi.com/api-docs/contacts/get-contact-profile-picture)[Next

Unblock Contact](https://www.wasenderapi.com/api-docs/contacts/unblock-contact)

---

## Unblock Contact

**Source:** https://www.wasenderapi.com/api-docs/contacts/unblock-contact

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Unblock Contact

Contacts

POST`/api/contacts/{contactPhoneNumber}/unblock`

Copy endpoint

Unblocks a specific contact.

# Unblock Contact

Unblocks a specific contact.

#### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| contactPhoneNumber | string | Yes | The JID (Jabber ID) of the contact in E.164 format (international phone number) e.g., 1234567890. |

#### Code Examples

bashpythonjavascriptphprubygocsharpjavaswiftpowershelltypescriptrust

```
curl -X POST "https://www.wasenderapi.com/api/contacts/{contactPhoneNumber}/unblock"
  -H "Authorization: Bearer YOUR_API_KEY"
  -H "Content-Type: application/json"
```

#### Response Examples

Success Response

```
{
    "success": true,
    "data": {
        "message": "Contact unblocked"
    }
}
```

[Previous

Block Contact](https://www.wasenderapi.com/api-docs/contacts/block-contact)[Next

Create or Update Contact](https://www.wasenderapi.com/api-docs/contacts/create-or-update-contact)

---

## Create or Update Contact

**Source:** https://www.wasenderapi.com/api-docs/contacts/create-or-update-contact

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Create or Update Contact

Contacts

PUT`/api/contacts`

Copy endpoint

Creates or updates a contact in the session's address book.

# Create or Update Contact

This endpoint allows you to manage contacts associated with the WhatsApp session. If you provide a `jid` that does not exist in the session's contacts, a new contact will be created with the provided `fullName`. If the `jid` already exists, its name will be updated.

The optional `saveOnPrimaryAddressbook` parameter can be used to sync the contact to the primary address book of the device running WhatsApp, though this behavior may vary by platform.

#### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| jid | string | Yes | The JID of the contact to create or update (e.g., [[email protected]](/cdn-cgi/l/email-protection)). |
| fullName | string | No | The full name to assign to the contact. |
| saveOnPrimaryAddressbook | boolean | No | If set to true, it attempts to save the contact on the device's primary address book. Defaults to false. |

#### Code Examples

bashpythonjavascriptphprubygocsharpjavaswiftpowershelltypescriptrust

```
curl -X PUT "https://www.wasenderapi.com/api/contacts" 
  -H "Authorization: Bearer YOUR_API_KEY" 
  -H "Content-Type: application/json" 
  -d '{
    "jid": "[email protected]",
    "fullName": "John Doe",
    "saveOnPrimaryAddressbook": true
}'
```

#### Response Examples

Success ResponseError Response (Validation)

```
{
    "success": true,
    "data": {
        "jid": "[email protected]",
        "fullName": "John Doe"
    }
}
```

[Previous

Unblock Contact](https://www.wasenderapi.com/api-docs/contacts/unblock-contact)[Next

Get LID from Phone Number](https://www.wasenderapi.com/api-docs/contacts/get-lid-from-phone-number)

---

## Get LID from Phone Number

**Source:** https://www.wasenderapi.com/api-docs/contacts/get-lid-from-phone-number

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Get LID from Phone Number

Contacts

GET`/api/lid-from-pn/{pn}`

Copy endpoint

Retrieves the Link ID (LID) associated with a real phone number (PN).

# Get LID from Phone Number

This endpoint performs the reverse operation of the previous one. Given a user's full phone number JID (ending in `@s.whatsapp.net`), it retrieves their corresponding Link ID (LID).

#### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| pn | string | Yes | The phone number JID of the user, which must end with @s.whatsapp.net. |

#### Code Examples

bashpythonjavascriptphprubygocsharpjavaswiftpowershelltypescriptrust

```
curl -X GET "https://www.wasenderapi.com/api/lid-from-pn/[email protected]" 
  -H "Authorization: Bearer YOUR_API_KEY"
```

#### Response Examples

Success ResponseError Response

```
{
    "success": true,
    "data": {
        "lid": "1234567890@lid"
    }
}
```

[Previous

Create or Update Contact](https://www.wasenderapi.com/api-docs/contacts/create-or-update-contact)[Next

Get Phone Number from LID](https://www.wasenderapi.com/api-docs/contacts/get-phone-number-from-lid)

---

## Get Phone Number from LID

**Source:** https://www.wasenderapi.com/api-docs/contacts/get-phone-number-from-lid

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Get Phone Number from LID

Contacts

GET`/api/pn-from-lid/{lid}`

Copy endpoint

Retrieves the real phone number (PN) associated with a Link ID (LID).

# Get Phone Number from LID

WhatsApp uses a privacy feature called Link ID (LID) which can sometimes mask a user's real phone number. This endpoint allows you to resolve a LID back to its corresponding full phone number JID (ending in `@s.whatsapp.net`).

This is useful when you have a LID from an interaction (like a group message) and need to identify the user by their actual phone number.

#### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| lid | string | Yes | The Link ID (LID) of the user, which must end with @lid. |

#### Code Examples

bashpythonjavascriptphprubygocsharpjavaswiftpowershelltypescriptrust

```
curl -X GET "https://www.wasenderapi.com/api/pn-from-lid/1234567890@lid" 
  -H "Authorization: Bearer YOUR_API_KEY"
```

#### Response Examples

Success ResponseError Response

```
{
    "success": true,
    "data": {
        "pn": "[email protected]"
    }
}
```

[Previous

Get LID from Phone Number](https://www.wasenderapi.com/api-docs/contacts/get-lid-from-phone-number)[Next

Create a New Group](https://www.wasenderapi.com/api-docs/groups/create-a-new-group)

---

## Create a New Group

**Source:** https://www.wasenderapi.com/api-docs/groups/create-a-new-group

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Create a New Group

Groups

POST`/api/groups`

Copy endpoint

Creates a new WhatsApp group with a given name and a list of participants.

# Create a new group

Creates a new WhatsApp group with a given name and a list of participants.

#### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| name | string | Yes | The name of the group to be created. |
| participants | string[] | No | An array of participant JIDs to add to the group. |

#### Code Examples

bashpythonjavascriptphprubygocsharpjavaswiftpowershelltypescriptrust

```
curl -X POST "https://www.wasenderapi.com/api/groups" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "My New Group", "participants": ["[email protected]", "[email protected]"]}'
```

#### Response Examples

Success Response

```
[
  {
    "title": "Success Response",
    "code": {
      "success": true,
      "data": {
        "id": "[email protected]",
        "owner": "[email protected]",
        "subject": "My New Group",
        "creation": 1678886400,
        "participants": [
          {
            "id": "[email protected]",
            "admin": "superadmin"
          },
          {
            "id": "[email protected]",
            "admin": null
          },
          {
            "id": "[email protected]",
            "admin": null
          }
        ]
      }
    }
  }
]
```

[Previous

Get Phone Number from LID](https://www.wasenderapi.com/api-docs/contacts/get-phone-number-from-lid)[Next

Get All Groups](https://www.wasenderapi.com/api-docs/groups/get-all-groups)

---

## Get All Groups

**Source:** https://www.wasenderapi.com/api-docs/groups/get-all-groups

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Get All Groups

Groups

GET`/api/groups`

Copy endpoint

Retrieves a list of all WhatsApp groups the connected account is a member of.

# Get All Groups

Retrieve a list of all WhatsApp groups that the connected WhatsApp account is currently a part of.

#### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| paginated | boolean | No | When true, returns {data: {items, pagination}}. When false, returns {data: [...]}. |
| page | integer | No | Page number (only used when paginated=true). |
| limit | integer | No | Items per page (only used when paginated=true). |

#### Code Examples

bashpythonjavascriptphprubygocsharpjavaswiftpowershelltypescriptrust

```
curl "https://www.wasenderapi.com/api/groups"
  -H "Authorization: Bearer YOUR_API_KEY"
```

#### Response Examples

Groups Success Response (non-paginated)Groups Success Response (paginated=true)

```
{
  "success": true,
  "data": [
    {
      "jid": "[email protected]",
      "name": "Group Name",
      "imgUrl": null
    }
  ]
}
```

[Previous

Create a New Group](https://www.wasenderapi.com/api-docs/groups/create-a-new-group)[Next

Get Group Metadata](https://www.wasenderapi.com/api-docs/groups/get-group-metadata)

---

## Get Group Metadata

**Source:** https://www.wasenderapi.com/api-docs/groups/get-group-metadata

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Get Group Metadata

Groups

GET`/api/groups/{groupJid}/metadata`

Copy endpoint

Retrieves metadata for a specific group (e.g., subject, description, creation date, owner).

# Get Group Metadata

Retrieves metadata for a specific group (e.g., subject, description, creation date, owner).

#### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| groupJid | string | Yes | The JID (Jabber ID) of the group in the format [[email protected]](/cdn-cgi/l/email-protection). |

#### Code Examples

bashpythonjavascriptphprubygocsharpjavaswiftpowershelltypescriptrust

```
curl "https://www.wasenderapi.com/api/groups/{groupJid}/metadata"
  -H "Authorization: Bearer YOUR_API_KEY"
```

#### Response Examples

Success Response

```
{
    "success": true,
    "data": {
        "jid": "[email protected]",
        "subject": "Group Subject",
        "creation": 1678886400,
        "owner": "owner_id",
        "desc": "Group Description",
        "participants": [
            {
                "jid": "123456789",
                "isAdmin": true,
                "isSuperAdmin": false
            },
            {
                "jid": "participant2",
                "isAdmin": false,
                "isSuperAdmin": false
            }
        ]
    }
}
```

[Previous

Get All Groups](https://www.wasenderapi.com/api-docs/groups/get-all-groups)[Next

Send Group Message](https://www.wasenderapi.com/api-docs/groups/send-group-message)

---

## Send Group Message

**Source:** https://www.wasenderapi.com/api-docs/groups/send-group-message

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Send Group Message

Groups

POST`/api/send-message`

Copy endpoint

Sends a message to a specific WhatsApp group using its Group ID.

# Send Group Message

Send a message directly to a WhatsApp group using its unique Group ID (e.g., `[email protected]`). Use the `/api/groups` endpoint to find the IDs of the groups you are in.

The parameters are the same as sending a regular message, but the `to` field must contain the Group ID.

#### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| to | string | Yes | Group ID (e.g., '[[email protected]](/cdn-cgi/l/email-protection)'). |
| text | string | Yes | The text content of the message. Required if no media/contact/location is sent. |
| imageUrl | string | No | URL of the image to send. |
| videoUrl | string | No | URL of the video to send. |
| documentUrl | string | No | URL of the document to send. |
| audioUrl | string | No | URL of the audio file to send (sent as voice note). |
| stickerUrl | string | No | URL of the sticker (.webp) to send. |
| contact | object | No | Contact card object. |
| location | object | No | Location object. |

#### Code Examples

bashpythonjavascriptphprubygocsharpjavaswiftpowershelltypescriptrust

```
curl -X POST "https://www.wasenderapi.com/api/send-message"
  -H "Authorization: Bearer YOUR_API_KEY"
  -H "Content-Type: application/json"
  -d '{
      "to": "[email protected]",
      "text": "Hello everyone in the group!"
  }'
```

#### Response Examples

Success Response

```
{
  "success": true,
  "data": {
    "msgId": 100000,
    "jid": "+123456789",
    "status": "in_progress"
  }
}
```

[Previous

Get Group Metadata](https://www.wasenderapi.com/api-docs/groups/get-group-metadata)[Next

Update Group Participants](https://www.wasenderapi.com/api-docs/groups/update-group-participants)

---

## Update Group Participants

**Source:** https://www.wasenderapi.com/api-docs/groups/update-group-participants

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Update Group Participants

Groups

PUT`/api/groups/{groupId}/participants/update`

Copy endpoint

Promote or demote one or more participants in a specific group.

# Update Group Participants' Roles

This endpoint allows you to change the role of participants within a group. You can either promote a member to an admin or demote an admin back to a regular member.

This action requires that your session has admin privileges in the target group. You can perform the action on multiple participants in a single API call by including their JIDs in the `participants` array.

The `action` parameter determines the operation to be performed:

* `promote`: Grants admin privileges to the specified participants.
* `demote`: Revokes admin privileges from the specified participants.

#### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| groupId | string | Yes | The JID of the group (e.g., [[email protected]](/cdn-cgi/l/email-protection)). |
| action | string | Yes | The action to perform on the participants. Must be either `promote` or `demote`. |
| participants | array | Yes | An array of user JIDs (strings) to update. |

#### Code Examples

bashpythonjavascriptphprubygocsharpjavaswiftpowershelltypescriptrust

```
curl -X PUT "https://www.wasenderapi.com/api/groups/[email protected]/participants/update" 
  -H "Authorization: Bearer YOUR_API_KEY" 
  -H "Content-Type: application/json" 
  -d '{
    "action": "promote",
    "participants": ["[email protected]", "[email protected]"]
}'
```

#### Response Examples

Success ResponseError Response

```
{
    "success": true,
    "data": {
        "participants": ["[email protected]"]
    }
}
```

[Previous

Send Group Message](https://www.wasenderapi.com/api-docs/groups/send-group-message)[Next

Send Message with Mentions](https://www.wasenderapi.com/api-docs/groups/send-message-with-mentions)

---

## Send Message with Mentions

**Source:** https://www.wasenderapi.com/api-docs/groups/send-message-with-mentions

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Send Message with Mentions

Groups

POST`/api/send-message`

Copy endpoint

Sends a message to a group that specifically mentions one or more participants.

# Mention Users in a Group Message

This functionality allows you to send a message to a group that triggers a notification for specific members, even if they have muted the group.

To use mentions, you must provide three parameters in your request:

* `to`: The JID of the group (ending in `@g.us`).
* `text`: The message content. For the mention to be visually displayed in the WhatsApp client, you must include the "@" symbol followed by the user's number (e.g., "Hello @1234567890").
* `mentions`: An array of strings, where each string is the JID of a group member you want to mention (e.g., `["[email protected]"]`).

This feature can also be combined with media messages by including the appropriate media parameters alongside the text and mentions.

#### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| to | string | Yes | The Group JID, which must end in @g.us. |
| text | string | Yes | The text content of the message. Should include the @ mention for visual display. |
| mentions | array | Yes | An array of user JIDs (strings) to be mentioned in the group message. |

#### Code Examples

bashpythonjavascriptphprubygocsharpjavaswiftpowershelltypescriptrust

```
curl -X POST "https://www.wasenderapi.com/api/send-message" 
  -H "Authorization: Bearer YOUR_API_KEY" 
  -H "Content-Type: application/json" 
  -d '{
    "to": "[email protected]",
    "text": "Hello @1234567890, check this out!",
    "mentions": ["[email protected]"]
}'
```

#### Response Examples

Success Response

```
{
  "success": true,
  "data": {
    "msgId": 100001,
    "jid": "[email protected]",
    "status": "in_progress"
  }
}
```

[Previous

Update Group Participants](https://www.wasenderapi.com/api-docs/groups/update-group-participants)[Next

Get Group Participants](https://www.wasenderapi.com/api-docs/groups/get-group-participants)

---

## Get Group Participants

**Source:** https://www.wasenderapi.com/api-docs/groups/get-group-participants

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Get Group Participants

Groups

GET`/api/groups/{groupJid}/participants`

Copy endpoint

Retrieves a list of participants for a specific group. Warning: If the list is empty, it may mean no participants are currently synced or available, or the initial sync is still in progress. If you connected your session before 5/8/2025, you must reconnect it to sync them correctly.

# Get Group Participants

Retrieves a list of participants for a specific group. Warning: If the list is empty, it may mean no participants are currently synced or available, or the initial sync is still in progress. If you connected your session before 5/8/2025, you must reconnect it to sync them correctly.

#### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| groupJid | string | Yes | The JID (Jabber ID) of the group in the format [[email protected]](/cdn-cgi/l/email-protection). |

#### Code Examples

bashpythonjavascriptphprubygocsharpjavaswiftpowershelltypescriptrust

```
curl "https://www.wasenderapi.com/api/groups/{groupJid}/participants"
  -H "Authorization: Bearer YOUR_API_KEY"
```

#### Response Examples

Success Response

```
{
    "success": true,
    "data": [
  {
    "id": "123456789012345@lid"
  },
  {
    "id": "987654321098765@lid",
    "admin": "superadmin"
  }
]
}
```

[Previous

Send Message with Mentions](https://www.wasenderapi.com/api-docs/groups/send-message-with-mentions)[Next

Add Group Participants](https://www.wasenderapi.com/api-docs/groups/add-group-participants)

---

## Add Group Participants

**Source:** https://www.wasenderapi.com/api-docs/groups/add-group-participants

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Add Group Participants

Groups

POST`/api/groups/{groupJid}/participants/add`

Copy endpoint

Adds participants to a specific group. Requires admin privileges in the group.

# Add Group Participants

Adds participants to a specific group. Requires admin privileges in the group.

#### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| groupJid | string | Yes | The JID (Jabber ID) of the group in the format [[email protected]](/cdn-cgi/l/email-protection). |
| participants | array | Yes | Array of participant JIDs in E.164 format (international phone numbers) e.g., 1234567890. |

#### Code Examples

bashpythonjavascriptphprubygocsharpjavaswiftpowershelltypescriptrust

```
curl -X POST "https://www.wasenderapi.com/api/groups/{groupJid}/participants/add"
  -H "Authorization: Bearer YOUR_API_KEY"
  -H "Content-Type: application/json"
  -d '{
      "participants": [
          "number1",
          "number2"
      ]
  }'
```

#### Response Examples

Success Response

```
{
    "success": true,
    "data": [
        {
            "status": 200,
            "jid": "123456789",
            "message": "added"
        },
        {
            "status": 403,
            "jid": "participant2",
            "message": "not-authorized"
        }
    ]
}
```

[Previous

Get Group Participants](https://www.wasenderapi.com/api-docs/groups/get-group-participants)[Next

Remove Group Participants](https://www.wasenderapi.com/api-docs/groups/remove-group-participants)

---

## Remove Group Participants

**Source:** https://www.wasenderapi.com/api-docs/groups/remove-group-participants

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Remove Group Participants

Groups

POST`/api/groups/{groupJid}/participants/remove`

Copy endpoint

Removes participants from a specific group. Requires admin privileges in the group.

# Remove Group Participants

Removes participants from a specific group. Requires admin privileges in the group.

#### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| groupJid | string | Yes | The JID (Jabber ID) of the group in the format [[email protected]](/cdn-cgi/l/email-protection). |
| participants | array | Yes | Array of participant JIDs in E.164 format (international phone numbers) e.g., 1234567890. |

#### Code Examples

bashpythonjavascriptphprubygocsharpjavaswiftpowershelltypescriptrust

```
curl -X POST "https://www.wasenderapi.com/api/groups/{groupJid}/participants/remove"
  -H "Authorization: Bearer YOUR_API_KEY"
  -H "Content-Type: application/json"
  -d '{
      "participants": [
          "number1",
          "number2"
      ]
  }'
```

#### Response Examples

Success Response

```
{
    "success": true,
    "data": [
        {
            "status": 200,
            "jid": "123456789",
            "message": "removed"
        },
        {
            "status": 403,
            "jid": "participant2",
            "message": "not-authorized"
        }
    ]
}
```

[Previous

Add Group Participants](https://www.wasenderapi.com/api-docs/groups/add-group-participants)[Next

Get Group Profile Picture](https://www.wasenderapi.com/api-docs/groups/get-group-profile-picture)

---

## Get Group Profile Picture

**Source:** https://www.wasenderapi.com/api-docs/groups/get-group-profile-picture

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Get Group Profile Picture

Groups

GET`/api/groups/{groupJid}/picture`

Copy endpoint

Retrieves the URL of the profile picture for a specific group.

# Get Group Profile Picture

Retrieves the URL of the profile picture for a specific group.

#### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| groupJid | string | Yes | The JID (Jabber ID) of the group in the format [[email protected]](/cdn-cgi/l/email-protection). |

#### Code Examples

bashpythonjavascriptphprubygocsharpjavaswiftpowershelltypescriptrust

```
curl "https://www.wasenderapi.com/api/groups/{groupJid}/picture"
  -H "Authorization: Bearer YOUR_API_KEY"
```

#### Response Examples

Success Response

```
{
    "success": true,
    "data": {
        "imgUrl": "https:\/\/profile.pic.url\/image.jpg"
    }
}
```

[Previous

Remove Group Participants](https://www.wasenderapi.com/api-docs/groups/remove-group-participants)[Next

Update Group Settings](https://www.wasenderapi.com/api-docs/groups/update-group-settings)

---

## Update Group Settings

**Source:** https://www.wasenderapi.com/api-docs/groups/update-group-settings

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Update Group Settings

Groups

PUT`/api/groups/{groupJid}/settings`

Copy endpoint

Updates settings for a specific group (e.g., subject, description, announce mode, restrict mode). Requires admin privileges.

# Update Group Settings

Updates settings for a specific group (e.g., subject, description, announce mode, restrict mode). Requires admin privileges.

#### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| groupJid | string | Yes | The JID (Jabber ID) of the group in the format [[email protected]](/cdn-cgi/l/email-protection). This is a unique identifier for the target WhatsApp group. |
| subject | string | No | The new name or title for the group. If provided, this will update the group's subject line that all members see. |
| description | string | No | The new text description for the group. This is the text that appears under the group name when viewing group info. |
| announce | boolean | No | Controls message sending permissions. Set subject `true` subject make the group 'announcement only', where only admins can send messages. Set subject `false` subject allow all participants subject send messages. |
| restrict | boolean | No | Controls who can edit the group's information (subject, description, and icon). Set subject `true` subject restrict editing subject admins only. Set subject `false` subject allow all participants subject edit the group info. |
| joinApproval | boolean | No | Manages how new members join the group. Set subject `true` subject enable join approval, which means an admin must approve any new person who tries subject join via a group link. Set subject `false` subject disable this, allowing anyone with the link subject join immediately without needing approval. |
| memberAdd | boolean | No | Determines who has the permission subject add new members subject the group. Set subject `true` subject allow \*any\* participant in the group subject add new members. Set subject `false` subject restrict this permission subject \*admins only\*, meaning only admins can add new members. |
| profilePicUrl | string | No | A publicly accessible URL to the new group profile picture |

#### Code Examples

bashpythonjavascriptphprubygocsharpjavaswiftpowershelltypescriptrust

```
curl -X PUT "https://www.wasenderapi.com/api/groups/{groupJid}/settings"
  -H "Authorization: Bearer YOUR_API_KEY"
  -H "Content-Type: application/json"
  -d '{
      "subject": "My New Group",
      "profilePicUrl": "https://example.com/sticker.webp"
  }'
```

#### Response Examples

Success Response

```
{
    "success": true,
    "data": {
        "subject": "New Group Subject",
        "description": "New Group Description"
    }
}
```

[Previous

Get Group Profile Picture](https://www.wasenderapi.com/api-docs/groups/get-group-profile-picture)[Next

Get Group Invite Link](https://www.wasenderapi.com/api-docs/groups/get-group-invite-link)

---

## Get Group Invite Link

**Source:** https://www.wasenderapi.com/api-docs/groups/get-group-invite-link

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Get Group Invite Link

Groups

GET`/api/groups/{groupJid}/invite-link`

Copy endpoint

This endpoint retrieves the invite link for a specific WhatsApp group.

# Get Group Invite Link

Retrieves the invite link for a specific WhatsApp group. This link can be shared with others to allow them to join the group.

Only administrators of a group can generate an invite link. If the authenticated user is not an admin of the specified group, the request will fail.

## FAQ

### How do I find the `groupJid`?

You can retrieve the `groupJid` for all groups the connected account is a member of by using the [Get All Groups](/api-docs/groups/get-all-groups) endpoint.

### Can any member of a group generate an invite link?

No, only administrators of a group have the permission to generate an invite link.

#### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| groupJid | string | Yes | The JID (Jabber ID) of the group in the format [[email protected]](/cdn-cgi/l/email-protection). |

#### Code Examples

bashpythonjavascriptphprubygocsharpjavaswiftpowershelltypescriptrust

```
curl "https://www.wasenderapi.com/api/groups/{groupJid}/invite-link"
  -H "Authorization: Bearer YOUR_API_KEY"
```

#### Response Examples

Success Response

```
{
  "success": true,
  "inviteLink": "https://chat.whatsapp.com/I8mjkHnC984Ubg3EVkzqxz"
}
```

[Previous

Update Group Settings](https://www.wasenderapi.com/api-docs/groups/update-group-settings)[Next

Get Group Invite Info](https://www.wasenderapi.com/api-docs/groups/get-group-invite-info)

---

## Get Group Invite Info

**Source:** https://www.wasenderapi.com/api-docs/groups/get-group-invite-info

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Get Group Invite Info

Groups

GET`/api/groups/invite/{inviteCode}`

Copy endpoint

Retrieves metadata for a group from its invite code.

# Get Group Invite Info

This endpoint allows you to fetch public information and metadata about a WhatsApp group by using its invitation code, without actually joining the group. It's useful for previewing a group's subject, description, and size.

#### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| inviteCode | string | Yes | The unique invitation code from the group invite link. For example, in the link https://chat.whatsapp.com/ABCDE12345, the code is ABCDE12345. |

#### Code Examples

bashpythonjavascriptphprubygocsharpjavaswiftpowershelltypescriptrust

```
curl -X GET "https://www.wasenderapi.com/api/groups/invite/SAMPLE_INVITE_CODE"
  -H "Authorization: Bearer YOUR_API_KEY"
```

#### Response Examples

Success ResponseError Response

```
{
    "success": true,
    "data": {
        "id": "[email protected]",
        "subject": "Official Project Group",
        "owner": "[email protected]",
        "creation": 1672531200,
        "size": 42,
        "desc": "This is the official group for project updates.",
        "participants": [
            { "id": "[email protected]", "admin": "superadmin" },
            { "id": "[email protected]", "admin": "admin" }
        ]
    }
}
```

[Previous

Get Group Invite Link](https://www.wasenderapi.com/api-docs/groups/get-group-invite-link)[Next

Accept Group Invite](https://www.wasenderapi.com/api-docs/groups/accept-group-invite)

---

## Accept Group Invite

**Source:** https://www.wasenderapi.com/api-docs/groups/accept-group-invite

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Accept Group Invite

Groups

POST`/api/groups/invite/accept`

Copy endpoint

Accept a group invitation using an invite code.

# Accept Group Invite

This endpoint allows the connected WhatsApp account to join a group using a specific invitation code. The code is typically part of a group invite link (e.g., https://chat.whatsapp.com/**INVITE\_CODE**).

#### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| code | string | Yes | The unique invitation code from the group invite link that you want to accept. |

#### Code Examples

bashpythonjavascriptphprubygocsharpjavaswiftpowershelltypescriptrust

```
curl -X POST "https://www.wasenderapi.com/api/groups/invite/accept"
  -H "Authorization: Bearer YOUR_API_KEY"
  -H "Content-Type: application/json"
  -d '{
      "code": "SAMPLE_INVITE_CODE"
  }'
```

#### Response Examples

Success ResponseError Response

```
{
    "success": true,
    "data": {
        "id": "[email protected]"
    }
}
```

[Previous

Get Group Invite Info](https://www.wasenderapi.com/api-docs/groups/get-group-invite-info)[Next

Leave Group](https://www.wasenderapi.com/api-docs/groups/leave-group)

---

## Leave Group

**Source:** https://www.wasenderapi.com/api-docs/groups/leave-group

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Leave Group

Groups

POST`/api/groups/{groupId}/leave`

Copy endpoint

Leave a specific group that the user is a member of.

# Leave Group

This endpoint allows the connected WhatsApp account to leave a specific group. The account must be a member of the group to successfully leave it.

#### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| groupId | string | Yes | The JID (Jabber ID) of the group to leave, in the format [[email protected]](/cdn-cgi/l/email-protection). |

#### Code Examples

bashpythonjavascriptphprubygocsharpjavaswiftpowershelltypescriptrust

```
curl -X POST "https://www.wasenderapi.com/api/groups/[email protected]/leave"
  -H "Authorization: Bearer YOUR_API_KEY"
```

#### Response Examples

Success ResponseError Response

```
{
    "success": true,
    "data": {}
}
```

[Previous

Accept Group Invite](https://www.wasenderapi.com/api-docs/groups/accept-group-invite)[Next

Send Channel Message](https://www.wasenderapi.com/api-docs/channels-communities/send-channel-message)

---

## Send Channel Message

**Source:** https://www.wasenderapi.com/api-docs/channels-communities/send-channel-message

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Send Channel Message

Channels (Communities)

POST`/api/send-message`

Copy endpoint

Sends a message to a specific WhatsApp channel using its Channel ID.

# Send Message to a WhatsApp Channel

To send a message to a WhatsApp Channel, follow these steps:

1. First, listen for the [`message.upsert` event](https://wasenderapi.com/api-docs/webhooks/webhook-message-received).
   This event will include the channel's unique ID (e.g., `123456789@newsletter`) in the `jid` field.
2. Once you have the channel ID, use it in the `to` field when sending a message through your usual send endpoint.
3. The message parameters are the same as those for regular messages. Just ensure the `to` field is set to the channel's ID.

#### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| to | string | Yes | Channel ID (e.g., '123456789@newsletter') . |
| text | string | Yes | The text content of the message. Required if no media/contact/location is sent. |
| imageUrl | string | No | URL of the image to send. |
| videoUrl | string | No | URL of the video to send. |
| documentUrl | string | No | URL of the document to send. |
| audioUrl | string | No | URL of the audio file to send (sent as voice note). |
| stickerUrl | string | No | URL of the sticker (.webp) to send. |
| contact | object | No | Contact card object. |
| location | object | No | Location object. |

#### Code Examples

bashpythonjavascriptphprubygocsharpjavaswiftpowershelltypescriptrust

```
curl -X POST "https://www.wasenderapi.com/api/send-message"
  -H "Authorization: Bearer YOUR_API_KEY"
  -H "Content-Type: application/json"
  -d '{
      "to": "123456789@newsletter",
      "text": "Hello everyone in the channel!"
  }'
```

#### Response Examples

Success Response

```
{
  "success": true,
  "data": {
    "msgId": 100000,
    "jid": "+123456789",
    "status": "in_progress"
  }
}
```

[Previous

Leave Group](https://www.wasenderapi.com/api-docs/groups/leave-group)[Next

Webhook Setup](https://www.wasenderapi.com/api-docs/webhooks/webhook-setup)

---

## Webhook Setup

**Source:** https://www.wasenderapi.com/api-docs/webhooks/webhook-setup

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Webhook Setup

Webhooks

POST`/your-webhook-url`

Copy endpoint

How to set up and verify webhooks to receive real-time events.

# Webhook Setup

Webhooks allow your application to receive real-time notifications about events happening in your WhatsApp session, such as receiving messages, message status updates, or session status changes.

## Configuration:

1. Go to your WhatsApp Session settings in the Wasender dashboard.
2. Enter your publicly accessible webhook URL in the 'Webhook URL' field. This URL must be HTTPS.
3. Optionally, generate and save a 'Webhook Secret'. This secret is used to verify that incoming requests are genuinely from Wasender.
4. Enable the specific events you want to subscribe to.
5. Save your changes.

## Verification:

It's crucial to verify that incoming webhook requests originate from Wasender. Check if the `X-Webhook-Signature` header in the request matches your stored Webhook Secret.

Always respond to webhook requests with a `200 OK` status code quickly to acknowledge receipt, even if you process the event asynchronously.

#### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| X-Webhook-Signature | string | Yes | Secret key used to verify the webhook came from WasenderApi. |
| Content-Type | string | Yes | Should be `application/json`. |

#### Code Examples

javascript

```
// Example webhook endpoint in Express.js
const express = require('express');
const crypto = require('crypto');
const app = express();

app.use(express.json());

// Verify webhook signature to ensure it's from WasenderApi
function verifySignature(req) {
    const signature = req.headers['x-webhook-signature'];
    const webhookSecret = 'YOUR_WEBHOOK_SECRET'; // Store securely
    if (!signature || !webhookSecret || signature !== webhookSecret) return false;
    return true;
}

app.post('/webhook', (req, res) => {
    if (!verifySignature(req)) {
        return res.status(401).json({ error: 'Invalid signature' });
    }

    const payload = req.body;
    console.log('Received webhook event:', payload.event);

    // Handle different event types (e.g., message.sent, session.status)
    switch (payload.event) {
        case 'messages.upsert':
            console.log('New message received:', payload.data.key.id);
            // Process the incoming message
            break;
        // Add other cases
    }

    res.status(200).json({ received: true });
});

app.listen(3000, () => {
    console.log('Webhook server listening on port 3000');
});
```

[Previous

Send Channel Message](https://www.wasenderapi.com/api-docs/channels-communities/send-channel-message)[Next

Webhook: Contact Update](https://www.wasenderapi.com/api-docs/webhooks/webhook-contact-update)

---

## Webhook: Contact Update

**Source:** https://www.wasenderapi.com/api-docs/webhooks/webhook-contact-update

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Webhook: Contact Update

Webhooks

Triggered for other contact updates, such as a contact changing their profile picture or status (if available).

# Webhook: Contact Update

Triggered for other contact updates, such as a contact changing their profile picture or status (if available).

#### Code Examples

json

```
{
  "event": "contacts.update",
  "timestamp": 1633456789,
  "data": [
    {
      "jid": "1234567890",
      "imgUrl": "https://pps.whatsapp.net/v/t61.24694-24/123456789_123456789_123456789_123456789_123456789.jpg"
    }
  ]
}
```

[Previous

Webhook Setup](https://www.wasenderapi.com/api-docs/webhooks/webhook-setup)[Next

Webhook: Contact Upsert](https://www.wasenderapi.com/api-docs/webhooks/webhook-contact-upsert)

---

## Webhook: Contact Upsert

**Source:** https://www.wasenderapi.com/api-docs/webhooks/webhook-contact-upsert

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Webhook: Contact Upsert

Webhooks

Triggered when a new contact is added or an existing contact is updated in your session's contact list.

# Webhook: Contact Upsert

Triggered when a new contact is added or an existing contact is updated in your session's contact list.

#### Code Examples

json

```
{
  "event": "contacts.upsert",
  "timestamp": 1633456789,
  "data": [
    {
      "jid": "1234567890",
      "name": "Contact Name",
      "notify": "Contact Display Name",
      "verifiedName": "Verified Business Name",
      "status": "Hey there! I am using WhatsApp."
    }
  ]
}
```

[Previous

Webhook: Contact Update](https://www.wasenderapi.com/api-docs/webhooks/webhook-contact-update)[Next

Webhook: Group Participants Update](https://www.wasenderapi.com/api-docs/webhooks/webhook-group-participants-update)

---

## Webhook: Group Participants Update

**Source:** https://www.wasenderapi.com/api-docs/webhooks/webhook-group-participants-update

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Webhook: Group Participants Update

Webhooks

Triggered when participants are added, removed, promoted, or demoted in a group.

# Webhook: Group Participants Update

Triggered when participants are added, removed, promoted, or demoted in a group.

#### Code Examples

json

```
{
  "event": "group-participants.update",
  "timestamp": 1633456789,
  "data": {
    "jid": "[email protected]",
    "participants": ["1234567890"],
    "action": "add" // or "remove", "promote", "demote"
  }
}
```

[Previous

Webhook: Contact Upsert](https://www.wasenderapi.com/api-docs/webhooks/webhook-contact-upsert)[Next

Webhook: Group Update](https://www.wasenderapi.com/api-docs/webhooks/webhook-group-update)

---

## Webhook: Group Update

**Source:** https://www.wasenderapi.com/api-docs/webhooks/webhook-group-update

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Webhook: Group Update

Webhooks

Triggered for other group-related updates, such as changes to group settings like announce mode or restrict mode by an admin.

# Webhook: Group Update

Triggered for other group-related updates, such as changes to group settings like announce mode or restrict mode by an admin.

#### Code Examples

json

```
{
  "event": "groups.update",
  "timestamp": 1633456789,
  "data": [
    {
      "jid": "[email protected]",
      "announce": true,
      "restrict": false
    }
  ]
}
```

[Previous

Webhook: Group Participants Update](https://www.wasenderapi.com/api-docs/webhooks/webhook-group-participants-update)[Next

Webhook: Chat Update](https://www.wasenderapi.com/api-docs/webhooks/webhook-chat-update)

---

## Webhook: Chat Update

**Source:** https://www.wasenderapi.com/api-docs/webhooks/webhook-chat-update

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Webhook: Chat Update

Webhooks

Triggered when properties of a chat are updated (e.g., unread count, mute status).

# Webhook: Chat Update

Triggered when properties of a chat are updated (e.g., unread count, mute status).

#### Code Examples

json

```
{
  "event": "chats.update",
  "timestamp": 1633456789,
  "data": [
    {
      "id": "1234567890",
      "unreadCount": 0,
      "conversationTimestamp": 1633456789
    }
  ]
}
```

[Previous

Webhook: Group Update](https://www.wasenderapi.com/api-docs/webhooks/webhook-group-update)[Next

Webhook: Message Sent](https://www.wasenderapi.com/api-docs/webhooks/webhook-message-sent)

---

## Webhook: Message Sent

**Source:** https://www.wasenderapi.com/api-docs/webhooks/webhook-message-sent

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Webhook: Message Sent

Webhooks

Event triggered when a message is successfully sent from your session.

# Webhook Event: `message.sent`

Triggered when a message is successfully sent from your session. The payload contains details about the sent message.

See the code example below for the typical payload structure.

#### Code Examples

json (message sent successfully)json (message failed to be sent)

```
{
  "event": "message.sent",
  "timestamp": 1633456790,
  "data": {
    "key": {
      "id": "message-id-456",
      "fromMe": true,
      "remoteJid": "+1987654321"
    },
    "message": {
      "conversation": "This is my reply."
    },
    "success": true
  }
}
```

[Previous

Webhook: Chat Update](https://www.wasenderapi.com/api-docs/webhooks/webhook-chat-update)[Next

Webhook: Group Upsert](https://www.wasenderapi.com/api-docs/webhooks/webhook-group-upsert)

---

## Webhook: Group Upsert

**Source:** https://www.wasenderapi.com/api-docs/webhooks/webhook-group-upsert

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Webhook: Group Upsert

Webhooks

Triggered when your session joins a new group or when metadata of an existing group (subject, description, etc.) is updated.

# Webhook: Group Upsert

Triggered when your session joins a new group or when metadata of an existing group (subject, description, etc.) is updated.

#### Code Examples

json

```
{
  "event": "groups.upsert",
  "timestamp": 1633456789,
  "data": [
    {
      "jid": "[email protected]",
      "subject": "Group Name",
      "creation": 1633456700,
      "owner": "1234567890",
      "desc": "Group description",
      "participants": [
        {
          "jid": "1234567890",
          "isAdmin": true,
          "isSuperAdmin": true
        },
        {
          "jid": "0987654321",
          "isAdmin": false,
          "isSuperAdmin": false
        }
      ]
    }
  ]
}
```

[Previous

Webhook: Message Sent](https://www.wasenderapi.com/api-docs/webhooks/webhook-message-sent)[Next

Webhook: Session Status](https://www.wasenderapi.com/api-docs/webhooks/webhook-session-status)

---

## Webhook: Session Status

**Source:** https://www.wasenderapi.com/api-docs/webhooks/webhook-session-status

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Webhook: Session Status

Webhooks

Event triggered when the connection status of your WhatsApp session changes.

# Webhook Event: `session.status`

Triggered when the connection status of your WhatsApp session changes (e.g., connected, disconnected, need\_scan). The payload includes the new status and session ID.

See the code example below for the typical payload structure.

#### Code Examples

json

```
{
  "event": "session.status",
  "sessionId": "YOUR_SESSION_API_KEY",
  "data": {
    "status": "connected", // or "disconnected", "need_scan"
  }
}
```

[Previous

Webhook: Group Upsert](https://www.wasenderapi.com/api-docs/webhooks/webhook-group-upsert)[Next

Webhook: Chat Delete](https://www.wasenderapi.com/api-docs/webhooks/webhook-chat-delete)

---

## Webhook: Chat Delete

**Source:** https://www.wasenderapi.com/api-docs/webhooks/webhook-chat-delete

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Webhook: Chat Delete

Webhooks

Triggered when a chat is deleted.

# Webhook: Chat Delete

Triggered when a chat is deleted.

#### Code Examples

json

```
{
  "event": "chats.delete",
  "timestamp": 1633456789,
  "data": [
    "1234567890"
  ]
}
```

[Previous

Webhook: Session Status](https://www.wasenderapi.com/api-docs/webhooks/webhook-session-status)[Next

Webhook: Chat Upsert](https://www.wasenderapi.com/api-docs/webhooks/webhook-chat-upsert)

---

## Webhook: Chat Upsert

**Source:** https://www.wasenderapi.com/api-docs/webhooks/webhook-chat-upsert

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Webhook: Chat Upsert

Webhooks

Triggered when a chat is created or updated (e.g., new message, read status change).

# Webhook: Chat Upsert

Triggered when a chat is created or updated (e.g., new message, read status change).

#### Code Examples

json

```
{
  "event": "chats.upsert",
  "timestamp": 1633456789,
  "data": [
    {
      "id": "1234567890",
      "name": "Contact Name",
      "conversationTimestamp": 1633456789,
      "unreadCount": 2
    }
  ]
}
```

[Previous

Webhook: Chat Delete](https://www.wasenderapi.com/api-docs/webhooks/webhook-chat-delete)[Next

Webhook: QR Code Updated](https://www.wasenderapi.com/api-docs/webhooks/webhook-qrcode-updated)

---

## Webhook: QR Code Updated

**Source:** https://www.wasenderapi.com/api-docs/webhooks/webhook-qrcode-updated

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Webhook: QR Code Updated

Webhooks

Event triggered when a new QR code is generated for linking your session.

# Webhook Event: `qrcode.updated`

Triggered when a new QR code is generated for linking your session. The payload contains the QR code data.

See the code example below for the typical payload structure.

#### Code Examples

json

```
{
  "event": "qrcode.updated",
  "sessionId": "YOUR_SESSION_API_KEY",
  "data": {
    "qr": "2@67576ghf/RMXr8A2IP3/...", // This is the QR string. Use a QR code library to generate an image.
  }
}
```

[Previous

Webhook: Chat Upsert](https://www.wasenderapi.com/api-docs/webhooks/webhook-chat-upsert)[Next

Webhook: Message Received](https://www.wasenderapi.com/api-docs/webhooks/webhook-message-received)

---

## Webhook: Message Received

**Source:** https://www.wasenderapi.com/api-docs/webhooks/webhook-message-received

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Webhook: Message Received

Webhooks

Event is triggered for incoming messages, to listen for both incoming and outgoing, please refer to messages.upsert.

# Webhook Event: `messages.received`

This event is triggered when a new message is received in your session. The payload includes the message content, sender information, and message key.

See the code example below for a typical payload structure.

To learn more about handling media in this event, please refer to the [help center article on handling media messages](https://wasenderapi.com/help/messaging/handling-media-message-from-the-webhook-event-message-upsert).

#### Code Examples

json

```
{
  "event": "messages.received",
  "timestamp": 1633456789,
  "data": {
    "messages": 
      {
        "key": {
          "id": "3EB0X123456789",
          "fromMe": false,
          "remoteJid": "[email protected]", // could also be 555555555@lid based on the addressingMode
          "addressingMode": "pn", 
          "senderPn": "[email protected]",
          "cleanedSenderPn": "1234567890",
          "senderLid": "555555555@lid"
        },
        "messageBody": "Hello, I have a question",
        "message": {
          "conversation": "Hello, I have a question"
        }
      }
  }
}
```

[Previous

Webhook: QR Code Updated](https://www.wasenderapi.com/api-docs/webhooks/webhook-qrcode-updated)[Next

Webhook: Message Upsert](https://www.wasenderapi.com/api-docs/webhooks/webhook-message-upsert)

---

## Webhook: Message Upsert

**Source:** https://www.wasenderapi.com/api-docs/webhooks/webhook-message-upsert

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Webhook: Message Upsert

Webhooks

Event is triggered for all messages in your session, both incoming and outgoing. To listen only for incoming events, please refer to messages.received.

# Webhook Event: `messages.upsert`

This event is triggered for all messages in your session, both incoming and outgoing. To listen only for incoming events, please refer to messages.received. The payload includes the message content, sender information, and message key.

See the code example below for a typical payload structure.

To learn more about handling media in this event, please refer to the [help center article on handling media messages](https://wasenderapi.com/help/messaging/handling-media-message-from-the-webhook-event-message-upsert).

#### Code Examples

json

```
{
  "event": "messages.upsert",
  "timestamp": 1633456789,
  "data": {
    "messages": [
      {
        "key": {
          "id": "message-id-123",
          "fromMe": false,
          // This can be a LID (e.g., "123456@lid") depending on the addressing mode.
          "remoteJid": "[email protected]", 
          // Use these fields for phone number logic:
          "senderPn": "[email protected]",
          "cleanedSenderPn": "5551234567",
          // This will match remoteJid if remoteJid is already an LID
          "senderLid": "123456789@lid",
          "addressingMode": "pn"
        },
        "messageBody": "Hello!",
        "message": {
          "conversation": "Hello!"
        }
      }
    ]
  }
}
```

[Previous

Webhook: Message Received](https://www.wasenderapi.com/api-docs/webhooks/webhook-message-received)[Next

Webhook: Group Message Received](https://www.wasenderapi.com/api-docs/webhooks/webhook-group-message-received)

---

## Webhook: Group Message Received

**Source:** https://www.wasenderapi.com/api-docs/webhooks/webhook-group-message-received

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Webhook: Group Message Received

Webhooks

Event is triggered when a message is received in any group the session is a part of.

# Webhook Event: `messages-group.received`

This event is triggered whenever a new message is received in a group that your session is a member of. The payload is similar to a direct message but critically includes the `remoteJid` of the group and the `participant` JID of the actual sender.

The payload includes the message content, the group's JID, the sender's JID, and the message key.

To learn more about handling media in this event, please refer to the [help center article on handling media messages](https://wasenderapi.com/help/messaging/handling-media-message-from-the-webhook-event-message-upsert).

#### Code Examples

json

```
{
  "event": "messages-group.received",
  "timestamp": 1633456799,
  "data": {
    "messages":
      {
        "key": {
          "id": "message-id-group-456",
          "fromMe": false,
          "remoteJid": "[email protected]",
          "participant": "123456789@lid",
          "participantPn": "[email protected]",
          "cleanedParticipantPn": "123456789",
          "participantLid": "123456789@lid", 
          "addressingMode": "lid"
        },
        "messageBody": "Hey everyone, just checking in!",
        "message": {
          "conversation": "Hey everyone, just checking in!"
        }
      }
  }
}
```

[Previous

Webhook: Message Upsert](https://www.wasenderapi.com/api-docs/webhooks/webhook-message-upsert)[Next

Webhook: Message Status Update](https://www.wasenderapi.com/api-docs/webhooks/webhook-message-update)

---

## Webhook: Message Status Update

**Source:** https://www.wasenderapi.com/api-docs/webhooks/webhook-message-update

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Webhook: Message Status Update

Webhooks

Event triggered when a message's status is updated (e.g., delivered, read).

# Webhook Event: `messages.update`

Triggered when a message's status is updated (e.g., delivered, read). The payload contains the updated status and message key.

See the code example below for the typical payload structure.

## Status Codes

| Status Code | Description | Explanation |
| --- | --- | --- |
| 0 | ERROR | The message failed to send due to an error. |
| 1 | PENDING | The message is queued and waiting to be sent. |
| 2 | SENT | The message has been sent from the server but not yet delivered. |
| 3 | DELIVERED | The message has reached the recipient’s device. |
| 4 | READ | The recipient has opened and read the message. |
| 5 | PLAYED | The recipient has played the media message (e.g., audio or video). |

#### Code Examples

json

```
{
  "event": "messages.update",
  "sessionId": "your_api_key",
  "data": {
    "update": {
      "status": 2
    },
    "key": {
      "remoteJid": "[email protected]",
      "id": "34874643876",
      "fromMe": false
    }
  },
  "timestamp": 1747775431467
}
```

[Previous

Webhook: Group Message Received](https://www.wasenderapi.com/api-docs/webhooks/webhook-group-message-received)[Next

Webhook: Message Deleted](https://www.wasenderapi.com/api-docs/webhooks/webhook-message-deleted)

---

## Webhook: Message Deleted

**Source:** https://www.wasenderapi.com/api-docs/webhooks/webhook-message-deleted

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Webhook: Message Deleted

Webhooks

Event triggered when a message is deleted.

# Webhook Event: `messages.delete`

Triggered when a message is deleted. The payload contains the key of the deleted message.

See the code example below for the typical payload structure.

#### Code Examples

json

```
{
  "event": "messages.delete",
  "timestamp": 1633456800,
  "data": {
    "keys": [
      {
        "id": "message-id-789",
        "fromMe": false,
        "remoteJid": "+1234567890"
      }
    ]
  }
}
```

[Previous

Webhook: Message Status Update](https://www.wasenderapi.com/api-docs/webhooks/webhook-message-update)[Next

Webhook: Newsletter Message Received](https://www.wasenderapi.com/api-docs/webhooks/webhook-newsletter-message-received)

---

## Webhook: Newsletter Message Received

**Source:** https://www.wasenderapi.com/api-docs/webhooks/webhook-newsletter-message-received

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Webhook: Newsletter Message Received

Webhooks

Event is triggered when a message is received in a newsletter (channel) the session is subscribed to.

# Webhook Event: `messages-newsletter.received`

This event is triggered when a new message is published in a newsletter (also known as a Channel) that your session is subscribed to.

The payload includes the message content and the unique JID of the newsletter, which typically ends in `@newsletter`. Unlike group messages, a participant field is not needed as the sender is the newsletter itself.

See the code example below for a typical payload structure.

#### Code Examples

json

```
{
  "event": "messages-newsletter.received",
  "timestamp": 1633456799,
  "data": {
    "messages": 
      {
        "key": {
          "id": "message-id-newsletter-456",
          "fromMe": false,
          "remoteJid": "123456789-987654321@newsletter",
        },
        "messageBody": "Hey Good News!",
        "message": {
          "conversation": "Hey Good News!"
        }
      }
  }
}
```

[Previous

Webhook: Message Deleted](https://www.wasenderapi.com/api-docs/webhooks/webhook-message-deleted)[Next

Webhook: Message Receipt Update](https://www.wasenderapi.com/api-docs/webhooks/webhook-message-receipt-update)

---

## Webhook: Message Receipt Update

**Source:** https://www.wasenderapi.com/api-docs/webhooks/webhook-message-receipt-update

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Webhook: Message Receipt Update

Webhooks

Event triggered specifically for message receipt status changes.

# Webhook Event: `message-receipt.update`

This event is triggered specifically for message receipt status updates within group chats, such as sent, delivered, or read by individual group members. The payload includes the updated receipt status and the message key identifying the message.

See the code example below for a typical payload structure.

#### Code Examples

json ( receipt )json ( read )

```
{
  "event": "message-receipt.update",
  "sessionId": "your_session_id_here",
  "data": {
    "message": {
      "key": {
        "remoteJid": "[email protected]",
        "id": "message_id_here",
        "fromMe": true,
        "participant": "participant_jid_here"
      },
      "receipt": {
        "userJid": "participant_jid_here",
        "receiptTimestamp": 1234567890
      }
    }
  },
  "timestamp": 1234567890123
}
```

[Previous

Webhook: Newsletter Message Received](https://www.wasenderapi.com/api-docs/webhooks/webhook-newsletter-message-received)[Next

Webhook: Personal Message Received](https://www.wasenderapi.com/api-docs/webhooks/webhook-personal-message-received)

---

## Webhook: Personal Message Received

**Source:** https://www.wasenderapi.com/api-docs/webhooks/webhook-personal-message-received

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Webhook: Personal Message Received

Webhooks

Event is triggered when a message is received in a personal (one-to-one) chat.

# Webhook Event: `messages-personal.received`

This event is triggered when a new message is received in a direct, one-to-one conversation with a contact.

The payload includes the message content and the sender's JID in the `remoteJid` field. This event is distinct from group or newsletter messages.

To learn more about handling media in this event, please refer to the [help center article on handling media messages](https://wasenderapi.com/help/messaging/handling-media-message-from-the-webhook-event-message-upsert).

#### Code Examples

json

```
{
  "event": "messages-personal.received",
  "timestamp": 1633456789,
  "data": {
    "messages":
      {
        "key": {
          "id": "3EB0X123456789",
          "fromMe": false,
          "remoteJid": "[email protected]",
          "addressingMode": "pn", 
          "senderPn": "[email protected]",
          "cleanedSenderPn": "1234567890",
          "senderLid": "555555555@lid"
        },
        "messageBody": "Hello, I have a question",
        "message": {
          "conversation": "Hello, I have a question"
        }
      }
  }
}
```

[Previous

Webhook: Message Receipt Update](https://www.wasenderapi.com/api-docs/webhooks/webhook-message-receipt-update)[Next

Webhook: Message Reaction](https://www.wasenderapi.com/api-docs/webhooks/webhook-message-reaction)

---

## Webhook: Message Reaction

**Source:** https://www.wasenderapi.com/api-docs/webhooks/webhook-message-reaction

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Webhook: Message Reaction

Webhooks

Event triggered when someone reacts to a message.

# Webhook Event: `messages.reaction`

Triggered when someone reacts to a message. The payload includes the reaction details and the message key.

See the code example below for the typical payload structure.

#### Code Examples

json

```
{
  "event": "messages.reaction",
  "timestamp": 1633456810,
  "data": [
    {
      "key": {
        "id": "message-id-123",
        "fromMe": false,
        "remoteJid": "+1234567890"
      },
      "reaction": {
        "text": "👍", // The emoji reaction
        "key": {
          "id": "message-id-123",
          "fromMe": false,
          "remoteJid": "+1234567890"
        }
      }
    }
  ]
}
```

[Previous

Webhook: Personal Message Received](https://www.wasenderapi.com/api-docs/webhooks/webhook-personal-message-received)[Next

Webhook: Call Received](https://www.wasenderapi.com/api-docs/webhooks/webhook-call-received)

---

## Webhook: Call Received

**Source:** https://www.wasenderapi.com/api-docs/webhooks/webhook-call-received

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Webhook: Call Received

Webhooks

Event is triggered for an incoming voice or video call.

# Webhook Event: `call`

This event is triggered whenever an incoming voice or video call is received by the session.

The payload contains the full call object, which includes a unique **call ID** (required for rejecting the call), the caller's JID, and other call metadata like whether it is a video call.

This event is particularly useful for building features like automatic call rejection or logging all incoming call attempts.

#### Code Examples

json

```
{
  "event": "call",
  "timestamp": 1633456829,
  "data": {
    "call": {
      "id": "3EB025832E521B2F7E11",
      "from": "[email protected]",
      "date": "2025-09-22T21:34:00.000Z",
      "isGroup": false,
      "isVideo": true,
      "status": "offer"
    }
  }
}
```

[Previous

Webhook: Message Reaction](https://www.wasenderapi.com/api-docs/webhooks/webhook-message-reaction)[Next

Webhook: Poll Results](https://www.wasenderapi.com/api-docs/webhooks/webhook-poll-results)

---

## Webhook: Poll Results

**Source:** https://www.wasenderapi.com/api-docs/webhooks/webhook-poll-results

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Webhook: Poll Results

Webhooks

This webhook is triggered when there is an update to a poll, such as when a user casts a vote.

# Webhook: Poll Results

Triggered when a user votes in a poll that was created using the [Send Poll Message API endpoint](https://wasenderapi.com/api-docs/messages/send-poll-message-beta). This webhook provides updates on the poll's results as votes are cast.

#### Code Examples

json

```
{
  "event": "poll.results",
  "sessionId": "YOUR_SESSION_API_KEY",
  "data": {
    "key": {
      "remoteJid": "[email protected]",
      "fromMe": true,
      "id": "FZNABLUGNI0F3QIJSWPW7H"
    },
    "pollResult": [
      {
        "name": "Pizza",
        "voters": [
          "[email protected]"
    ]
      },
      {
        "name": "Humberger",
        "voters": []
      }
    ]
  },
  "timestamp": 1753278982097
}
```

[Previous

Webhook: Call Received](https://www.wasenderapi.com/api-docs/webhooks/webhook-call-received)[Next

Response Headers](https://www.wasenderapi.com/api-docs/responses-errors/response-headers)

---

## Response Headers

**Source:** https://www.wasenderapi.com/api-docs/responses-errors/response-headers

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Response Headers

Responses & Errors

Information about standard headers included in API responses, particularly rate limiting.

# Response Headers

API responses include standard HTTP headers. Some important headers, especially related to rate limiting, are:

* `Content-Type`: Typically `application/json`.
* `X-RateLimit-Limit`: Max requests per window.
* `X-RateLimit-Remaining`: Remaining requests in window.
* `X-RateLimit-Reset`: Timestamp (seconds) when the window resets.

#### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| X-RateLimit-Limit | integer | No | The maximum number of requests allowed per time window. |
| X-RateLimit-Remaining | integer | No | The number of requests remaining in the current time window. |
| X-RateLimit-Reset | integer | No | The time in seconds until the rate limit resets. |
| Content-Type | string | No | Usually `application/json`. |

[Previous

Webhook: Poll Results](https://www.wasenderapi.com/api-docs/webhooks/webhook-poll-results)[Next

Error Responses](https://www.wasenderapi.com/api-docs/responses-errors/error-responses)

---

## Error Responses

**Source:** https://www.wasenderapi.com/api-docs/responses-errors/error-responses

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Error Responses

Responses & Errors

Common error responses returned by the API.

# Error Responses

If an API request fails, the response will contain an error message and a relevant HTTP status code. Common error scenarios are listed below.

The error response body typically follows this structure:

```
{
  "message": "Error description",
  "errors": { // Optional: More specific field errors
    "field_name": ["Error details"]
  }
}
```

#### Response Examples

Validation ErrorAuthentication ErrorNo Active Subscription ErrorTrial Bulk Limit ErrorRate Limit Error (Trial)Rate Limit Error (Account Protection)Session is not Connected

```
{
    "success": false,
    "message": "Validation failed",
    "errors": {
        "to": [
            "The to field is required."
        ],
        "text": [
            "The text field is required when no media is present."
        ]
    }
}
```

[Previous

Response Headers](https://www.wasenderapi.com/api-docs/responses-errors/response-headers)[Next

Understanding Rate Limits](https://www.wasenderapi.com/api-docs/rate-limits/understanding-rate-limits)

---

## Understanding Rate Limits

**Source:** https://www.wasenderapi.com/api-docs/rate-limits/understanding-rate-limits

WasenderAPI

## API Documentation

WasenderApi WhatsApp API

Search ...

`⌘K`

# Understanding Rate Limits

Rate Limits

Details on the rate limits applied to API requests based on subscription plans.

# Understanding Rate Limits

To ensure fair usage, platform stability, and the safety of your WhatsApp numbers, WasenderAPI applies rate limits.
Limits vary by plan, endpoint, and safety settings.

## Rate Limit Headers

Every API response includes headers to help you monitor your usage:

* `X-RateLimit-Limit` — maximum requests allowed in the current window.
* `X-RateLimit-Remaining` — remaining requests before the limit is reached.
* `X-RateLimit-Reset` — seconds until the limit resets.

## Message Sending Rate Limits

These limits apply specifically to the **Send Message** endpoint:

| Plan / Setting | Rate Limit | Reason |
| --- | --- | --- |
| **Trial Plan** | 1 request / minute | Ensures fair access during trials and helps prevent free-account abuse. |
| **Paid Plans** (Basic, Pro, Plus, Business) | 256 requests / minute | High-throughput messaging while protecting the platform from abuse and traffic spikes. If you need a higher limit for a legitimate use case, contact support. |
| **Account Protection Enabled** (Any Plan) | 1 request / 5 seconds | Safety-first mode to reduce WhatsApp flag/ban risk. **This setting overrides plan limits.** |

## Other Endpoint Rate Limits

Some endpoints can be interpreted by WhatsApp as suspicious if called too frequently.
To protect your account and keep the platform reliable, additional limits apply:

| Endpoint / Action | Rate Limit |
| --- | --- |
| Get group participants / metadata | 10 requests / minute |
| Get contact picture | 60 requests / minute |
| Check if a number is on WhatsApp | 60 requests / minute |

## Daily Request Caps

In addition to per-minute limits, some endpoints have daily request caps.
These caps exist to prevent abuse and reduce the risk of WhatsApp restrictions or bans.

| Plan / Endpoint | Daily Cap | Important Notes |
| --- | --- | --- |
| **Trial – Send Message** | 50 requests / day | Helps prevent free-account abuse and encourages safe usage during trials. |
| **Get contact picture** | 1,000 requests / day | Excessive usage may trigger WhatsApp anti-abuse systems and result in restrictions. Use only when necessary. |
| **Check if a number is on WhatsApp** | 1,000 requests / day | **High-risk endpoint.** Repeated calls have been observed to cause bans affecting both number checks and contact picture requests. Avoid automated or bulk usage. |
| **Get group participants / metadata** | 500 requests / day | **High-risk endpoint.** WhatsApp monitors group scraping heavily. Call this endpoint once per group and store the result in your database. Avoid polling or frequent refreshes. |

## Concurrent Request Limits (Global)

In addition to per-minute and daily rate limits, WasenderAPI enforces a
**global concurrent request limit** across all endpoints.

This limit controls how many requests can be processed simultaneously per session.
It exists because sending too many concurrent requests to WhatsApp — even within
normal per-minute limits — has been observed to increase the risk of number bans.

| Scope | Limit Type | Purpose |
| --- | --- | --- |
| All Endpoints (Per Session) | Concurrent request cap | Prevents excessive parallel requests that may trigger WhatsApp anti-abuse systems, even if minute limits are respected. |

### How It Works

* The limit applies globally across all endpoints.
* It is enforced per session.
* If too many requests are sent at the same time, additional requests will be rejected temporarily.
* This protection applies regardless of your plan.

**Important:** Even if your plan allows 256 requests per minute,
sending them all simultaneously may result in bans. Always queue requests
and distribute them evenly.

High concurrency is one of the most common causes of WhatsApp number bans.
We strongly recommend implementing a queue system with controlled parallelism
(e.g., 1–5 concurrent workers per session).

**Important:** All limits are enforced per endpoint per session. Different endpoints have different thresholds.

Repeatedly hitting rate limits (or repeatedly triggering high-risk endpoints) may result in a temporary
restriction of your API access while your usage is reviewed.

#### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| X-RateLimit-Limit | integer | No | The maximum number of requests allowed per time window. |
| X-RateLimit-Remaining | integer | No | The number of requests remaining in the current time window. |
| X-RateLimit-Reset | integer | No | The time in seconds until the rate limit resets. |

#### Response Examples

Rate Limit Error (Trial)Rate Limit Error (Account Protection)

```
{
  "message": "You are on a free trial. You can only send 1 message every 1 minute.",
  "retry_after": 60
}
```

[Previous

Error Responses](https://www.wasenderapi.com/api-docs/responses-errors/error-responses)

---

