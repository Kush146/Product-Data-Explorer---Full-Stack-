"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Link from "next/link";
import GridSkeleton from "@/components/GridSkeleton";

export default function HomePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["nav"],
    queryFn: api.getNavigation,
  });

  if (isLoading) return <GridSkeleton count={8} />;

  return (
    <div className="space-y-8">
      {/* hero band (WoB vibe) */}
      <section className="rounded-xl bg-[#F6F5EE] px-6 py-8">
        <h1 className="text-2xl font-bold tracking-tight">Bestselling Fiction Books</h1>
        <p className="mt-1 text-[15px] text-gray-600">
          Browse popular categories and discover your next read.
        </p>
      </section>

      {/* category tiles */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data?.map((n) => (
          <Link
            key={n.id}
            href={`/${n.slug}`}
            className="block rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-700"
          >
            <div className="text-lg font-semibold">{n.title}</div>
            <div className="mt-1 text-sm text-gray-600">Browse {n.title}</div>
          </Link>
        ))}
      </section>
    </div>
  );
}
