'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Error Boundary caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-md space-y-4">
        <h1 className="font-serif text-3xl font-medium">Something went wrong</h1>
        <p className="text-foreground-secondary text-sm">
          An unexpected error occurred while loading this section.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="secondary" onClick={() => reset()}>
            Try Again
          </Button>
          <Link href="/">
            <Button shimmer>
              Go to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
