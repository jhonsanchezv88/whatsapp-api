/**
 * LOGICFY: runs tasks one at a time with a pause between them, off the caller's path.
 *
 * Built for work that arrives in huge bursts and can wait. Pairing a number delivers its
 * whole contact list in several chunks, so limiting each loop on its own would still let
 * the chunks run in parallel: one queue has to hold all of them.
 */
type PacedTaskQueueOptions = {
  gapMs: number;
  onError: (key: string, error: unknown) => void;
};

export class PacedTaskQueue {
  private readonly pending = new Map<string, () => Promise<unknown>>();
  private draining: Promise<void> | null = null;

  constructor(private readonly options: PacedTaskQueueOptions) {}

  /** Queues a task and returns at once. A task already waiting under this key is replaced. */
  add(key: string, task: () => Promise<unknown>) {
    this.pending.set(key, task);
    this.draining ??= this.drain();
  }

  get size() {
    return this.pending.size;
  }

  /** Resolves when nothing is left to run. */
  async idle() {
    while (this.draining) await this.draining;
  }

  private async drain() {
    // The first await keeps add() synchronous for its caller.
    await this.pause();
    for (const [key, task] of this.pending) {
      this.pending.delete(key);
      try {
        await task();
      } catch (error) {
        this.options.onError(key, error);
      }
      if (this.pending.size) await this.pause();
    }
    this.draining = null;
  }

  private pause() {
    return new Promise((resolve) => setTimeout(resolve, this.options.gapMs));
  }
}
