import 'reflect-metadata';
import { Worker, Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { redis } from '../queue/redis.provider';

import { scrapeNavigation } from './wob.nav.scraper';
import { scrapeCategories } from './wob.category.scraper';
import { scrapeProductList } from './wob.product-list.scraper';
import { scrapeProductDetail } from './wob.product-detail.scraper';
import { jitteredDelay, withRetry } from './polite';

type Payload = {
  targetType: 'navigation' | 'category' | 'product';
  targetUrl: string;
  categoryPath?: string; // e.g. "books/fiction/classics"
};

const prisma = new PrismaClient();

async function resolveCategoryIdFromPath(categoryPath?: string) {
  if (!categoryPath) return { navId: null as string | null, categoryId: null as string | null };

  const parts = categoryPath.split('/').filter(Boolean);
  const navSlug = parts.shift();
  if (!navSlug) return { navId: null, categoryId: null };

  const nav = await prisma.navigation.findUnique({ where: { slug: navSlug } });
  if (!nav) return { navId: null, categoryId: null };

  let parentId: string | null = null;
  for (const slug of parts) {
    const cat: { id: string } | null = await prisma.category.findFirst({
      where: {
        navigationId: nav.id,
        slug,
        parentId: parentId ?? undefined, // pass undefined when no parent
      },
      select: { id: true },
    });
    if (!cat) return { navId: nav.id, categoryId: null };
    parentId = cat.id;
  }
  return { navId: nav.id, categoryId: parentId };
}

async function handle(job: Job<Payload>) {
  const { targetType, targetUrl, categoryPath } = job.data;
  const now = new Date();
  const dedupeKey = String(job.id);

  await prisma.scrapeJob.upsert({
    where: { dedupeKey },
    update: { status: 'running', startedAt: now },
    create: { dedupeKey, targetType, targetUrl, status: 'running', startedAt: now },
  });

  try {
    // NAVIGATION ROOT SCRAPE
    if (targetType === 'navigation') {
      const navs = await withRetry(() => scrapeNavigation(targetUrl));
      for (const n of navs) {
        await jitteredDelay();
        const slug = n.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        await prisma.navigation.upsert({
          where: { slug },
          update: { title: n.title, lastScrapedAt: new Date() },
          create: { slug, title: n.title, lastScrapedAt: new Date() },
        });
      }
    }

    // CATEGORY (SUBCATS + PRODUCT LIST)
    if (targetType === 'category') {
      const { navId, categoryId: leafId } = await resolveCategoryIdFromPath(categoryPath);
      let resolvedCategoryId = leafId;

      if (navId) {
        const parentId = resolvedCategoryId ?? null;

        const subcats = await withRetry(() => scrapeCategories(targetUrl));
        for (const sc of subcats) {
          await jitteredDelay();
          const slug = sc.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
          const existing = await prisma.category.findFirst({
            where: { navigationId: navId, slug, parentId: { equals: parentId } },
            select: { id: true },
          });

          const data = {
            navigationId: navId,
            parentId,
            title: sc.title,
            slug,
            sourceUrl: sc.href,
            lastScrapedAt: new Date(),
          };

          if (existing) {
            await prisma.category.update({ where: { id: existing.id }, data });
          } else {
            const created = await prisma.category.create({ data });
            if (!resolvedCategoryId) resolvedCategoryId = created.id;
          }
        }

        if (resolvedCategoryId) {
          await prisma.category.update({
            where: { id: resolvedCategoryId },
            data: { sourceUrl: targetUrl, lastScrapedAt: new Date() },
          });
        } else {
          await prisma.navigation.update({
            where: { id: navId },
            data: { lastScrapedAt: new Date() },
          });
        }
      }

      const items = await withRetry(() => scrapeProductList(targetUrl));
      for (const p of items) {
        await jitteredDelay();
        await prisma.product.upsert({
          where: { sourceId: p.sourceId },
          update: {
            title: p.title,
            author: p.author ?? undefined,
            price: p.price ?? undefined,
            currency: p.currency ?? undefined,
            imageUrl: p.imageUrl ?? undefined,
            sourceUrl: p.sourceUrl,
            categoryId: resolvedCategoryId,
            lastScrapedAt: new Date(),
          },
          create: {
            sourceId: p.sourceId,
            title: p.title,
            author: p.author ?? undefined,
            price: p.price ?? undefined,
            currency: p.currency ?? undefined,
            imageUrl: p.imageUrl ?? undefined,
            sourceUrl: p.sourceUrl,
            categoryId: resolvedCategoryId,
            lastScrapedAt: new Date(),
          },
        });
      }

      if (resolvedCategoryId) {
        const totalForCat = await prisma.product.count({ where: { categoryId: resolvedCategoryId } });
        await prisma.category.update({
          where: { id: resolvedCategoryId },
          data: { lastScrapedAt: new Date(), productCount: totalForCat },
        });
      }
    }

    // ONE PRODUCT DETAIL
    if (targetType === 'product') {
      const { detail, reviews } = await withRetry(() => scrapeProductDetail(targetUrl));
      if (detail?.title) {
        const sid = targetUrl;
        const prod = await prisma.product.upsert({
          where: { sourceUrl: targetUrl },
          update: { title: detail.title, lastScrapedAt: new Date() },
          create: {
            sourceId: sid,
            sourceUrl: targetUrl,
            title: detail.title,
            currency: 'GBP',
            lastScrapedAt: new Date(),
          },
        });

        await prisma.productDetail.upsert({
          where: { productId: prod.id },
          update: {
            description: detail.description ?? undefined,
            ratingsAvg: Number(detail.ratingsAvg) || 0,
            reviewsCount: Number(detail.reviewsCount) || 0,
          },
          create: {
            productId: prod.id,
            description: detail.description ?? undefined,
            ratingsAvg: Number(detail.ratingsAvg) || 0,
            reviewsCount: Number(detail.reviewsCount) || 0,
          },
        });

        if (reviews?.length) {
          for (const r of reviews.slice(0, 20)) {
            await jitteredDelay();
            await prisma.review
              .create({
                data: {
                  productId: prod.id,
                  author: r.author ?? undefined,
                  rating: typeof r.rating === 'number' ? r.rating : undefined,
                  text: r.text ?? undefined,
                },
              })
              .catch(() => {});
          }
        }
      }
    }

    await prisma.scrapeJob.update({
      where: { dedupeKey },
      data: { status: 'succeeded', finishedAt: new Date() },
    });
  } catch (e: any) {
    await prisma.scrapeJob.update({
      where: { dedupeKey },
      data: { status: 'failed', finishedAt: new Date(), errorLog: String(e?.stack || e) },
    });
    throw e;
  }
}

new Worker<Payload>('scrape', handle, {
  connection: redis,
  concurrency: 2,
});
