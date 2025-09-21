'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { categoryApi, productApi } from '@/lib/api';
import type { CategoryResponse, ProductListResponse } from '@/types/api';
import ProductCard from '@/components/ProductCard';
import ScrapingJob from '@/components/ScrapingJob';
import SubcategoryDropdown from '@/components/SubcategoryDropdown';
import { TargetType } from '@/types/api';

interface CategoryPageProps {
  params: Promise<{
    id: string;
  }>;
}

function CategorySkeleton() {
  return (
    <div className="space-y-6 p-8 max-w-6xl mx-auto">
      <div className="h-8 bg-gray-300 rounded w-48 animate-pulse"></div>
      <div className="flex space-x-4 overflow-x-auto">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 w-48 bg-gray-300 rounded animate-pulse"></div>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-64 bg-gray-300 rounded animate-pulse"></div>
        ))}
      </div>
    </div>
  );
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const unwrappedParams = React.use(params);
  const categoryId = Number(unwrappedParams.id);
  const [page, setPage] = useState(1);
  const limit = 12;

  const {
    data: category,
    isLoading: categoryLoading,
    isError: categoryError,
  } = useQuery<CategoryResponse, Error>({
    queryKey: ['category', categoryId],
    queryFn: () => categoryApi.getById(categoryId),
  });

  const {
    data: productsData,
    isLoading: productsLoading,
    isError: productsError,
  } = useQuery<ProductListResponse, Error>({
    queryKey: ['products', categoryId, page],
    queryFn: () => productApi.getAll({ categoryId, page, limit }),
  });

  if (categoryLoading || productsLoading) {
    return <CategorySkeleton />;
  }

  if (categoryError || productsError || !category) {
    return (
      <main className="p-8 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Failed to load category or products</h1>
        <p>Please try again later.</p>
      </main>
    );
  }

  return (
    <main className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{category.name}</h1>

      <ScrapingJob targetUrl={`/category/${category.id}`} targetType={TargetType.NAVIGATION} />
=======
      <ScrapingJob targetUrl={`/category/${category.id}`} targetType={TargetType.NAVIGATION} />

      {category.subcategories && category.subcategories.length > 0 && (
        <section aria-label="Child categories" className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Subcategories</h2>
          <SubcategoryDropdown subcategories={category.subcategories} />
        </section>
      )}

      <section aria-label="Product grid">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {productsData?.data?.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <nav
          aria-label="Pagination"
          className="flex justify-center mt-8 space-x-4"
        >
          <button
            onClick={() => setPage((old) => Math.max(old - 1, 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {page} of {productsData?.totalPages || 1}
          </span>
          <button
            onClick={() => setPage((old) => (productsData && old < productsData.totalPages ? old + 1 : old))}
            disabled={page === (productsData?.totalPages || 1)}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </nav>
      </section>
    </main>
  );
}
