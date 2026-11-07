/* Run with: npx tsx test/pacedTaskQueue.test.ts */
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { PacedTaskQueue } from '../src/utils/pacedTaskQueue';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

test('tasks run one at a time, however many chunks add them', async () => {
  const queue = new PacedTaskQueue({ gapMs: 1, onError: () => undefined });
  let inFlight = 0;
  let peak = 0;
  let done = 0;
  const task = async () => {
    inFlight += 1;
    peak = Math.max(peak, inFlight);
    await sleep(2);
    inFlight -= 1;
    done += 1;
  };

  for (let chunk = 0; chunk < 3; chunk++) {
    for (let i = 0; i < 5; i++) queue.add(`${chunk}:${i}`, task);
  }
  await queue.idle();

  assert.equal(peak, 1);
  assert.equal(done, 15);
});

test('tasks are paced by the gap', async () => {
  const queue = new PacedTaskQueue({ gapMs: 20, onError: () => undefined });
  const startedAt: number[] = [];
  for (let i = 0; i < 4; i++) {
    queue.add(String(i), async () => void startedAt.push(Date.now()));
  }
  await queue.idle();

  // A timer may fire a hair early, so allow a little slack under 20ms.
  for (let i = 1; i < startedAt.length; i++) {
    assert.ok(startedAt[i] - startedAt[i - 1] >= 15, `gap ${i} was ${startedAt[i] - startedAt[i - 1]}ms`);
  }
});

test('adding does not wait for the work', async () => {
  const queue = new PacedTaskQueue({ gapMs: 1, onError: () => undefined });
  let finished = false;
  queue.add('slow', async () => {
    await sleep(20);
    finished = true;
  });
  assert.equal(finished, false, 'the caller must not be held up');
  await queue.idle();
  assert.equal(finished, true);
});

test('a contact queued twice runs once, with the newest data', async () => {
  const queue = new PacedTaskQueue({ gapMs: 1, onError: () => undefined });
  const ran: string[] = [];
  queue.add('first', async () => void ran.push('first'));
  queue.add('same', async () => void ran.push('old'));
  queue.add('same', async () => void ran.push('new'));
  await queue.idle();

  assert.deepEqual(ran, ['first', 'new']);
});

test('one failure is reported and the rest still run', async () => {
  const errors: unknown[] = [];
  const queue = new PacedTaskQueue({ gapMs: 1, onError: (_key, error) => errors.push(error) });
  const ran: string[] = [];
  queue.add('bad', async () => {
    throw new Error('Chatwoot said no');
  });
  queue.add('good', async () => void ran.push('good'));
  await queue.idle();

  assert.equal(errors.length, 1);
  assert.deepEqual(ran, ['good']);
});

test('the queue works again after it empties', async () => {
  const queue = new PacedTaskQueue({ gapMs: 1, onError: () => undefined });
  const ran: string[] = [];
  queue.add('a', async () => void ran.push('a'));
  await queue.idle();
  queue.add('b', async () => void ran.push('b'));
  await queue.idle();

  assert.deepEqual(ran, ['a', 'b']);
});
