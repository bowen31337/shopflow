import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts } from '../api/products';
import ProductCard from '../components/ProductCard';
import RecentlyViewedProducts from '../components/RecentlyViewedProducts';
import Pagination from '../components/Pagination';
import PriceRangeSlider from '../components/PriceRangeSlider';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6,
    total: 0,
    totalPages: 0
  });

  // Infinite scroll state
  const [infiniteScroll, setInfiniteScroll] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();

  // Mobile filters modal
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    brand: searchParams.get('brand') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    search: searchParams.get('search') || '',
    sort: searchParams.get('sort') || 'price_asc',
    view: searchParams.get('view') || 'grid',
    infiniteScroll: searchParams.get('infiniteScroll') === 'true',
  });

  // Price range limits
  const [priceLimits, setPriceLimits] = useState({
    min: 0,
    max: 1000
  });

  // Load filters and products
  useEffect(() => {
    loadFilters();
    loadProducts();
  }, [searchParams]);

  const loadFilters = async () => {
    try {
      // Load categories
      const categoriesResponse = await fetch('/api/categories');
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.categories || []);
      }

      // Load brands
      const brandsResponse = await fetch('/api/brands');
      if (brandsResponse.ok) {
        const brandsData = await brandsResponse.json();
        setBrands(brandsData.brands || []);
      }

      // Load price limits
      const productsResponse = await fetch('/api/products?limit=1000');
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        const productsList = productsData.products || [];
        if (productsList.length > 0) {
          const minPrice = Math.floor(Math.min(...productsList.map(p => p.price)));
          const maxPrice = Math.ceil(Math.max(...productsList.map(p => p.price)));
          setPriceLimits({
            min: Math.floor(minPrice * 0.9),
            max: Math.ceil(maxPrice * 1.1)
          });
        }
      }
    } catch (err) {
      console.error('Failed to load filters:', err);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const currentPage = parseInt(searchParams.get('page')) || 1;
      const params = {
        category: filters.category || undefined,
        brand: filters.brand || undefined,
        minPrice: filters.minPrice || undefined,
        maxPrice: filters.maxPrice || undefined,
        search: filters.search || undefined,
        sort: filters.sort || undefined,
        page: currentPage.toString(),
        limit: '6',
      };
      const data = await fetchProducts(params);
      setProducts(data.products || []);

      // Update pagination state
      if (data.pagination) {
        setPagination(data.pagination);
        setHasMore(currentPage < data.pagination.totalPages);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    if (key !== 'infiniteScroll') {
      newParams.delete('page'); // Reset to first page when filtering (not for infinite scroll toggle)
    }
    setSearchParams(newParams);
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setSearchParams('');
    setFilters({
      category: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      search: '',
      sort: 'price_asc',
      view: 'grid',
    });
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);

    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loadMoreProducts = async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const params = {
        category: filters.category || undefined,
        brand: filters.brand || undefined,
        minPrice: filters.minPrice || undefined,
        maxPrice: filters.maxPrice || undefined,
        search: filters.search || undefined,
        sort: filters.sort || undefined,
        page: (pagination.page + 1).toString(),
        limit: '6',
      };
      const data = await fetchProducts(params);

      if (data.products && data.products.length > 0) {
        setProducts(prev => [...prev, ...data.products]);
        setPagination(prev => ({
          ...prev,
          page: prev.page + 1
        }));
        setHasMore(prev => (prev.page + 1) < Math.ceil((prev.total || 0) / prev.limit));
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Failed to load more products:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb Navigation */}
          {filters.category && (() => {
            const selectedCategory = categories.find(cat => cat.slug === filters.category);
            const parentCategory = selectedCategory?.parent_id
              ? categories.find(cat => cat.id === selectedCategory.parent_id)
              : selectedCategory;
            const isSubcategory = selectedCategory?.parent_id;

            if (isSubcategory && parentCategory) {
              return (
                <nav className="text-sm mb-4" aria-label="Breadcrumb">
                  <ol className="flex items-center space-x-2">
                    <li>
                      <button
                        onClick={() => updateFilter('category', '')}
                        className="text-gray-500 hover:text-gray-700 transition"
                      >
                        Home
                      </button>
                    </li>
                    <li className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      <button
                        onClick={() => updateFilter('category', parentCategory.slug)}
                        className="text-gray-500 hover:text-gray-700 transition"
                      >
                        {parentCategory.name}
                      </button>
                    </li>
                    <li className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-900 font-medium">{selectedCategory.name}</span>
                    </li>
                  </ol>
                </nav>
              );
            } else if (parentCategory) {
              return (
                <nav className="text-sm mb-4" aria-label="Breadcrumb">
                  <ol className="flex items-center space-x-2">
                    <li>
                      <button
                        onClick={() => updateFilter('category', '')}
                        className="text-gray-500 hover:text-gray-700 transition"
                      >
                        Home
                      </button>
                    </li>
                    <li className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-900 font-medium">{parentCategory.name}</span>
                    </li>
                  </ol>
                </nav>
              );
            }
            return null;
          })()}

          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {filters.category && (() => {
                  const selectedCategory = categories.find(cat => cat.slug === filters.category);
                  return selectedCategory ? selectedCategory.name : 'Products';
                })()}
              </h1>
              <p className="text-gray-600 mt-1">
                {filters.category && (() => {
                  const selectedCategory = categories.find(cat => cat.slug === filters.category);
                  if (selectedCategory) {
                    const isSubcategory = selectedCategory.parent_id;
                    if (isSubcategory) {
                      return `Products in ${selectedCategory.name} category`;
                    } else {
                      return `All ${selectedCategory.name} products`;
                    }
                  }
                  return 'Discover amazing products at unbeatable prices';
                })()}
              </p>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <select
                value={filters.sort}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
                <option value="name_desc">Name: Z to A</option>
                <option value="created_desc">Newest</option>
                <option value="rating_desc">Rating</option>
              </select>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={filters.infiniteScroll}
                  onChange={(e) => updateFilter('infiniteScroll', e.target.checked.toString())}
                  className="rounded"
                />
                <span>Infinite Scroll</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateFilter('view', 'grid')}
                  className={`p-2 rounded-lg transition ${filters.view === 'grid' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  aria-label="Grid view"
                  title="Grid view"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => updateFilter('view', 'list')}
                  className={`p-2 rounded-lg transition ${filters.view === 'list' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  aria-label="List view"
                  title="List view"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Filters</h2>
                <button
                  onClick={clearFilters}
                  className="text-primary hover:text-green-600 text-sm"
                >
                  Clear All
                </button>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Category</h3>
                <select
                  value={filters.category}
                  onChange={(e) => updateFilter('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All Categories</option>
                  {categories.filter(cat => !cat.parent_id).map((category) => (
                    <option key={category.id} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>

                {/* Subcategory Filter - only show if parent category is selected */}
                {filters.category && (() => {
                  const selectedCategory = categories.find(cat => cat.slug === filters.category);
                  if (selectedCategory && selectedCategory.subcategories && selectedCategory.subcategories.length > 0) {
                    return (
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Subcategories</h4>
                        <div className="space-y-2">
                          {selectedCategory.subcategories.map((subcategory) => (
                            <label key={subcategory.id} className="flex items-center">
                              <input
                                type="radio"
                                name="subcategory"
                                value={subcategory.slug}
                                checked={filters.category === subcategory.slug}
                                onChange={(e) => updateFilter('category', e.target.value)}
                                className="mr-2 text-primary focus:ring-primary"
                              />
                              <span className="text-sm text-gray-600">
                                {subcategory.name} ({subcategory.product_count || 0})
                              </span>
                            </label>
                          ))}
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="subcategory"
                              value={selectedCategory.slug}
                              checked={filters.category === selectedCategory.slug}
                              onChange={(e) => updateFilter('category', e.target.value)}
                              className="mr-2 text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-gray-600">
                              All {selectedCategory.name}
                            </span>
                          </label>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>

              {/* Brand Filter */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Brand</h3>
                <select
                  value={filters.brand}
                  onChange={(e) => updateFilter('brand', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All Brands</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.slug}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <PriceRangeSlider
                  minPrice={filters.minPrice ? parseInt(filters.minPrice) : priceLimits.min}
                  maxPrice={filters.maxPrice ? parseInt(filters.maxPrice) : priceLimits.max}
                  minLimit={priceLimits.min}
                  maxLimit={priceLimits.max}
                  onMinChange={(value) => updateFilter('minPrice', value.toString())}
                  onMaxChange={(value) => updateFilter('maxPrice', value.toString())}
                />
              </div>

              {/* Active Filters */}
              <div className="mb-4">
                <h3 className="font-medium text-gray-900 mb-3">Active Filters</h3>
                <div className="flex flex-wrap gap-2">
                  {filters.category && (
                    <span className="px-3 py-1 bg-primary text-white text-sm rounded-full">
                      {filters.category}
                      <button onClick={() => updateFilter('category', '')} className="ml-2">×</button>
                    </span>
                  )}
                  {filters.brand && (
                    <span className="px-3 py-1 bg-primary text-white text-sm rounded-full">
                      {filters.brand}
                      <button onClick={() => updateFilter('brand', '')} className="ml-2">×</button>
                    </span>
                  )}
                  {(filters.minPrice || filters.maxPrice) && (
                    <span className="px-3 py-1 bg-primary text-white text-sm rounded-full">
                      ${filters.minPrice || '0'} - ${filters.maxPrice || '∞'}
                      <button onClick={() => { updateFilter('minPrice', ''); updateFilter('maxPrice', ''); }} className="ml-2">×</button>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <main className="lg:col-span-3">
            {/* Sort Mobile */}
            <div className="md:hidden mb-6 flex items-center justify-between">
              <select
                value={filters.sort}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
                <option value="name_desc">Name: Z to A</option>
                <option value="created_desc">Newest</option>
                <option value="rating_desc">Rating</option>
              </select>
              <button
                onClick={() => setIsFiltersOpen(true)}
                className="ml-4 px-4 py-3 bg-primary text-white rounded-full hover:bg-green-600 transition"
              >
                📱 Filters
              </button>
              <label className="flex items-center gap-2 text-sm text-gray-600 ml-4">
                <input
                  type="checkbox"
                  checked={filters.infiniteScroll}
                  onChange={(e) => updateFilter('infiniteScroll', e.target.checked.toString())}
                  className="rounded"
                />
                <span>Infinite</span>
              </label>
              <div className="flex items-center gap-2 ml-2">
                <button
                  onClick={() => updateFilter('view', 'grid')}
                  className={`p-2 rounded-lg transition ${filters.view === 'grid' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  aria-label="Grid view"
                  title="Grid view"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => updateFilter('view', 'list')}
                  className={`p-2 rounded-lg transition ${filters.view === 'list' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  aria-label="List view"
                  title="List view"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Results Info */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                Showing {products.length} of {pagination.total} products
                {filters.category && ` in ${filters.category}`}
                {filters.brand && ` by ${filters.brand}`}
              </p>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
                    <div className="aspect-square bg-gray-200"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-600 font-medium">Failed to load products</p>
                <p className="text-red-500 text-sm mt-2">{error}</p>
                <button
                  onClick={loadProducts}
                  className="mt-4 bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700 transition"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Products Grid/List */}
            {!loading && !error && products.length > 0 && (
              <>
                {filters.view === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product, index) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {products.map((product, index) => (
                      <ProductCard key={product.id} product={product} view="list" />
                    ))}
                  </div>
                )}

                {/* Infinite Scroll Trigger */}
                {filters.infiniteScroll && hasMore && (
                  <div ref={(node) => {
                    if (observer.current) observer.current.disconnect();
                    observer.current = new IntersectionObserver((entries) => {
                      if (entries[0].isIntersecting && !loadingMore) {
                        loadMoreProducts();
                      }
                    });
                    if (node) observer.current.observe(node);
                  }} className="h-10 flex items-center justify-center text-gray-500">
                    {loadingMore ? 'Loading more products...' : 'Scroll down for more products'}
                  </div>
                )}

                {/* Pagination */}
                {!filters.infiniteScroll && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={pagination.page}
                      totalPages={pagination.totalPages}
                      onPageChange={handlePageChange}
                      total={pagination.total}
                      limit={pagination.limit}
                    />
                  </div>
                )}
              </>
            )}

            {/* No Products */}
            {!loading && !error && products.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🛍️</div>
                <p className="text-gray-500 text-lg">No products found</p>
                <p className="text-gray-400 text-sm mt-2">
                  {filters.search
                    ? "Try adjusting your search terms or filters"
                    : "Try adjusting your filters"}
                </p>

                {/* Alternative suggestions */}
                <div className="mt-8 bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {filters.search ? "Try these suggestions:" : "Popular categories:"}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filters.search ? (
                      <>
                        <button
                          onClick={() => {
                            updateFilter('search', '');
                            updateFilter('category', '');
                            updateFilter('brand', '');
                            updateFilter('minPrice', '');
                            updateFilter('maxPrice', '');
                          }}
                          className="text-left p-4 border border-gray-200 rounded-lg hover:border-primary hover:shadow-md transition"
                        >
                          <div className="font-medium text-gray-900">Browse all products</div>
                          <div className="text-sm text-gray-500 mt-1">See everything we offer</div>
                        </button>

                        <button
                          onClick={() => {
                            updateFilter('category', 'electronics');
                            updateFilter('search', '');
                          }}
                          className="text-left p-4 border border-gray-200 rounded-lg hover:border-primary hover:shadow-md transition"
                        >
                          <div className="font-medium text-gray-900">Electronics</div>
                          <div className="text-sm text-gray-500 mt-1">Latest gadgets and devices</div>
                        </button>

                        <button
                          onClick={() => {
                            updateFilter('category', 'fashion');
                            updateFilter('search', '');
                          }}
                          className="text-left p-4 border border-gray-200 rounded-lg hover:border-primary hover:shadow-md transition"
                        >
                          <div className="font-medium text-gray-900">Fashion</div>
                          <div className="text-sm text-gray-500 mt-1">Clothing and accessories</div>
                        </button>
                      </>
                    ) : (
                      <>
                        {categories.slice(0, 6).map((category) => (
                          <button
                            key={category.id}
                            onClick={() => updateFilter('category', category.slug)}
                            className="text-left p-4 border border-gray-200 rounded-lg hover:border-primary hover:shadow-md transition"
                          >
                            <div className="font-medium text-gray-900">{category.name}</div>
                            <div className="text-sm text-gray-500 mt-1">Shop {category.name.toLowerCase()}</div>
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3 justify-center">
                  <button
                    onClick={clearFilters}
                    className="bg-primary text-white px-6 py-2 rounded-full hover:bg-green-600 transition"
                  >
                    Clear All Filters
                  </button>
                  {filters.search && (
                    <button
                      onClick={() => updateFilter('search', '')}
                      className="bg-gray-200 text-gray-700 px-6 py-2 rounded-full hover:bg-gray-300 transition"
                    >
                      Clear Search
                    </button>
                  )}
                  <button
                    onClick={() => window.location.href = '/products'}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-full hover:bg-gray-300 transition"
                  >
                    Start Over
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Recently Viewed Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <RecentlyViewedProducts />
      </div>

      {/* Mobile Filters Modal */}
      {isFiltersOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsFiltersOpen(false)}
          />

          {/* Modal */}
          <div className="absolute right-0 top-0 h-full w-full max-w-xs bg-white shadow-xl transform transition-transform">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button
                onClick={() => setIsFiltersOpen(false)}
                className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                aria-label="Close filters"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Filters Content */}
            <div className="overflow-y-auto max-h-[calc(100%-4rem)] p-4 space-y-6">
              {/* Category Filter */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Category</h3>
                <select
                  value={filters.category}
                  onChange={(e) => updateFilter('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All Categories</option>
                  {categories.filter(cat => !cat.parent_id).map((category) => (
                    <option key={category.id} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>

                {/* Subcategory Filter - only show if parent category is selected */}
                {filters.category && (() => {
                  const selectedCategory = categories.find(cat => cat.slug === filters.category);
                  if (selectedCategory && selectedCategory.subcategories && selectedCategory.subcategories.length > 0) {
                    return (
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Subcategories</h4>
                        <div className="space-y-2">
                          {selectedCategory.subcategories.map((subcategory) => (
                            <label key={subcategory.id} className="flex items-center">
                              <input
                                type="radio"
                                name="subcategory"
                                value={subcategory.slug}
                                checked={filters.category === subcategory.slug}
                                onChange={(e) => updateFilter('category', e.target.value)}
                                className="mr-2 text-primary focus:ring-primary"
                              />
                              <span className="text-sm text-gray-600">
                                {subcategory.name} ({subcategory.product_count || 0})
                              </span>
                            </label>
                          ))}
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="subcategory"
                              value={selectedCategory.slug}
                              checked={filters.category === selectedCategory.slug}
                              onChange={(e) => updateFilter('category', e.target.value)}
                              className="mr-2 text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-gray-600">
                              All {selectedCategory.name}
                            </span>
                          </label>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>

              {/* Brand Filter */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Brand</h3>
                <select
                  value={filters.brand}
                  onChange={(e) => updateFilter('brand', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All Brands</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.slug}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Price Range</h3>
                <PriceRangeSlider
                  minPrice={filters.minPrice ? parseInt(filters.minPrice) : priceLimits.min}
                  maxPrice={filters.maxPrice ? parseInt(filters.maxPrice) : priceLimits.max}
                  minLimit={priceLimits.min}
                  maxLimit={priceLimits.max}
                  onMinChange={(value) => updateFilter('minPrice', value.toString())}
                  onMaxChange={(value) => updateFilter('maxPrice', value.toString())}
                />
              </div>

              {/* Active Filters */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Active Filters</h3>
                <div className="flex flex-wrap gap-2">
                  {filters.category && (
                    <span className="px-3 py-1 bg-primary text-white text-sm rounded-full">
                      {filters.category}
                      <button onClick={() => updateFilter('category', '')} className="ml-2">×</button>
                    </span>
                  )}
                  {filters.brand && (
                    <span className="px-3 py-1 bg-primary text-white text-sm rounded-full">
                      {filters.brand}
                      <button onClick={() => updateFilter('brand', '')} className="ml-2">×</button>
                    </span>
                  )}
                  {(filters.minPrice || filters.maxPrice) && (
                    <span className="px-3 py-1 bg-primary text-white text-sm rounded-full">
                      ${filters.minPrice || '0'} - ${filters.maxPrice || '∞'}
                      <button onClick={() => { updateFilter('minPrice', ''); updateFilter('maxPrice', ''); }} className="ml-2">×</button>
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setIsFiltersOpen(false);
                    // Apply filters
                    const newParams = new URLSearchParams(searchParams);
                    if (filters.category) newParams.set('category', filters.category);
                    if (filters.brand) newParams.set('brand', filters.brand);
                    if (filters.minPrice) newParams.set('minPrice', filters.minPrice);
                    if (filters.maxPrice) newParams.set('maxPrice', filters.maxPrice);
                    newParams.delete('page'); // Reset to first page
                    setSearchParams(newParams);
                  }}
                  className="w-full bg-primary text-white py-3 px-4 rounded-full hover:bg-green-600 transition"
                >
                  Apply Filters
                </button>
                <button
                  onClick={() => {
                    // Clear all filters
                    const newParams = new URLSearchParams(searchParams);
                    newParams.delete('category');
                    newParams.delete('brand');
                    newParams.delete('minPrice');
                    newParams.delete('maxPrice');
                    newParams.delete('page');
                    setSearchParams(newParams);
                    setFilters({
                      category: '',
                      brand: '',
                      minPrice: '',
                      maxPrice: '',
                      search: filters.search,
                      sort: filters.sort,
                      view: filters.view,
                      infiniteScroll: filters.infiniteScroll,
                    });
                  }}
                  className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-full hover:bg-gray-300 transition"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}