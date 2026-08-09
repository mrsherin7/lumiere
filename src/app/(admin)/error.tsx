'use client';

import React, { useEffect } from 'react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin Error Boundary caught:', error);
  }, [error]);

  return (
    <div className="p-12 text-center max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-semibold text-gray-900">Admin Panel Error</h1>
      <p className="text-sm text-gray-500">An error occurred while rendering the admin portal.</p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
      >
        Retry
      </button>
    </div>
  );
}
