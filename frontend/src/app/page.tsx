'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { navigationApi } from '@/lib/api';
import type { NavigationResponse } from '@/types/api';

function NavigationSkeleton() {
  return (
    <ul role="list" className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <li key={i} className="h-6 bg-gray-300 rounded animate-pulse w-48"></li>
      ))}
    </ul>
  );
}

export default function Home() {
  const { data, isLoading, isError } = useQuery<NavigationResponse[], Error>({
    queryKey: ['navigation'],
    queryFn: navigationApi.getAll,
  });

  if (isLoading) {
    return (
      <main className="p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Loading navigation...</h1>
        <NavigationSkeleton />
      </main>
    );
  }

  if (isError) {
    return (
      <main className="p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Failed to load navigation</h1>
        <p>Please try again later.</p>
      </main>
    );
  }

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Product Navigation</h1>
      <nav aria-label="Primary navigation">
        <ul role="list" className="space-y-4">
          {data?.map((nav) => (
            <li key={nav.id}>
              <Link
                href={`/category/${nav.id}`}
                className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {nav.name}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/about"
              className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              About
            </Link>
          </li>
          <li>
            <Link
              href="/contact"
              className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Contact
            </Link>
          </li>
        </ul>
      </nav>
    </main>
  );
}
