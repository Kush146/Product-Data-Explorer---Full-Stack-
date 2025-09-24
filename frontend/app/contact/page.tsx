import { Suspense } from 'react';
import ContactClient from './ContactClient';

export default function ContactPage() {
  return (
    <Suspense fallback={null}>
      <ContactClient />
    </Suspense>
  );
}
