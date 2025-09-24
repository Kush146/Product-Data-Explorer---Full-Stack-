import { PlaywrightCrawler } from 'crawlee';

export async function scrapeNavigation(startUrl: string) {
  const items: Array<{ title: string; href: string }> = [];
  const crawler = new PlaywrightCrawler({
    maxConcurrency: 2,
    maxRequestsPerMinute: 40,
    requestHandlerTimeoutSecs: 60,
    requestHandler: async ({ page }) => {
      await page.goto(startUrl, { waitUntil: 'domcontentloaded' });
     
      const links = await page.$$eval('header nav a, nav a', as =>
        as.map(a => ({ title: (a.textContent||'').trim(), href: (a as HTMLAnchorElement).href }))
          .filter(x => x.title && x.href)
      );
      items.push(...links);
    },
  });
  await crawler.addRequests([{ url: startUrl }]);
  await crawler.run();
  return items;
}
