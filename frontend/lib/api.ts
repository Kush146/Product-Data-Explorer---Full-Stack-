import axios from "axios";

const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000/api/v1";
const http = axios.create({ baseURL: base, timeout: 20000 });

export type NavItem = { id: string; title: string; slug: string };
export type Category = { id: string; title: string; slug: string; sourceUrl?: string | null };
export type Breadcrumb = { id: string; title: string; slug: string; isNav?: boolean };

export type Product = {
  id: string;
  title: string;
  author?: string | null;
  price?: string | number | null;
  currency?: string | null;
  imageUrl?: string | null;
  sourceUrl?: string | null;
};

export type ProductDetail = {
  description?: string | null;
  ratingsAvg?: number | null;
  reviewsCount?: number | null;
  specs?: Record<string, unknown> | null;
};

export type ReviewDTO = {
  id: string;
  author?: string | null;
  rating?: number | null;
  text?: string | null;
  createdAt?: string | null;
};

export type ProductDetailResponse = {
  product: Product;
  detail?: ProductDetail | null;
  reviews?: ReviewDTO[];
  related?: Product[];
};

export function pathFrom(nav: string, slug: string[] = []) {
  return [nav, ...slug].filter(Boolean).join("/");
}

export const api = {
  async getNavigation() {
    const { data } = await http.get<NavItem[]>("/navigation");
    return data;
  },

  async getCategoryChildren(params: { nav: string; slug?: string[]; refresh?: boolean }) {
    const categoryPath = pathFrom(params.nav, params.slug);
    const { data } = await http.get<{
      breadcrumb: Breadcrumb[];
      children: Category[];
      meta: {
        isStale: boolean;
        enqueued: boolean;
        candidateUrl?: string;
        ttlHours: number;
        lastScrapedAt: string | null;
      };
    }>("/navigation/children", {
      params: { categoryPath, refresh: params.refresh ? "true" : undefined },
    });
    return data;
  },

  async getProducts(params: { nav: string; slug?: string[]; page?: number; limit?: number }) {
    const categoryPath = pathFrom(params.nav, params.slug);
    const { data } = await http.get<{ items: Product[]; total: number }>("/products", {
      params: { categoryPath, page: params.page ?? 1, limit: params.limit ?? 24 },
    });
    return data;
  },

  async getProduct(id: string): Promise<ProductDetailResponse> {
    const { data } = await http.get<ProductDetailResponse>(`/products/${id}`);
    return data;
  },

    async postHistory(body: { sessionId: string; pathJson: unknown }) {
    await http.post("/history", body);
  },

};
