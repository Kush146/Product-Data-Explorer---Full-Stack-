"use client";
import type { ReviewDTO } from "@/lib/api";

export default function ReviewList({ reviews }: { reviews: ReviewDTO[] }) {
  if (!reviews?.length) return <p className="text-sm text-gray-500">No reviews yet.</p>;
  return (
    <ul className="space-y-4">
      {reviews.map((r) => (
        <li key={r.id} className="border rounded-xl p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium">{r.author || "Anonymous"}</span>
            {typeof r.rating === "number" && (
              <span className="text-xs px-2 py-0.5 border rounded-full" aria-label={`Rating ${r.rating} out of 5`}>
                ⭐ {r.rating.toFixed(1)}
              </span>
            )}
          </div>
          {r.text && <p className="mt-2 text-sm text-gray-700 whitespace-pre-line">{r.text}</p>}
          {r.createdAt && (
            <p className="mt-2 text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</p>
          )}
        </li>
      ))}
    </ul>
  );
}
