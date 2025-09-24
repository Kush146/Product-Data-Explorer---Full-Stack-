import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { redis } from './redis.provider';
import { createHash } from 'crypto';

export type ScrapePayload = {
  targetType: 'navigation' | 'category' | 'product';
  targetUrl: string;
  categoryPath?: string;
};

const queue = new Queue<ScrapePayload>('scrape', { connection: redis });

@Injectable()
export class ScrapeProducer {
  async enqueue(payload: ScrapePayload) {
    const jobId = createHash('sha1')
      .update(`${payload.targetType}:${payload.targetUrl}:${payload.categoryPath ?? ''}`)
      .digest('hex');
    await queue.add('scrape', payload, {
      jobId,
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: 500,
      removeOnFail: 500,
    });
    return { jobId };
  }
}
