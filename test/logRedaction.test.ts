/* Run with: npx tsx test/logRedaction.test.ts
 * Drives the real libsignal, so a libsignal upgrade that changes its log lines fails here. */
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createLibsignalFilter, installLibsignalLogFilter, messageLogSummary } from '../src/utils/logRedaction';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const libsignal = require('libsignal');

const SECRET = Buffer.from('c0ffeec0ffeec0ffeec0ffeec0ffeec0', 'hex');

function makeSession(baseKey: number) {
  const session = libsignal.SessionRecord.createEntry();
  session.registrationId = 1;
  session.currentRatchet = {
    ephemeralKeyPair: { pubKey: Buffer.alloc(33, 5), privKey: SECRET },
    lastRemoteEphemeralKey: Buffer.alloc(33, 6),
    previousCounter: 0,
    rootKey: SECRET,
  };
  session.indexInfo = {
    baseKey: Buffer.alloc(33, baseKey),
    baseKeyType: 1,
    closed: -1,
    used: Date.now(),
    created: Date.now(),
    remoteIdentityKey: Buffer.alloc(33, 7),
  };
  return session;
}

const printed: string[] = [];
for (const method of ['info', 'warn', 'error'] as const) {
  console[method] = (...args: unknown[]) => void printed.push(args.map(String).join(' '));
}
installLibsignalLogFilter();

test('closing and opening a real session prints no key material', () => {
  printed.length = 0;
  const record = new libsignal.SessionRecord();
  const session = makeSession(1);
  record.setSession(session);
  record.closeSession(session);
  record.closeSession(session); // "Session already closed" also dumps the entry
  record.openSession(session);
  assert.deepEqual(printed, []);
});

test('a real failed decrypt is tallied per address, without its stack traces', async () => {
  printed.length = 0;
  const record = new libsignal.SessionRecord();
  for (const key of [1, 2, 3]) {
    const session = makeSession(key);
    record.setSession(session);
    record.closeSession(session);
  }
  const storage = { loadSession: async () => record, storeSession: async () => undefined };
  const address = new libsignal.ProtocolAddress('111_1', 0);
  const cipher = new libsignal.SessionCipher(storage, address);
  cipher.doDecryptWhisperMessage = async () => {
    throw new Error('Bad MAC');
  };
  await assert.rejects(cipher.decryptWhisperMessage(Buffer.from([1, 2, 3])), /No matching sessions/);
  assert.deepEqual(printed, []);

  // Same failure against a fresh filter, to read the tally from libsignal's real stack traces.
  const lines: string[] = [];
  const filter = createLibsignalFilter((line) => lines.push(line));
  const installed = console.error;
  console.error = (...args: unknown[]) => void filter.intercept(args);
  await assert.rejects(cipher.decryptWhisperMessage(Buffer.from([1, 2, 3])), /No matching sessions/);
  console.error = installed;
  filter.flush();
  assert.deepEqual(lines, ['[libsignal] decrypt failures: 1 messages; session attempts by address: 111_1.0=3']);
  filter.flush();
  assert.equal(lines.length, 1, 'a quiet minute prints nothing');
});

test('other console output is untouched', () => {
  printed.length = 0;
  console.info('Decrypted message with closed session.');
  console.error('some other error', { closed: 1 });
  assert.equal(printed.length, 2);
});

test('the message summary leaves out text and keys', () => {
  const summary = messageLogSummary({
    key: { id: 'ABC', remoteJid: '1@lid', fromMe: false },
    pushName: 'NAME_MARKER',
    message: {
      conversation: 'TEXT_MARKER',
      messageContextInfo: { messageSecret: 'SECRET_MARKER' },
    },
    messageStubParameters: ['No matching sessions found for message'],
  });
  assert.doesNotMatch(summary, /MARKER/);
  assert.match(summary, /"id":"ABC"/);
  assert.match(summary, /No matching sessions/);
});
