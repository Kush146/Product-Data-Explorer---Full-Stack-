import { Module } from '@nestjs/common';
import { ScrapeProducer } from './scrape.producer';

@Module({
  providers: [ScrapeProducer],
  exports: [ScrapeProducer],
})
export class QueueModule {}
