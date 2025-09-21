'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { productApi, scrapingApi } from '@/lib/api';
import { TargetType } from '@/types/api';
import type { ProductResponse } from '@/types/api';
import { addToHistory, syncHistory } from '@/lib/history';

interface ProductPageProps {
  params: {
    id: string;
  };
}

function ProductSkeleton() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="h-8 bg-gray-300 rounded w-64 animate-pulse"></div>
      <div className="h-64 bg-gray-300 rounded animate-pulse"></div>
      <div className="h-6 bg-gray-300 rounded w-48 animate-pulse"></div>
      <div className="h-6 bg-gray-300 rounded w-48 animate-pulse"></div>
      <div className="h-6 bg-gray-300 rounded w-48 animate-pulse"></div>
    </div>
  );
}

export default function ProductPage({ params }: ProductPageProps) {
  const productId = Number(params.id);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);

  const {
    data: product,
    isLoading,
    isError,
  } = useQuery<ProductResponse, Error>({
    queryKey: ['product', productId],
    queryFn: () => productApi.getById(productId),
  });

  const mutation = useMutation({
    mutationFn: (id: number) =>
      scrapingApi.enqueueScrape({ targetUrl: `/products/${id}`, targetType: TargetType.PRODUCT }),
    onMutate: () => {
      setRefreshing(true);
      setRefreshMessage(null);
    },
    onSuccess: () => {
      setRefreshing(false);
      setRefreshMessage('Product refresh started successfully.');
    },
    onError: () => {
      setRefreshing(false);
      setRefreshMessage('Failed to start product refresh.');
    },
  });

  useEffect(() => {
    if (product) {
      addToHistory('product', product.name, `/product/${product.id}`);
      syncHistory();
    }
  }, [product]);

  if (isLoading) {
    return <ProductSkeleton />;
  }

  if (isError || !product) {
    return (
      <main className="p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Failed to load product details</h1>
        <p>Please try again later.</p>
      </main>
    );
  }

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{product.name}</h1>

      <section aria-label="Product description" className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Description</h2>
        <p>{product.product_details.find(detail => detail.key === 'description')?.value || 'No description available.'}</p>
      </section>

      <section aria-label="Product specifications" className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Specifications</h2>
        <ul className="list-disc list-inside">
          {product.product_details
            .filter(detail => detail.key !== 'description')
            .map(detail => (
              <li key={detail.id}>
                <strong>{detail.key}:</strong> {detail.value}
              </li>
            ))}
        </ul>
      </section>

      <section aria-label="Product reviews" className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Reviews</h2>
        {product.reviews.length > 0 ? (
          <ul className="space-y-4">
            {product.reviews.map(review => (
              <li key={review.id} className="border p-4 rounded shadow-sm">
                <p><strong>Rating:</strong> {review.rating} / 5</p>
                <p>{review.comment || 'No comment provided.'}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No reviews available.</p>
        )}
      </section>

      <section aria-label="Product refresh" className="mb-6">
        <button
          onClick={() => mutation.mutate(product.id)}
          disabled={refreshing}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {refreshing ? 'Refreshing...' : 'Refresh Product'}
        </button>
        {refreshMessage && <p className="mt-2">{refreshMessage}</p>}
      </section>
    </main>
  );
}
