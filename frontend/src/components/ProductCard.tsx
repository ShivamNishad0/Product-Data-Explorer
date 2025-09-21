'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { ProductResponse } from '@/types/api';

interface ProductCardProps {
  product: ProductResponse;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="border rounded-md p-4 shadow-sm hover:shadow-md transition-shadow">
      <Link href={`/product/${product.id}`} className="block focus:outline-none focus:ring-2 focus:ring-blue-400 rounded">
        <div className="relative w-full h-48 mb-4">
          {product.source_url ? (
            <Image
              src={product.source_url}
              alt={product.name}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 33vw"
              priority={false}
            />
          ) : (
            <div className="bg-gray-200 w-full h-full flex items-center justify-center text-gray-500">
              No Image
            </div>
          )}
        </div>
        <h2 className="text-lg font-semibold mb-1">{product.name}</h2>
        {/* Assuming author and price are part of product_details */}
        <p className="text-sm text-gray-600">
          {product.product_details.find(detail => detail.key === 'author')?.value || 'Unknown Author'}
        </p>
        <p className="text-sm font-medium text-blue-600">
          {product.product_details.find(detail => detail.key === 'price')?.value || 'Price not available'}
        </p>
      </Link>
    </article>
  );
}
