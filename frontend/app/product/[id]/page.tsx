import { Suspense } from 'react';
import ProductClient from './Product.client';

export default function ProductPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<div className="p-6">Loading product…</div>}>
      <ProductClient id={params.id} />
    </Suspense>
  );
}
