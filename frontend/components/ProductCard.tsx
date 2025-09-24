"use client";
import Link from "next/link";
import type { Product } from "@/lib/api";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group bg-white rounded-lg border shadow-sm hover:shadow-md transition flex flex-col">
      <Link href={`/product/${product.id}`} className="flex flex-col flex-1 p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.imageUrl || "/placeholder.png"}
          alt={product.title}
          className="h-56 w-full object-contain rounded-md bg-gray-50 group-hover:scale-105 transition-transform"
        />

        {/* Title */}
        <div className="mt-4 text-sm font-semibold line-clamp-2 group-hover:text-green-700">
          {product.title}
        </div>

        {/* Author */}
        {product.author && (
          <div className="text-xs text-gray-600 mt-1 line-clamp-1">{product.author}</div>
        )}

        {/* Price */}
        {product.price != null && (
          <div className="mt-3 text-base font-bold text-green-700">
            {product.currency || "£"} {product.price}
          </div>
        )}
      </Link>

      {/* Add to Basket */}
      <div className="p-3">
        <button className="w-full rounded-md bg-yellow-400 hover:bg-yellow-500 text-sm font-semibold py-2 transition">
          Add to Basket
        </button>
      </div>
    </div>
  );
}
