/**
 * LOGICFY: keep Signal key material and message contents out of the logs, and keep one
 * broken session from flooding them.
 *
 * libsignal writes straight to `console`, with no logger or level to configure:
 * - `Closing session:` and friends print the whole SessionEntry, including `privKey`.
 *   A session is closed on routine re-keying, so this runs on every instance.
 * - each undecryptable message prints a stack trace per session it tried. A record holds
 *   up to 40 closed sessions, so one message can produce a few hundred lines.
 *
 * Patching `console` survives `npm ci` and Baileys upgrades, which a patched copy of
 * libsignal would not. Only the exact prefixes below are touched; everything else passes
 * through unchanged.
 */

const SESSION_DUMP_PREFIXES = [
  'Closing session:',
  'Opening session:',
  'Removing old closed session:',
  'Session already closed',
  'Session already open',
];
const DECRYPT_FAILED = 'Failed to decrypt message with any known session';
const SESSION_ERROR = 'Session error:';
// libsignal names its per-address job queue after the address, so the stack carries it.
const ADDRESS_IN_STACK = /at (?:async )?(\S+) \[as awaitable\]/;

const SUMMARY_INTERVAL_MS = 60_000;

type ConsoleMethod = (...args: unknown[]) => void;

export type DecryptFailureTally = { messages: number; attemptsByAddress: Map<string, number> };

export function createLibsignalFilter(emit: (line: string) => void) {
  let tally: DecryptFailureTally = { messages: 0, attemptsByAddress: new Map() };

  return {
    /** Returns true when the call was handled here and must not reach the real console. */
    intercept(args: unknown[]): boolean {
      const [first, second] = args;
      if (typeof first !== 'string') return false;

      if (SESSION_DUMP_PREFIXES.some((prefix) => first.startsWith(prefix))) return true;

      if (first.startsWith(DECRYPT_FAILED)) {
        tally.messages += 1;
        return true;
      }

      if (first.startsWith(SESSION_ERROR)) {
        const address = (typeof second === 'string' && ADDRESS_IN_STACK.exec(second)?.[1]) || 'unknown';
        tally.attemptsByAddress.set(address, (tally.attemptsByAddress.get(address) ?? 0) + 1);
        return true;
      }

      return false;
    },

    /** Writes one line for the failures seen since the last flush, if there were any. */
    flush() {
      if (tally.messages === 0 && tally.attemptsByAddress.size === 0) return;
      const byAddress = [...tally.attemptsByAddress]
        .sort((a, b) => b[1] - a[1])
        .map(([address, attempts]) => `${address}=${attempts}`)
        .join(' ');
      emit(`[libsignal] decrypt failures: ${tally.messages} messages; session attempts by address: ${byAddress}`);
      tally = { messages: 0, attemptsByAddress: new Map() };
    },
  };
}

export function installLibsignalLogFilter() {
  const realWarn = console.warn.bind(console);
  const filter = createLibsignalFilter((line) => realWarn(line));

  for (const method of ['info', 'warn', 'error'] as const) {
    const real: ConsoleMethod = console[method].bind(console);
    console[method] = (...args: unknown[]) => {
      if (!filter.intercept(args)) real(...args);
    };
  }

  setInterval(() => filter.flush(), SUMMARY_INTERVAL_MS).unref();
}

/**
 * The fields worth logging about a message. Never the body: it holds what the customer
 * wrote plus `messageSecret` and `mediaKey`, and media or text is not needed to follow a
 * message through the logs.
 */
export function messageLogSummary(message: any): string {
  return JSON.stringify({
    id: message?.key?.id,
    remoteJid: message?.key?.remoteJid,
    remoteJidLid: message?.key?.remoteJidLid,
    fromMe: message?.key?.fromMe,
    category: message?.category,
    messageType: message?.messageType ?? Object.keys(message?.message ?? {})[0],
    messageTimestamp: Number(message?.messageTimestamp) || undefined,
    stub: message?.messageStubParameters?.[0],
    retryCount: message?.retryCount,
  });
}
