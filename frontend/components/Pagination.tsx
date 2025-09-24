'use client';
import { useRouter, useSearchParams } from "next/navigation";

export default function Pagination({ page, total, limit }: { page: number; total: number; limit: number }) {
  const router = useRouter();
  const params = useSearchParams();
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const goto = (p: number) => {
    const sp = new URLSearchParams(params.toString());
    sp.set('page', String(p));
    sp.set('limit', String(limit));
    router.push('?' + sp.toString());
  };

  return (
    <nav className="flex items-center gap-2" aria-label="Pagination">
      <button className="px-3 py-1 border rounded disabled:opacity-50"
              onClick={() => goto(Math.max(1, page - 1))}
              disabled={page <= 1}>Prev</button>
      <span className="text-sm">Page {page} / {totalPages}</span>
      <button className="px-3 py-1 border rounded disabled:opacity-50"
              onClick={() => goto(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}>Next</button>
    </nav>
  );
}
