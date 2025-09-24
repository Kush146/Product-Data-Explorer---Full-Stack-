'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // you could send to your logging here
    // console.error(error);
  }, [error]);

  return (
    <html>
      <body className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-lg w-full space-y-4 text-center">
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="text-gray-600">
            {error?.message ?? 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => reset()}
            className="inline-flex items-center rounded border px-3 py-1.5 hover:shadow"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
