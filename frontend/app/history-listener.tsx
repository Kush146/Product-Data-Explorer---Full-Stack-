'use client';
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';

function sid(): string {
  const k = 'pde.sid';
  let v = localStorage.getItem(k);
  if (!v) {
    v = crypto.randomUUID();
    localStorage.setItem(k, v);
  }
  return v;
}

export default function HistoryListener() {
  const pathname = usePathname();
  const sp = useSearchParams();

  useEffect(() => {
    const s = sid();
    const pathJson = { path: pathname, query: Object.fromEntries(sp.entries()) };
    // console.log('[history] POST', pathJson);
    api.postHistory({ sessionId: s, pathJson }).catch((e) => {
      console.warn('[history] post failed', e);
    });
  }, [pathname, sp]);

  return null;
}
