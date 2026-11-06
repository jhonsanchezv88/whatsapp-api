/**
 * LOGICFY: two stanzas Baileys 7.0.0-rc.9 never acknowledges. WhatsApp waits 50 minutes
 * for the ack, ends the stream naming the stanza, then redelivers it on reconnect. While
 * it is pending the rest of that account's offline queue is withheld, so customer messages
 * arrive hours late and the connection loops every 50 minutes.
 *
 * Remove these when a Baileys release handles both. Upstream: WhiskeySockets/Baileys#2858.
 */
import { isJidMetaAI } from 'baileys';

type AckSocket = {
  ws: { on: (event: string, listener: (node: any) => void) => unknown };
  sendMessageAck: (node: any) => Promise<void>;
};

/**
 * WhatsApp now delivers contacts' statuses to some accounts as a top-level <status> stanza,
 * and Baileys has no handler for that tag. The plain ack is deliberate: a NACK leaves the
 * stanza pending on the server.
 */
export function ackStatusStanzas(client: AckSocket, onError: (error: unknown) => void) {
  client.ws.on('CB:status', (node) => {
    client.sendMessageAck(node).catch(onError);
  });
}

/**
 * Messages from a Meta AI bot JID make decodeMessageNode throw "Unknown message type"
 * before any ack. In the offline queue that throw also leaves `isProcessing` stuck, so no
 * later offline node runs on that connection. Reporting these as ignored makes Baileys
 * answer them first, the same path ignored group messages take.
 */
export function isUnsupportedSender(jid: string | undefined) {
  return !!isJidMetaAI(jid);
}
