// LOGICFY: a template sent by a business on the Cloud API (order updates, marketing, Direct Send) reaches a
// Baileys line as `templateMessage`, in one of two formats. Chatwoot only understands plain text and media, so
// the template is flattened into one of those and the existing send path takes it from there.
// Shapes seen on a real line (2026-11-07): see docs_for_ai_context/evolution_api_integration.md in logicfy.

/** content_attributes key that tells Django this came from another business, so the AI stays silent. */
export const BUSINESS_TEMPLATE_FLAG = 'logicfy_business_template';

const MEDIA_TYPES = ['imageMessage', 'videoMessage', 'documentMessage'];

type Format = (text: string) => string;

const clean = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

const buttonLine = (label: unknown, target: unknown): string => {
  const cleanLabel = clean(label);
  const cleanTarget = clean(target);
  return cleanLabel && cleanTarget ? `${cleanLabel}: ${cleanTarget}` : cleanLabel || cleanTarget;
};

const hydratedButtonLines = (buttons: any[] = []): string[] =>
  buttons.map(
    (button) =>
      buttonLine(button?.urlButton?.displayText, button?.urlButton?.url) ||
      buttonLine(button?.callButton?.displayText, button?.callButton?.phoneNumber) ||
      clean(button?.quickReplyButton?.displayText),
  );

const nativeFlowButtonLines = (buttons: any[] = []): string[] =>
  buttons.map((button) => {
    try {
      const params = JSON.parse(button?.buttonParamsJson || '{}');
      return buttonLine(params.display_text, params.url || params.phone_number);
    } catch {
      return '';
    }
  });

const joinBlocks = (blocks: string[], separator = '\n\n'): string => blocks.filter(Boolean).join(separator);

/** Title, body and footer take WhatsApp formatting; button links do not, or `utm_source=a_b` would be mangled. */
const textBlocks = (title: unknown, body: unknown, footer: unknown, buttons: string[], format: Format): string => {
  const cleanTitle = clean(title);
  return joinBlocks([
    cleanTitle ? format(`*${cleanTitle}*`) : '',
    format(clean(body)),
    format(clean(footer)),
    joinBlocks(buttons, '\n'),
  ]);
};

const productTitle = (header: any): string => clean(header?.title) || clean(header?.productMessage?.product?.title);

const carouselCardText = (card: any, format: Format): string =>
  textBlocks(
    productTitle(card?.header),
    clean(card?.body?.text) || clean(card?.header?.productMessage?.product?.description),
    card?.footer?.text,
    nativeFlowButtonLines(card?.nativeFlowMessage?.buttons),
    format,
  );

const hydratedText = (template: any, format: Format): string =>
  textBlocks(
    template.hydratedTitleText,
    template.hydratedContentText,
    template.hydratedFooterText,
    hydratedButtonLines(template.hydratedButtons),
    format,
  );

const interactiveText = (template: any, format: Format): string =>
  joinBlocks([
    textBlocks(
      productTitle(template.header),
      template.body?.text,
      template.footer?.text,
      nativeFlowButtonLines(template.nativeFlowMessage?.buttons),
      format,
    ),
    ...(template.carouselMessage?.cards || []).map((card: any) => carouselCardText(card, format)),
  ]);

/** A header with no `mediaKey` cannot be decrypted, so it stays a text message. */
const findMedia = (holder: any): { type: string; media: any } | null => {
  const type = MEDIA_TYPES.find((name) => holder?.[name]?.mediaKey);
  return type ? { type, media: holder[type] } : null;
};

/**
 * Turns `message.templateMessage` into a plain `{ message, messageType }`. Never returns an empty text message:
 * `noTextFallback` keeps a template of an unknown format visible instead of being dropped.
 */
export function flattenTemplateMessage(
  templateMessage: any,
  noTextFallback: string,
  format: Format = (text) => text,
): { message: any; messageType: string } {
  const hydrated = templateMessage?.hydratedTemplate || templateMessage?.hydratedFourRowTemplate;
  const interactive = templateMessage?.interactiveMessageTemplate;

  let text = '';
  let media: { type: string; media: any } | null = null;
  if (hydrated) {
    text = hydratedText(hydrated, format);
    media = findMedia(hydrated);
  } else if (interactive) {
    text = interactiveText(interactive, format);
    media = findMedia(interactive.header);
  }

  if (media) {
    return { message: { [media.type]: { ...media.media, caption: text } }, messageType: media.type };
  }
  return { message: { conversation: text || noTextFallback }, messageType: 'conversation' };
}
