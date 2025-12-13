import React, { useState, useMemo } from 'react';
import ProductCard from '../components/ProductCard';

// Test data defined outside component to avoid recreation
const TEST_PRODUCTS = [
  {
    id: 1,
    name: "Test Product 1",
    slug: "test-product-1",
    price: 29.99,
    compare_at_price: 39.99,
    stock_quantity: 10,
    low_stock_threshold: 5,
    description: "This is a test product for Quick View functionality",
    primary_image: "https://picsum.photos/seed/test/400/400",
    brand_name: "Test Brand",
    brand_slug: "test-brand",
    category_name: "Electronics",
    category_slug: "electronics",
    avg_rating: 4.5,
    review_count: 12
  },
  {
    id: 2,
    name: "Test Product 2",
    slug: "test-product-2",
    price: 49.99,
    stock_quantity: 5,
    low_stock_threshold: 3,
    description: "Another test product for Quick View functionality",
    primary_image: "https://picsum.photos/seed/test/400/400",
    brand_name: "Test Brand",
    brand_slug: "test-brand",
    category_name: "Accessories",
    category_slug: "accessories",
    avg_rating: 0,
    review_count: 0
  }
];

export default function QuickViewTest() {
  // Use memoized static data - no need for useEffect
  const products = useMemo(() => TEST_PRODUCTS, []);
  const [loading] = useState(false);
  const [error] = useState(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🛍️</div>
          <p className="text-gray-500 text-lg">Loading test products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 font-medium">Failed to load test products</p>
          <p className="text-red-500 text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quick View Modal Test</h1>
          <p className="text-gray-600 mt-2">Click the Quick View button on any product card to test the functionality</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-8 bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Instructions</h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>Click the Quick View button (eye icon) on any product card</li>
            <li>Verify the modal opens with product details</li>
            <li>Check that you can see product images, price, and description</li>
            <li>Test the close button and clicking outside the modal</li>
            <li>Verify the "View Full Details" button works</li>
          </ul>
        </div>
      </div>
    </div>
  );
}