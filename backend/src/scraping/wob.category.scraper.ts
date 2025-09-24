import { PlaywrightCrawler } from 'crawlee';

export async function scrapeCategories(url: string) {
  const cats: Array<{ title: string; href: string }> = [];
  const crawler = new PlaywrightCrawler({
    maxConcurrency: 2,
    maxRequestsPerMinute: 40,
    requestHandler: async ({ page }) => {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      
      const links = await page.$$eval('a', as =>
        as.map(a => ({ title: (a.textContent||'').trim(), href: (a as HTMLAnchorElement).href }))
          .filter(x => x.title && x.href && x.href.includes('worldofbooks.com'))
      );
      cats.push(...links);
    },
  });
  await crawler.addRequests([{ url }]);
  await crawler.run();
  return cats;
}
