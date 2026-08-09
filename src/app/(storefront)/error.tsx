'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function StorefrontError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Storefront Error Boundary caught:', error);
  }, [error]);

  return (
    <div className="container-site py-20 text-center max-w-md mx-auto space-y-4">
      <h1 className="font-serif text-3xl font-medium">Something went wrong</h1>
      <p className="text-foreground-secondary text-sm leading-relaxed">
        We encountered an issue loading this section.
      </p>
      <div className="flex items-center justify-center gap-3 pt-2">
        <Button variant="secondary" onClick={() => reset()}>
          Try Again
        </Button>
        <Link href="/">
          <Button shimmer>
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
