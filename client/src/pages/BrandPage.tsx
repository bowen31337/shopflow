import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import ProductCard from '../components/ProductCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Product, Brand } from '../types';

const BrandPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    sortBy: 'newest'
  });

  useEffect(() => {
    const fetchBrandData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch brand details
        const brandResponse = await api.get(`/api/brands/${slug}`);
        setBrand(brandResponse.brand);

        // Fetch products for this brand
        const productsResponse = await api.get(
          `/api/products?brand=${slug}&sort=${filters.sortBy}`
        );
        setProducts(productsResponse.products);

      } catch (error) {
        console.error('Error fetching brand data:', error);
        setError('Failed to load brand. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchBrandData();
    }
  }, [slug]);

  const handleFilterChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));

    // Apply filters after a short delay
    setTimeout(async () => {
      try {
        const params = new URLSearchParams();
        params.append('brand', slug!);
        params.append('sort', filters.sortBy);

        if (filters.minPrice) params.append('minPrice', filters.minPrice);
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);

        const response = await api.get(`/api/products?${params.toString()}`);
        setProducts(response.products);
      } catch (error) {
        console.error('Error filtering products:', error);
      }
    }, 300);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage message="Brand not found" onRetry={() => navigate('/brands')} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Brand Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
              {brand.logo_url ? (
                <img src={brand.logo_url} alt={brand.name} className="w-full h-full object-cover rounded-lg" />
              ) : (
                <span className="text-2xl font-bold text-gray-600">{brand.name.charAt(0)}</span>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{brand.name}</h1>
              <p className="text-gray-600 mt-1">{brand.description}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>{brand.product_count} products</span>
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/products')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Products
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Sort by:</label>
            <select
              name="sortBy"
              value={filters.sortBy}
              onChange={handleFilterChange}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
              <option value="name_desc">Name: Z to A</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Min Price:</label>
            <input
              type="number"
              name="minPrice"
              value={filters.minPrice}
              onChange={handleFilterChange}
              min="0"
              step="0.01"
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-32"
              placeholder="Min"
            />
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Max Price:</label>
            <input
              type="number"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              min="0"
              step="0.01"
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-32"
              placeholder="Max"
            />
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-500">No products found for this brand.</div>
            <button
              onClick={() => navigate('/products')}
              className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Browse All Products
            </button>
          </div>
        ) : (
          products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        )}
      </div>
    </div>
  );
};

export default BrandPage;
