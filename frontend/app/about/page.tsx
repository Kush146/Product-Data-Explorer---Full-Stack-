import { Suspense } from 'react';
import AboutClient from './AboutClient';

export default function AboutPage() {
  return (
    <Suspense fallback={null}>
      <AboutClient />
    </Suspense>
  );
}
