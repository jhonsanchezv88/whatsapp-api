# Logicfy modifications to Evolution API

_Last updated: 2026-09-01. Fork of Evolution API v2.3.7 (`jhonsanchezv88/whatsapp-api`)._

This is the authoritative list of every change this fork carries on top of upstream
Evolution API. **Read it before merging upstream** — these are the sites that will
conflict, and each entry says why the change exists so a conflict can be resolved on
purpose instead of by accident. Convention mirrors the Chatwoot fork's
`docs_for_ai_context/chatwoot_source_modifications.md` in the logicfy repo.

**When you change this fork: add or update the entry here in the same commit.**

---

## 1. LID identity handling (the load-bearing ones)

### Keep the LID when swapping in the phone JID — `2eee449c`
`src/api/integrations/channel/whatsapp/whatsapp.baileys.service.ts` (~line 1484)

When a message arrives addressed by LID with `remoteJidAlt` (the phone), upstream
overwrites `key.remoteJid` with the phone JID and **discards the LID** — the only copy
of the phone↔LID pairing WhatsApp will ever volunteer. We stash it first:
`key.remoteJidLid = <lid jid>`. logicfy's `_link_evolution_identities()` reads it to
merge contact identities; remove this and contacts silently split into two rows again.
Also declares `remoteJidLid?: string` on the key type (~line 160).

### Resolve the phone for LID-only messages from Baileys' mapping store — 2026-09-01
`src/api/integrations/channel/whatsapp/whatsapp.baileys.service.ts` (messages.upsert,
just before the LID swap)

A LID-addressed message often carries no `remoteJidAlt` even though Baileys already
knows the phone (`signalRepository.lidMapping.getPNForLID`, learned from contact sync
and earlier traffic). We fill `remoteJidAlt` from the store so the swap below runs and
the Chatwoot contact is created WITH the phone number instead of as a phone-less
`<lid>@lid` record. Best-effort — an unknown mapping changes nothing.

### Reuse the LID-keyed Chatwoot contact for phone-addressed messages — 2026-09-01
`src/api/integrations/chatbot/chatwoot/services/chatwoot.service.ts`
(`createConversation`, after the `findContact(chatId)` miss)

A customer whose Chatwoot contact is keyed by LID (`identifier "<lid>@lid"`, no
phone_number) can still produce phone-addressed messages — typically the owner's own
fromMe reply, where WhatsApp reveals the phone even though the customer's messages never
did. Upstream then creates a SECOND, phone-keyed contact and conversation next to the
one the AI conversation lives in (logicfy production conv #111/#112). We look the
contact up by `key.remoteJidLid` via `findContactByIdentifier()` before creating, reuse
it, and teach it the phone (`phone_number: +<phone>`) so future phone lookups also
resolve to it. **The `identifier` deliberately stays `<lid>@lid`** — logicfy's manual
LID delivery finds the contact by that identifier; changing it re-splits the customer.

## 2. Chatwoot integration reliability

### Retry conversation resolution instead of dropping inbound messages — `21f6c60a`
`chatwoot.service.ts` — `createConversationWithRetry()` wraps `createConversation()`
with exponential backoff. Upstream swallowed transport errors, returned null once, and
the customer's message was silently dropped.

### Record chatwootMessageId for fromMe; don't abort on video S3 skip — `6c3214c4`
`whatsapp.baileys.service.ts` — fromMe messages now carry their Chatwoot message id
(logicfy's AI-echo detection matches on it), and a skipped S3 video upload no longer
aborts the whole message handler.

### Reject invalid import DB URI — `683b83e2`
`chatwoot.service.ts` — a malformed `CHATWOOT_IMPORT_DATABASE_CONNECTION_URI` produced
endless `getaddrinfo ENOTFOUND` noise; now rejected up front.

### Stringify non-Error objects in the send-error note — `bcf7f6bb`
`chatwoot.service.ts` — one-liner; error notes posted to Chatwoot showed
`[object Object]`.

## 3. Latency & logging

### Remove the 500ms webhook delay; log Chatwoot→Evolution latency — `c5eadf05`
`chatwoot.service.ts` — upstream slept 500ms before handling every Chatwoot webhook.

### Timing logs for Chatwoot→WhatsApp delivery — `594a6bab`, `c4f8022f`
`whatsapp.baileys.service.ts`, `chatwoot.service.ts` — `logger.info`-level timing
around the outbound path, added while hunting a delivery delay.

## 4. Configuration

### `CHATWOOT_DISABLE_TYPING` env var — `21c466d0`
`evolution.channel.service.ts`, `whatsapp.baileys.service.ts`, `src/config/env.config.ts`
— skips the Chatwoot typing indicator on both channels when set.

---

## Upstream merge checklist

1. `git log --oneline upstream/main..develop` — every commit above should be
   re-verifiable after the merge.
2. Conflicts in `whatsapp.baileys.service.ts` around the messages.upsert handler: keep
   the `remoteJidLid` stash **before** `sendDataWebhook`/`chatbotController.emit`.
3. Conflicts in `chatwoot.service.ts` `createConversation`: keep both the retry wrapper
   and the LID-contact reuse block.
4. Grep for `LOGICFY:` — all inline fork comments carry that marker.
5. Update this file's entries and date.

## `chatwoot.service.ts` — `createConversation`: unmapped-LID fallback (2026-09-03)

`phoneNumber` is `remoteJidAlt` for LID-addressed messages, and `remoteJidAlt` only
exists when the phone behind the LID is known. For a LID-only sender it was
`undefined`, and the chatId derivation (`phoneNumber.split('@')`) threw — five retries,
then `DROPPED MESSAGE`, for **every inbound message** from such a customer. Introduced
by upstream's `946dcaeb` LID handling; surfaced when staging first deployed develop
HEAD after the Railway migration. The fix falls back to the LID itself
(`remoteJidAlt || remoteJid`), restoring the long-standing file-under-LID behaviour
the logicfy pipeline already handles. Marked `LOGICFY:` inline.

## `chatwoot.service.ts` — `waitForAttachment`: outbound media upload race (2026-09-03)

Chatwoot fires the message webhook at commit, but the attachment's upload to object
storage (R2) can complete moments later — the storage 404s if fetched immediately.
Over the public internet the cross-project latency hid the race; on Railway private
networking Evolution fetches within ~300ms and loses it, so **every real photo/video
sent from Chatwoot failed** (AxiosError 404) and never reached WhatsApp. `sendAttachment`
is now preceded by `waitForAttachment(data_url)`: a cheap Range-probe with backoff
(0/0.3/0.7/1.5/3/6s); on timeout it proceeds and lets the existing error handling fire,
so a genuinely missing file still surfaces as before.
