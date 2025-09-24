import { Injectable } from '@nestjs/common';
import { PrismaService } from '../db/prisma.service';
import type { Category } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  private async resolveCategoryId(categoryPath?: string) {
    if (!categoryPath) return null;
    const parts = categoryPath.split('/').filter(Boolean);
    const navSlug = parts.shift();
    if (!navSlug) return null;

    const nav = await this.prisma.navigation.findUnique({ where: { slug: navSlug } });
    if (!nav) return null;

    let parentId: string | null = null;

    for (const slug of parts) {
      const cat: { id: string } | null = await this.prisma.category.findFirst({
        where: {
          navigationId: nav.id,
          slug,
          parentId: { equals: parentId },
        },
        select: { id: true },
      });

      if (!cat) return null;
      parentId = cat.id;
    }

    return parentId;
  }

  async listByCategory(opts: { categoryPath?: string; page?: number; limit?: number }) {
    const page = Math.max(1, Number(opts.page ?? 1));
    const limit = Math.max(1, Math.min(60, Number(opts.limit ?? 24)));

    const categoryId = await this.resolveCategoryId(opts.categoryPath);
    if (!categoryId) return { items: [], total: 0 };

    const where = { categoryId };
    const [total, items] = await this.prisma.$transaction([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        orderBy: { lastScrapedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          title: true,
          author: true,
          price: true,
          currency: true,
          imageUrl: true,
        },
      }),
    ]);

    return { items, total };
  }

  async getById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { detail: true },
    });
    if (!product) return null;

    const reviews = await this.prisma.review.findMany({
      where: { productId: id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: { id: true, author: true, rating: true, text: true, createdAt: true },
    });

    const related = await this.prisma.product.findMany({
      where: { categoryId: product.categoryId ?? undefined, id: { not: id } },
      orderBy: { lastScrapedAt: 'desc' },
      take: 8,
      select: { id: true, title: true, author: true, price: true, currency: true, imageUrl: true },
    });

    return {
      product: {
        id: product.id,
        title: product.title,
        author: product.author,
        price: product.price,
        currency: product.currency,
        imageUrl: product.imageUrl,
        sourceUrl: product.sourceUrl,
      },
      detail: product.detail ?? undefined,
      reviews,
      related,
    };
  }

  // ---------- ADD THESE WRAPPERS so the controller compiles ----------
  async list(categoryPath: string, page = 1, limit = 24) {
    return this.listByCategory({ categoryPath, page, limit });
  }

  async byId(id: string) {
    return this.getById(id);
  }
}
