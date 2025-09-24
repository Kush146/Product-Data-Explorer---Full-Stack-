"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, Breadcrumb, Category, Product } from "@/lib/api";
import GridSkeleton from "@/components/GridSkeleton";
import StatusToast from "@/components/StatusToast";
import { timeAgo } from "@/lib/time";
import EmptyState from "@/components/EmptyState";

const PAGE_SIZE = 24;

export default function BrowsePage() {
  const params = useParams<{ nav: string; slug?: string[] }>();
  const search = useSearchParams();
  const nav = params.nav as string;
  const slug = (params.slug as string[]) || [];
  const page = Number(search.get("page") || 1);

  const qc = useQueryClient();
  const [toast, setToast] = useState<string | null>(null);
  const pollingRef = useRef<number | null>(null);

  // children + meta
  const {
    data: childrenData,
    isLoading: childrenLoading,
    refetch: refetchChildren,
  } = useQuery<{
    breadcrumb: Breadcrumb[];
    children: Category[];
    meta: {
      isStale: boolean;
      enqueued: boolean;
      candidateUrl?: string;
      ttlHours: number;
      lastScrapedAt: string | null;
    };
  }>({
    queryKey: ["children", nav, slug.join("/")],
    queryFn: () => api.getCategoryChildren({ nav, slug }),
  });

  // products
  const {
    data: productsData,
    isLoading: productsLoading,
    isFetching: productsFetching,
    refetch: refetchProducts,
  } = useQuery<{ items: Product[]; total: number }>({
    queryKey: ["products", nav, slug.join("/"), page, PAGE_SIZE],
    queryFn: () => api.getProducts({ nav, slug, page, limit: PAGE_SIZE }),
    placeholderData: (prev) => prev,
  });

  const meta = childrenData?.meta;
  const lastUpdated = useMemo(
    () => timeAgo(meta?.lastScrapedAt || null),
    [meta?.lastScrapedAt]
  );

  // auto-poll while stale or enqueued
  useEffect(() => {
    const shouldPoll = !!meta?.enqueued || !!meta?.isStale;
    if (!shouldPoll) {
      if (pollingRef.current) {
        window.clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      return;
    }
    if (pollingRef.current) return;
    pollingRef.current = window.setInterval(async () => {
      await refetchChildren();
      await refetchProducts();
    }, 5000);
    return () => {
      if (pollingRef.current) {
        window.clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [meta?.enqueued, meta?.isStale, refetchChildren, refetchProducts]);

  // refresh action
  const onRefresh = async () => {
    try {
      const API_BASE =
        process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000/api/v1";
      const categoryPath = [nav, ...slug].filter(Boolean).join("/");
      const url =
        `${API_BASE}/navigation/children?` +
        new URLSearchParams({
          categoryPath,
          refresh: "true",
        }).toString();
      await fetch(url, { cache: "no-store" });
    } catch {
      // ignore; just show toast and let polling pick it up
    }
    setToast("Refresh queued…");
    qc.invalidateQueries({ queryKey: ["children", nav, slug.join("/")] });
    qc.invalidateQueries({ queryKey: ["products", nav, slug.join("/")] });
    setTimeout(() => {
      refetchChildren();
      refetchProducts();
    }, 400);
  };

  const isLoading = childrenLoading || productsLoading;
  const hasChildren = !!childrenData?.children?.length;
  const hasProducts = !!productsData?.items?.length;

  return (
    <div className="space-y-6">
      {toast ? <StatusToast text={toast} /> : null}

      {/* breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-sm">
        <Link href="/" className="text-blue-600 hover:underline">
          Home
        </Link>
        {childrenData?.breadcrumb?.map((b) => (
          <span key={b.id}>
            <span className="mx-2">›</span>
            {b.isNav ? (
              <Link
                href={`/${b.slug}`}
                className="text-blue-600 hover:underline"
              >
                {b.title}
              </Link>
            ) : (
              <span className="text-gray-700">{b.title}</span>
            )}
          </span>
        ))}
      </nav>

      {/* header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold">
            {childrenData?.breadcrumb?.at(-1)?.title || "Browse"}
          </h1>
          <span className="text-xs text-gray-500 border rounded px-2 py-0.5">
            Last updated: {lastUpdated}
          </span>
          {meta?.enqueued ? (
            <span className="text-xs text-amber-700 border border-amber-300 bg-amber-50 rounded px-2 py-0.5">
              Refreshing…
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {meta?.candidateUrl ? (
            <a
              href={meta.candidateUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 border rounded hover:shadow text-sm"
            >
              Open source page
            </a>
          ) : null}
          <button
            onClick={onRefresh}
            disabled={!!meta?.enqueued}
            className="px-3 py-1.5 border rounded text-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
            aria-disabled={!!meta?.enqueued}
          >
            {meta?.enqueued ? "Queued" : "Refresh data"}
          </button>
        </div>
      </div>

      {/* content */}
      {isLoading ? (
        <GridSkeleton count={6} />
      ) : (
        <>
          {/* Empty state when nothing to show */}
          {!hasChildren && !hasProducts ? (
            <EmptyState
              title="No results yet"
              subtitle="Try refreshing to queue a scrape. Data will appear as it’s collected."
              action={
                <button
                  onClick={onRefresh}
                  className="inline-flex items-center rounded border px-3 py-1.5 hover:shadow text-sm"
                >
                  Refresh data
                </button>
              }
            />
          ) : (
            <>
              {/* subcategories */}
              {hasChildren ? (
                <div className="flex flex-wrap gap-2">
                  {childrenData!.children.map((c) => (
                    <Link
                      key={c.id}
                      href={`/${nav}/${[...slug, c.slug].join("/")}`}
                      className="px-3 py-1.5 border rounded hover:shadow text-sm"
                    >
                      {c.title}
                    </Link>
                  ))}
                </div>
              ) : null}

              {/* products */}
              <section className="mt-4">
                <h2 className="sr-only">Products</h2>
                {productsFetching && hasProducts ? (
                  <p className="text-sm text-gray-500 mb-2">Updating…</p>
                ) : null}

                {hasProducts ? (
                  <>
                    <ul className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {productsData!.items.map((p) => (
                        <li
                          key={p.id}
                          className="border rounded p-3 hover:shadow"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={p.imageUrl || "/placeholder.png"}
                            alt={p.title}
                            className="w-full h-48 object-contain"
                          />
                          <div className="mt-2 font-medium line-clamp-2">
                            {p.title}
                          </div>
                          {p.author ? (
                            <div className="text-sm text-gray-600">
                              {p.author}
                            </div>
                          ) : null}
                          <div className="text-sm font-semibold mt-1">
                            {(p.currency || "")} {p.price ?? ""}
                          </div>
                          <Link
                            href={`/product/${p.id}`}
                            className="mt-2 inline-block text-blue-600 hover:underline text-sm"
                          >
                            View details
                          </Link>
                        </li>
                      ))}
                    </ul>

                    {/* pager */}
                    {productsData!.total > PAGE_SIZE ? (
                      <div className="mt-6 flex items-center justify-center gap-3 text-sm">
                        <Pager
                          current={page}
                          total={productsData!.total}
                          pageSize={PAGE_SIZE}
                          basePath={`/${nav}/${slug.join("/")}`}
                        />
                      </div>
                    ) : null}
                  </>
                ) : null}
              </section>
            </>
          )}
        </>
      )}
    </div>
  );
}

function Pager({
  current,
  total,
  pageSize,
  basePath,
}: {
  current: number;
  total: number;
  pageSize: number;
  basePath: string;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const make = (p: number) => `${basePath}?page=${p}`;
  return (
    <div className="flex items-center gap-2">
      <Link
        className={`px-2 py-1 border rounded ${
          current <= 1 ? "pointer-events-none opacity-50" : ""
        }`}
        href={make(Math.max(1, current - 1))}
      >
        Prev
      </Link>
      <span>
        {current} / {pages}
      </span>
      <Link
        className={`px-2 py-1 border rounded ${
          current >= pages ? "pointer-events-none opacity-50" : ""
        }`}
        href={make(Math.min(pages, current + 1))}
      >
        Next
      </Link>
    </div>
  );
}
