import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchFeaturedProducts } from '../api/products';
import ProductCard from '../components/ProductCard';
import RecentlyViewedProducts from '../components/RecentlyViewedProducts';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      setLoading(true);
      const data = await fetchFeaturedProducts();
      setFeaturedProducts(data.products || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Enhanced with Professional E-commerce Design */}
      <section className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center py-20">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/20">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                <span className="text-emerald-100 text-sm font-medium">Free Shipping on Orders $50+</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                Premium Shopping
                <span className="block text-emerald-100">Experience Awaits</span>
              </h1>

              <p className="text-lg sm:text-xl md:text-2xl text-emerald-100 mb-8 max-w-2xl leading-relaxed">
                Discover hand-curated collections of the finest products. Quality, style, and value
                in every item we offer.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/products"
                  className="bg-white text-emerald-800 px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
                >
                  Shop Best Sellers
                </Link>
                <Link
                  to="/products?category=electronics"
                  className="border-2 border-white/80 text-white px-8 py-4 rounded-full font-bold hover:bg-white hover:text-emerald-800 transition-all transform hover:scale-105"
                >
                  Explore Electronics
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-emerald-100">
                <div className="flex items-center gap-2">
                  <span className="text-green-300">✓</span>
                  <span className="text-sm">Secure Checkout</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-300">✓</span>
                  <span className="text-sm">30-Day Returns</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-300">✓</span>
                  <span className="text-sm">Fast Shipping</span>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <div className="relative z-10">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <div className="text-4xl mb-4">💻</div>
                    <h3 className="font-bold text-white mb-2">TechPro Laptop</h3>
                    <p className="text-emerald-100 text-sm">Starting at $1,299</p>
                    <div className="mt-4 inline-flex items-center gap-2 text-emerald-200 text-xs">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                      <span>Best Seller</span>
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <div className="text-4xl mb-4">🎧</div>
                    <h3 className="font-bold text-white mb-2">Wireless Headphones</h3>
                    <p className="text-emerald-100 text-sm">Just $179</p>
                    <div className="mt-4 inline-flex items-center gap-2 text-emerald-200 text-xs">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                      <span>New Arrival</span>
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <div className="text-4xl mb-4">👟</div>
                    <h3 className="font-bold text-white mb-2">Running Shoes</h3>
                    <p className="text-emerald-100 text-sm">Now 20% Off</p>
                    <div className="mt-4 inline-flex items-center gap-2 text-emerald-200 text-xs">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                      <span>Clearance</span>
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <div className="text-4xl mb-4">👕</div>
                    <h3 className="font-bold text-white mb-2">Premium T-Shirts</h3>
                    <p className="text-emerald-100 text-sm">3 for $50</p>
                    <div className="mt-4 inline-flex items-center gap-2 text-emerald-200 text-xs">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                      <span>Bundle Deal</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-emerald-500/20 rounded-full animate-bounce"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-teal-500/20 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories - Enhanced Design */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Shop by Category
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Browse our carefully curated collections designed to match your lifestyle and preferences
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: 'Electronics',
                icon: '💻',
                slug: 'electronics',
                description: 'Latest tech and gadgets',
                bg: 'from-blue-500 to-blue-600',
              },
              {
                name: 'Fashion',
                icon: '👕',
                slug: 'clothing',
                description: 'Trending styles for everyone',
                bg: 'from-pink-500 to-rose-600',
              },
              {
                name: 'Home & Garden',
                icon: '🏠',
                slug: 'home-garden',
                description: 'Comfort and style at home',
                bg: 'from-emerald-500 to-teal-600',
              },
              {
                name: 'Sports',
                icon: '⚽',
                slug: 'sports',
                description: 'Active lifestyle essentials',
                bg: 'from-orange-500 to-red-600',
              },
            ].map((category) => (
              <Link
                key={category.slug}
                to={`/products?category=${category.slug}`}
                className="group relative overflow-hidden rounded-2xl p-8 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${category.bg} opacity-90 group-hover:opacity-100 transition-opacity`}></div>
                <div className="relative z-10">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
                    {category.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{category.name}</h3>
                  <p className="text-white/90 text-sm">{category.description}</p>
                  <div className="mt-6 inline-flex items-center gap-2 text-white/80 text-sm">
                    <span>Shop Now</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products - Enhanced Design */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                Featured Products
              </h2>
              <p className="text-gray-600 text-lg">
                Handpicked selections that our customers love
              </p>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center gap-3 text-emerald-600 hover:text-emerald-700 font-semibold text-lg transition"
            >
              View All Products
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                    <div className="flex items-center justify-between">
                      <div className="h-8 bg-gray-200 rounded animate-pulse w-1/3"></div>
                      <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <p className="text-red-600 font-semibold text-xl mb-2">Failed to Load Products</p>
              <p className="text-red-500 text-base mb-6">{error}</p>
              <button
                onClick={loadFeaturedProducts}
                className="bg-red-600 text-white px-8 py-3 rounded-full hover:bg-red-700 transition font-semibold"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Products Grid */}
          {!loading && !error && featuredProducts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* No Products */}
          {!loading && !error && featuredProducts.length === 0 && (
            <div className="text-center py-16">
              <div className="text-8xl mb-6">🛒</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No Products Available</h3>
              <p className="text-gray-600 text-lg mb-8">Check back soon for new arrivals!</p>
              <Link
                to="/products"
                className="bg-emerald-600 text-white px-8 py-3 rounded-full hover:bg-emerald-700 transition font-semibold"
              >
                Browse All Products
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Recently Viewed Products */}
      <RecentlyViewedProducts />

      {/* Testimonials Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-gray-600 text-lg">Join thousands of happy customers worldwide</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                text: "ShopFlow has completely transformed my online shopping experience. The quality is exceptional and shipping is always fast!",
                author: "Sarah M.",
                rating: 5,
              },
              {
                text: "I love the curated selection of products. Everything I've purchased has exceeded my expectations. Highly recommended!",
                author: "Marcus J.",
                rating: 5,
              },
              {
                text: "Outstanding customer service and amazing products. This is now my go-to shop for everything I need.",
                author: "Elena K.",
                rating: 4,
              },
            ].map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition">
                <div className="flex items-center gap-2 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="text-gray-700 text-lg mb-6 italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-emerald-700 font-bold text-xl">
                      {testimonial.author.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.author}</p>
                    <p className="text-gray-500 text-sm">Verified Customer</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-emerald-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Stay Updated with Exclusive Offers
          </h2>
          <p className="text-emerald-100 text-lg mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter and be the first to know about new arrivals, special discounts, and exclusive promotions.
          </p>

          <div className="bg-white/10 backdrop-blur-sm rounded-full p-2 border border-white/20 max-w-md mx-auto">
            <form className="flex flex-col sm:flex-row gap-3 p-2">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 rounded-full text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
                required
              />
              <button
                type="submit"
                className="bg-white text-emerald-700 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition transform hover:scale-105"
              >
                Subscribe
              </button>
            </form>
          </div>

          <p className="text-emerald-200 text-sm mt-4">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </section>
    </div>
  );
}
