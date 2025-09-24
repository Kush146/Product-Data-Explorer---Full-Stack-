import { PlaywrightCrawler } from 'crawlee';

export type ListItem = {
  sourceId: string;
  title: string;
  author?: string|null;
  price?: number|null;
  currency?: string|null;
  imageUrl?: string|null;
  sourceUrl: string;
};

export async function scrapeProductList(url: string) {
  const items: ListItem[] = [];
  const crawler = new PlaywrightCrawler({
    maxConcurrency: 2,
    maxRequestsPerMinute: 40,
    requestHandler: async ({ page }) => {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      const data = await page.$$eval('[data-product-id], .product, li', cards => {
        const out: any[] = [];
        for (const card of cards) {
          const a = card.querySelector('a');
          const title = card.querySelector('h3, .title, [itemprop="name"]')?.textContent?.trim() || '';
          if (!title) continue;
          const img = card.querySelector('img') as HTMLImageElement | null;
          const author = card.querySelector('.author, [itemprop="author"]')?.textContent?.trim() || null;
          const priceText = card.querySelector('.price, [itemprop="price"], .Price')?.textContent || '';
          const price = parseFloat((priceText.match(/[0-9]+(?:\.[0-9]{1,2})?/)||[''])[0]);
          const href = (a as HTMLAnchorElement | null)?.href || '';
          const sid = (card as HTMLElement).getAttribute('data-product-id') || href;
          out.push({
            sourceId: sid || href,
            title,
            author,
            price: isNaN(price) ? null : price,
            currency: 'GBP',
            imageUrl: img?.src || null,
            sourceUrl: href,
          });
        }
        return out;
      });
      items.push(...data);
    },
  });
  await crawler.addRequests([{ url }]);
  await crawler.run();
  return items;
}
