"use client";
import type { Product } from "@/lib/api";
import ProductCard from "./ProductCard";

export default function RelatedGrid({ items }: { items?: Product[] }) {
  if (!items?.length) return null;
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-3">You may also like</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
