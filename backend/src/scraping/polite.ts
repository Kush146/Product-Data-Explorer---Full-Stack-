export const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

export function jitteredDelay(minMs = 300, maxMs = 800) {
  const ms = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return sleep(ms);
}

type RetryOpts = { retries?: number; baseMs?: number; factor?: number; maxMs?: number };
export async function withRetry<T>(fn: () => Promise<T>, opts: RetryOpts = {}) {
  const { retries = 3, baseMs = 300, factor = 2, maxMs = 3000 } = opts;
  let attempt = 0;
  while (true) {
    try { return await fn(); }
    catch (e) {
      attempt++;
      if (attempt > retries) throw e;
      const backoff = Math.min(baseMs * Math.pow(factor, attempt - 1), maxMs);
      await sleep(backoff + Math.floor(Math.random() * 250));
    }
  }
}
