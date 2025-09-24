"use client";
import Link from "next/link";
import type { Category } from "@/lib/api";

export default function CategoryList({
  nav,
  slug,
  items,
}: {
  nav: string;
  slug: string[];
  items: Category[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((c) => (
        <Link
          key={c.id}
          href={`/${[nav, ...slug, c.slug].join("/")}`}
          className="inline-flex items-center rounded-full border px-4 py-2 text-sm text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-700"
        >
          {c.title}
        </Link>
      ))}
    </div>
  );
}
