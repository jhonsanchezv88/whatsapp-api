/* Run with: npx tsx test/baileysStanzaFixes.test.ts
 * Uses a real Baileys socket with its websocket stubbed as open. An ack is logged before it
 * is written, so the "sent ack" log line is what these tests read. */
import assert from 'node:assert/strict';
import { after, test } from 'node:test';

import makeWASocket, { initAuthCreds } from 'baileys';
import P from 'pino';

import { ackStatusStanzas, isUnsupportedSender } from '../src/utils/baileysStanzaFixes';

const sockets: any[] = [];

function makeSocket(shouldIgnoreJid: (jid: string) => boolean = () => false, open = true) {
  const lines: any[] = [];
  const logger = P({ level: 'debug' }, { write: (line: string) => void lines.push(JSON.parse(line)) });
  const creds = initAuthCreds();
  creds.me = { id: '1234567890:1@s.whatsapp.net', lid: '999:1@lid', name: 'Test' };
  const memoryKeys = { get: async () => ({}), set: async () => undefined } as any;
  const sock: any = makeWASocket({
    auth: { creds, keys: memoryKeys },
    logger: logger as any,
    waWebSocketUrl: 'ws://127.0.0.1:9/ws',
    shouldIgnoreJid,
    retryRequestDelayMs: 0,
    fireInitQueries: false,
  } as any);
  sockets.push(sock);
  sock.ws.on('error', () => undefined);
  if (open) {
    // The offline queue only runs while the socket reports open.
    Object.defineProperty(sock.ws, 'isOpen', { get: () => true });
    // Baileys captures ws.send when the socket is created, so stub the socket underneath it.
    sock.ws.socket = { send: (_data: unknown, callback: () => void) => callback(), close: () => undefined };
  }
  sock.ev.on('connection.update', () => undefined);
  const sentAcks = () => lines.filter((line) => line.msg === 'sent ack').map((line) => line.sent);
  return { sock, lines, sentAcks };
}

const settle = () => new Promise((resolve) => setTimeout(resolve, 60));

const statusStanza = (offline: string | undefined) => ({
  tag: 'status',
  attrs: { id: '3A20', from: '5511999999999@s.whatsapp.net', type: 'media', ...(offline ? { offline } : {}) },
});
const botStanza = { tag: 'message', attrs: { id: 'BOT1', from: '180705@bot', type: 'text', offline: '1' } };
// An offline customer message with nothing to decrypt: Baileys acks it once a working queue reaches it.
const laterStanza = { tag: 'message', attrs: { id: 'NEXT', from: '5511999999999@s.whatsapp.net', type: 'text', offline: '1' } };

after(() => {
  for (const sock of sockets) {
    try {
      sock.end(new Error('test finished'));
    } catch {
      // A socket that never connected may refuse to close; nothing depends on it.
    }
  }
});

test('control: stock Baileys never acks a <status> stanza', async () => {
  const { sock, sentAcks } = makeSocket();
  sock.ws.emit('CB:status', statusStanza(undefined));
  await settle();
  assert.deepEqual(sentAcks(), []);
});

for (const offline of [undefined, '1']) {
  test(`a <status> stanza gets a plain ack (offline=${offline})`, async () => {
    const { sock, sentAcks } = makeSocket();
    ackStatusStanzas(sock, () => undefined);
    sock.ws.emit('CB:status', statusStanza(offline));
    await settle();
    assert.deepEqual(sentAcks(), [
      { id: '3A20', to: '5511999999999@s.whatsapp.net', class: 'status', type: 'media' },
    ]);
  });
}

test('a failed ack reaches the error handler instead of crashing the process', async () => {
  const { sock } = makeSocket(undefined, false);
  const errors: unknown[] = [];
  ackStatusStanzas(sock, (error) => errors.push(error));
  sock.ws.emit('CB:status', statusStanza(undefined));
  await settle();
  assert.equal(errors.length, 1, 'the socket is closed here, so the send fails');
});

test('control: a @bot message throws and kills the offline queue', async () => {
  const { sock, lines, sentAcks } = makeSocket();
  sock.ws.emit('CB:message', botStanza);
  await settle();
  sock.ws.emit('CB:receipt', laterStanza);
  await settle();
  assert.deepEqual(sentAcks(), [], 'neither the bot message nor the node after it was handled');
  const failure = lines.find((line) => /processing offline nodes/.test(line.msg ?? ''));
  assert.ok(failure, 'expected the same log line production shows');
});

test('with @bot ignored, its message is answered and the queue keeps running', async () => {
  const { sock, lines, sentAcks } = makeSocket(isUnsupportedSender);
  sock.ws.emit('CB:message', botStanza);
  await settle();
  sock.ws.emit('CB:receipt', laterStanza);
  await settle();
  const acks = sentAcks();
  assert.equal(acks[0].id, 'BOT1');
  assert.equal(acks[0].error, '500', 'same NACK that ignored group messages get');
  assert.ok(acks.some((ack: any) => ack.id === 'NEXT'), 'the next offline node was processed');
  assert.ok(!lines.some((line) => /processing offline nodes/.test(line.msg ?? '')));
});

test('only @bot senders are treated as unsupported', () => {
  assert.equal(isUnsupportedSender('180705@bot'), true);
  for (const jid of ['5511@s.whatsapp.net', '4530@lid', '4530:99@hosted.lid', '1@g.us', undefined]) {
    assert.equal(isUnsupportedSender(jid), false);
  }
});
