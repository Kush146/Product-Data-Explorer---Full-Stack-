import { Controller, Get, Query } from '@nestjs/common';
import { ScrapeProducer } from '../queue/scrape.producer';


@Controller('scrape')  
export class ScrapeController {
  constructor(private producer: ScrapeProducer) {}

  @Get('navigation')
  nav(@Query('url') url = 'https://www.worldofbooks.com/') {
    return this.producer.enqueue({ targetType: 'navigation', targetUrl: url });
  }

  @Get('category')
  category(@Query('url') url: string, @Query('categoryPath') categoryPath?: string) {
    if (!url) return { error: 'url is required' };
    return this.producer.enqueue({ targetType: 'category', targetUrl: url, categoryPath });
  }

  @Get('product')
  product(@Query('url') url: string) {
    if (!url) return { error: 'url is required' };
    return this.producer.enqueue({ targetType: 'product', targetUrl: url });
  }
}
