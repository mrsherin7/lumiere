'use client';

import React from 'react';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md space-y-4">
          <h1 className="text-3xl font-serif font-medium">Application Error</h1>
          <p className="text-sm text-gray-600">A system error occurred. Please refresh or try again.</p>
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
