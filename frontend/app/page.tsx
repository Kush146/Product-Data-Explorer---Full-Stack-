import { Suspense } from 'react';
import GridSkeleton from '@/components/GridSkeleton';
import HomeClient from './HomeClient';

export default function HomePage() {
  return (
    <Suspense fallback={<GridSkeleton count={8} />}>
      <HomeClient />
    </Suspense>
  );
}
