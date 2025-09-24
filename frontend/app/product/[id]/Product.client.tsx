'use client';

import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ProductDetailResponse } from '@/lib/api';
import GridSkeleton from '@/components/GridSkeleton';
import ReviewList from '@/components/ReviewList';
import RelatedGrid from '@/components/RelatedGrid';

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000/api/v1';

export default function ProductClient({ id }: { id: string }) {
  const qc = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery<ProductDetailResponse>({
    queryKey: ['product', id],
    queryFn: () => api.getProduct(id),
  });

  const refreshNow = async () => {
    try {
      await fetch(`${API_BASE}/products/${id}?refresh=true`, { cache: 'no-store' });
    } catch {}
    setTimeout(() => {
      qc.invalidateQueries({ queryKey: ['product', id] });
      refetch();
    }, 1200);
  };

  if (isLoading) return <GridSkeleton count={4} />;

  if (isError || !data) {
    return (
      <div className="space-y-4">
        <p className="text-red-600">Failed to load product.</p>
        <button
          onClick={() => refetch()}
          className="px-3 py-1.5 border rounded hover:shadow"
        >
          Try again
        </button>
      </div>
    );
  }

  const { product, detail, reviews, related } = data;

  return (
    <div className="space-y-8">
      <nav aria-label="Breadcrumb" className="text-sm">
        <Link href="/" className="text-blue-600 hover:underline">
          Home
        </Link>
        <span className="mx-2">›</span>
        <span className="text-gray-700">Product</span>
      </nav>

      <div className="flex items-center justify-end">
        <button
          onClick={refreshNow}
          className="px-3 py-1.5 border rounded hover:shadow"
        >
          Refresh data
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="rounded-xl border p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.imageUrl || '/placeholder.png'}
            alt={product.title}
            className="w-full max-h-[460px] object-contain"
          />
        </div>

        <div>
          <h1 className="text-2xl font-semibold">{product.title}</h1>
          {product.author && (
            <p className="mt-1 text-gray-700">By {product.author}</p>
          )}

          <div className="mt-3 text-lg font-semibold">
            {product.currency || ''} {product.price ?? ''}
          </div>

          {typeof detail?.ratingsAvg === 'number' && (
            <div className="mt-2 text-sm text-gray-700">
              ⭐ {detail.ratingsAvg.toFixed(1)} ({detail.reviewsCount ?? 0})
            </div>
          )}

          <div className="mt-4 flex gap-3">
            {product.sourceUrl && (
              <a
                href={product.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 border rounded hover:shadow"
              >
                View on World of Books
              </a>
            )}
            <Link href="/" className="px-3 py-1.5 border rounded hover:shadow">
              Back
            </Link>
          </div>

          {detail?.description && (
            <section className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-sm text-gray-800 whitespace-pre-line">
                {detail.description}
              </p>
            </section>
          )}
        </div>
      </div>

      <section aria-labelledby="reviews-heading">
        <h2 id="reviews-heading" className="text-xl font-semibold mb-3">
          Reviews
        </h2>
        <ReviewList reviews={reviews ?? []} />
      </section>

      {related?.length ? <RelatedGrid items={related} /> : null}
    </div>
  );
}
