import { PlaywrightCrawler } from 'crawlee';

export async function scrapeProductDetail(url: string) {
  let detail: any = null;
  const reviews: Array<{author?: string; rating?: number; text?: string; created_at?: string}> = [];
  const crawler = new PlaywrightCrawler({
    maxRequestsPerMinute: 30,
    requestHandler: async ({ page }) => {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      const title = (await page.locator('h1, [itemprop="name"]').first().textContent().catch(()=>''))?.trim() || '';
      const description = (await page.locator('#description, .description, [itemprop="description"]').first().textContent().catch(()=>''))?.trim() || '';
      const ratingText = (await page.locator('[itemprop="ratingValue"], .rating').first().textContent().catch(()=>'')) || '';
      const ratingsAvg = parseFloat((ratingText.match(/[0-9.]+/)||['0'])[0]);
      detail = { title, description, ratingsAvg, reviewsCount: reviews.length };
      // TODO: parse reviews and related when selectors confirmed
    },
  });
  await crawler.addRequests([{ url }]);
  await crawler.run();
  return { detail, reviews };
}
