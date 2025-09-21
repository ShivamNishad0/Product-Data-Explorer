'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface Subcategory {
  id: number;
  name: string;
}

interface SubcategoryDropdownProps {
  subcategories: Subcategory[];
}

export default function SubcategoryDropdown({ subcategories }: SubcategoryDropdownProps) {
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    if (selectedId) {
      router.push(`/category/${selectedId}`);
    }
  };

  return (
    <select
      aria-label="Select a subcategory"
      className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
      onChange={handleChange}
      defaultValue=""
    >
      <option value="" disabled>
        Select a subcategory
      </option>
      {subcategories.map((subcat) => (
        <option key={subcat.id} value={subcat.id}>
          {subcat.name}
        </option>
      ))}
    </select>
  );
}
