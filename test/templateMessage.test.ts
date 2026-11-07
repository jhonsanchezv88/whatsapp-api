/* Run with: npx tsx test/templateMessage.test.ts */
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { flattenTemplateMessage } from '../src/utils/templateMessage';

const FALLBACK = 'No readable text';
const ctaButton = (label: string, url: string) => ({
  name: 'cta_url',
  buttonParamsJson: JSON.stringify({ display_text: label, url, landing_page_url: 'https://ignored.example' }),
});
const image = { url: 'https://mmg.example/x', mediaKey: 'KEY', mimetype: 'image/jpeg' };

test('a Direct Send message: interactive template with only a body', () => {
  const result = flattenTemplateMessage(
    {
      templateId: '1109754848630375',
      interactiveMessageTemplate: { body: { text: 'Tu pedido salió' }, nativeFlowMessage: { buttons: [] } },
    },
    FALLBACK,
  );
  assert.deepEqual(result, { message: { conversation: 'Tu pedido salió' }, messageType: 'conversation' });
});

test('a marketing template: image header, footer and a link button keep everything', () => {
  const result = flattenTemplateMessage(
    {
      interactiveMessageTemplate: {
        body: { text: 'Oferta' },
        footer: { text: 'Cancela cuando quieras' },
        header: { imageMessage: image, hasMediaAttachment: true },
        nativeFlowMessage: { buttons: [ctaButton('Comprar', 'https://shop.example/?utm_source=a_b')] },
      },
    },
    FALLBACK,
  );
  assert.equal(result.messageType, 'imageMessage');
  assert.equal(result.message.imageMessage.mediaKey, 'KEY');
  assert.equal(
    result.message.imageMessage.caption,
    'Oferta\n\nCancela cuando quieras\n\nComprar: https://shop.example/?utm_source=a_b',
  );
});

test('a video header stays a video', () => {
  const result = flattenTemplateMessage(
    { interactiveMessageTemplate: { body: { text: 'Mira' }, header: { videoMessage: { mediaKey: 'K' } } } },
    FALLBACK,
  );
  assert.equal(result.messageType, 'videoMessage');
  assert.equal(result.message.videoMessage.caption, 'Mira');
});

test('a hydrated template: title, body, footer, and URL, call and quick-reply buttons', () => {
  const result = flattenTemplateMessage(
    {
      hydratedTemplate: {
        hydratedTitleText: 'Factura',
        hydratedContentText: 'Vence mañana',
        hydratedFooterText: 'Banco',
        hydratedButtons: [
          { index: 0, urlButton: { displayText: 'Pagar', url: 'https://pay.example' } },
          { index: 1, callButton: { displayText: 'Llamar', phoneNumber: '+573001112222' } },
          { index: 2, quickReplyButton: { displayText: 'Ya pagué' } },
        ],
      },
    },
    FALLBACK,
    (text) => text.replace(/\*(.+)\*/, '**$1**'),
  );
  assert.equal(
    result.message.conversation,
    '**Factura**\n\nVence mañana\n\nBanco\n\nPagar: https://pay.example\nLlamar: +573001112222\nYa pagué',
  );
});

test('formatting reaches the text but never a button link', () => {
  const result = flattenTemplateMessage(
    {
      interactiveMessageTemplate: {
        body: { text: 'Hola' },
        nativeFlowMessage: { buttons: [ctaButton('Ver', 'https://x.example/a_b_c')] },
      },
    },
    FALLBACK,
    (text) => text.toUpperCase(),
  );
  assert.equal(result.message.conversation, 'HOLA\n\nVer: https://x.example/a_b_c');
});

test('a hydrated image template keeps its image', () => {
  const result = flattenTemplateMessage(
    { hydratedTemplate: { hydratedContentText: 'Hola', imageMessage: image, hydratedButtons: [] } },
    FALLBACK,
  );
  assert.equal(result.messageType, 'imageMessage');
  assert.equal(result.message.imageMessage.caption, 'Hola');
});

test('a product carousel lists every card as text', () => {
  const card = (title: string, description?: string) => ({
    header: { productMessage: { product: { title, description } } },
    nativeFlowMessage: { buttons: [ctaButton('Ver', `https://x.example/${title}`)] },
  });
  const result = flattenTemplateMessage(
    {
      interactiveMessageTemplate: {
        body: { text: 'Novedades' },
        header: { title: '' },
        carouselMessage: { cards: [card('Reloj', 'Azul'), card('Bolso')] },
      },
    },
    FALLBACK,
    (text) => text,
  );
  assert.equal(
    result.message.conversation,
    'Novedades\n\n*Reloj*\n\nAzul\n\nVer: https://x.example/Reloj\n\n*Bolso*\n\nVer: https://x.example/Bolso',
  );
});

test('a header with no media key cannot be downloaded, so the text goes alone', () => {
  const result = flattenTemplateMessage(
    { interactiveMessageTemplate: { body: { text: 'Hola' }, header: { imageMessage: { url: 'https://x' } } } },
    FALLBACK,
  );
  assert.deepEqual(result, { message: { conversation: 'Hola' }, messageType: 'conversation' });
});

test('an unknown format or broken button is still shown, never dropped', () => {
  assert.equal(flattenTemplateMessage({ fourRowTemplate: {} }, FALLBACK).message.conversation, FALLBACK);
  assert.equal(flattenTemplateMessage(undefined, FALLBACK).message.conversation, FALLBACK);
  const broken = flattenTemplateMessage(
    {
      interactiveMessageTemplate: {
        body: { text: 'Hola' },
        nativeFlowMessage: { buttons: [{ name: 'cta_url', buttonParamsJson: '{not json' }] },
      },
    },
    FALLBACK,
  );
  assert.equal(broken.message.conversation, 'Hola');
});
