/* Run with: npx tsx test/templateMessageEvent.test.ts */
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { ChatwootService } from '../src/api/integrations/chatbot/chatwoot/services/chatwoot.service';
import { BUSINESS_TEMPLATE_FLAG } from '../src/utils/templateMessage';

// The real eventWhatsapp with Chatwoot and WhatsApp replaced by recorders, so no request can leave.
const makeService = (download: () => Promise<any>) => {
  const service: any = Object.create(ChatwootService.prototype);
  const calls: { text: any[]; media: any[] } = { text: [], media: [] };
  service.logger = { info: () => undefined, warn: () => undefined, error: () => undefined, verbose: () => undefined };
  service.provider = {};
  service.waMonitor = { waInstances: { line: { getBase64FromMediaMessage: download } } };
  service.clientCw = async () => ({});
  service.prismaRepository = { message: { findFirst: async () => null } };
  service.createConversationWithRetry = async () => 77;
  service.createMessage = async (...args: any[]) => {
    calls.text.push(args);
    return { id: 1 };
  };
  service.sendData = async (...args: any[]) => {
    calls.media.push(args);
    return { id: 2 };
  };
  return { service, calls };
};

const raw = (templateMessage: any, fromMe = false) => ({
  key: { id: 'ABC', remoteJid: '573215966986@s.whatsapp.net', fromMe },
  messageType: 'templateMessage',
  message: { templateMessage },
});

const textTemplate = { interactiveMessageTemplate: { body: { text: 'Tu *pedido* salió' } } };
const imageTemplate = {
  interactiveMessageTemplate: { body: { text: 'Oferta' }, header: { imageMessage: { mediaKey: 'KEY' } } },
};

test('a text template reaches Chatwoot, formatted and flagged, and the raw message is left alone', async () => {
  const { service, calls } = makeService(async () => null);
  const body = raw(textTemplate);
  const sent = await service.eventWhatsapp('messages.upsert', { instanceName: 'line' }, body);

  assert.deepEqual(sent, { id: 1 });
  assert.equal(calls.text[0][2], 'Tu **pedido** salió');
  assert.equal(calls.text[0][3], 'incoming');
  assert.deepEqual(service.getBusinessTemplateFlag(calls.text[0][6]), { [BUSINESS_TEMPLATE_FLAG]: true });
  assert.equal(body.messageType, 'templateMessage');
  assert.ok(body.message.templateMessage);
});

test('an image template goes as media with its text', async () => {
  const { service, calls } = makeService(async () => ({ base64: 'aGk=', mimetype: 'image/jpeg' }));
  await service.eventWhatsapp('messages.upsert', { instanceName: 'line' }, raw(imageTemplate));

  assert.equal(calls.text.length, 0);
  assert.equal(calls.media[0][4], 'Oferta');
  assert.deepEqual(service.getBusinessTemplateFlag(calls.media[0][6]), { [BUSINESS_TEMPLATE_FLAG]: true });
});

test('a header that will not download still delivers the text', async () => {
  for (const download of [
    async () => {
      throw new Error('media expired');
    },
    async () => null,
  ]) {
    const { service, calls } = makeService(download);
    await service.eventWhatsapp('messages.upsert', { instanceName: 'line' }, raw(imageTemplate));
    assert.equal(calls.media.length, 0);
    assert.equal(calls.text[0][2], 'Oferta');
  }
});

test('a message of our own is not flagged, and a normal message is untouched', async () => {
  const own = makeService(async () => null);
  await own.service.eventWhatsapp('messages.upsert', { instanceName: 'line' }, raw(textTemplate, true));
  assert.equal(own.calls.text[0][3], 'outgoing');
  assert.deepEqual(own.service.getBusinessTemplateFlag(own.calls.text[0][6]), {});

  const normal = makeService(async () => null);
  await normal.service.eventWhatsapp(
    'messages.upsert',
    { instanceName: 'line' },
    { key: { id: 'D', remoteJid: '57300@s.whatsapp.net', fromMe: false }, messageType: 'conversation', message: { conversation: 'Hola *amigo*' } },
  );
  assert.equal(normal.calls.text[0][2], 'Hola **amigo**');
  assert.deepEqual(normal.service.getBusinessTemplateFlag(normal.calls.text[0][6]), {});
});
