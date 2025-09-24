import { Injectable } from '@nestjs/common';
import { PrismaService } from '../db/prisma.service';
import type { Category } from '@prisma/client';
import { ScrapeProducer } from '../queue/scrape.producer';

@Injectable()
export class NavigationService {
  constructor(
    private prisma: PrismaService,
    private producer: ScrapeProducer,
  ) {}

  list() {
    return this.prisma.navigation.findMany({ orderBy: { title: 'asc' } });
  }

  async childrenByPath(categoryPath?: string, force = false) {
    const metaBase = {
      isStale: false,
      enqueued: false,
      candidateUrl: undefined as string | undefined,
      ttlHours: this.ttlHours(),
      lastScrapedAt: null as Date | null,
    };

    if (!categoryPath) return { breadcrumb: [], children: [], meta: metaBase };

    const parts = categoryPath.split('/').filter(Boolean);
    const navSlug = parts.shift();
    if (!navSlug) return { breadcrumb: [], children: [], meta: metaBase };

    const nav = await this.prisma.navigation.findUnique({ where: { slug: navSlug } });
    if (!nav) return { breadcrumb: [], children: [], meta: metaBase };

    let parentId: string | null = null;
    for (const slug of parts) {
      const cat: Category | null = await this.prisma.category.findFirst({
        where: { navigationId: nav.id, slug, parentId: parentId ?? null },
      });
      if (!cat) {
        const breadcrumb = await this.buildBreadcrumb(nav.id, parentId);
        return { breadcrumb, children: [], meta: metaBase };
      }
      parentId = cat.id;
    }

    const children = await this.prisma.category.findMany({
      where: { navigationId: nav.id, parentId: parentId ?? null },
      orderBy: { title: 'asc' },
    });

    const parentCat = parentId ? await this.prisma.category.findUnique({ where: { id: parentId } }) : null;

    const lastTouched = await this.latestScrapeTimestamp(nav.id, parentId, children);
    const isStale = this.isStale(lastTouched) || children.length === 0;

    let enqueued = false;
    const candidateUrl = parentCat?.sourceUrl ?? this.candidateCategoryUrl(categoryPath);
    if ((force || isStale) && candidateUrl) {
      try {
        await this.producer.enqueue({ targetType: 'category', targetUrl: candidateUrl, categoryPath });
        enqueued = true;
      } catch {}
    }

    const breadcrumb = await this.buildBreadcrumb(nav.id, parentId);
    return {
      breadcrumb,
      children,
      meta: {
        isStale,
        enqueued,
        candidateUrl,
        ttlHours: this.ttlHours(),
        lastScrapedAt: lastTouched ?? null,
      },
    };
  }

  private async buildBreadcrumb(navigationId: string, categoryId: string | null) {
    const trail: Array<{ id: string; title: string; slug: string; isNav?: boolean }> = [];
    let currentId = categoryId;
    while (currentId) {
      const cat = await this.prisma.category.findUnique({ where: { id: currentId } });
      if (!cat) break;
      trail.unshift({ id: cat.id, title: cat.title, slug: cat.slug });
      currentId = cat.parentId;
    }
    const nav = await this.prisma.navigation.findUnique({ where: { id: navigationId } });
    if (nav) trail.unshift({ id: nav.id, title: nav.title, slug: nav.slug, isNav: true });
    return trail;
  }

  private async latestScrapeTimestamp(navigationId: string, parentId: string | null, children: Category[]) {
    const parent = parentId
      ? await this.prisma.category.findUnique({ where: { id: parentId } })
      : await this.prisma.navigation.findUnique({ where: { id: navigationId } });

    const childMax = children.reduce<Date | null>((acc, c) => {
      if (c.lastScrapedAt && (!acc || c.lastScrapedAt > acc)) return c.lastScrapedAt;
      return acc;
    }, null);

    const parentTs = parent?.lastScrapedAt ?? null;
    if (!parentTs) return childMax;
    if (!childMax) return parentTs;
    return parentTs > childMax ? parentTs : childMax;
  }

  private ttlHours() {
    const n = Number(process.env.SCRAPE_TTL_CATEGORY_HOURS || 12);
    return Number.isFinite(n) && n > 0 ? n : 12;
  }

  private isStale(last?: Date | null) {
    if (!last) return true;
    const ms = this.ttlHours() * 60 * 60 * 1000;
    return Date.now() - last.getTime() > ms;
  }

  private candidateCategoryUrl(categoryPath: string): string | undefined {
    const base = process.env.WOB_CATEGORY_BASE?.replace(/\/+$/, '');
    if (!base) return undefined;
    return `${base}/${categoryPath}`;
  }
}
