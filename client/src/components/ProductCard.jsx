import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { addToWishlist, removeFromWishlist } from '../api/wishlist';
import useCartStore from '../stores/cartStore';
import useAuthStore from '../stores/authStore';
import HeartIcon from './HeartIcon';
import QuickViewModal from './QuickViewModal';

export default function ProductCard({ product, view = 'grid' }) {
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const { user, isAuthenticated } = useAuthStore();
  const { addToCart, isLoading, isInWishlist, fetchWishlist } = useCartStore();

  const renderStars = (rating) => {
    if (!rating) rating = 0;
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? 'text-yellow-400' : 'text-gray-300'}>
          ★
        </span>
      );
    }
    return stars;
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) {
      // Redirect to login page for guest users with return URL
      const returnUrl = window.location.pathname;
      window.location.href = `/login?return=${encodeURIComponent(returnUrl)}`;
      return;
    }

    try {
      await addToCart(product.id, 1);
      // Show success message or toast
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      // Redirect to login page for guest users with return URL
      const returnUrl = window.location.pathname;
      window.location.href = `/login?return=${encodeURIComponent(returnUrl)}`;
      return;
    }

    setIsWishlistLoading(true);

    try {
      const isInWishlistCheck = isInWishlist(product.id);

      if (isInWishlistCheck) {
        await removeFromWishlist(product.id);
        alert(`Removed ${product.name} from wishlist!`);
      } else {
        await addToWishlist(product.id);
        alert(`Added ${product.name} to wishlist!`);
      }

      // Refresh wishlist data
      await fetchWishlist();
    } catch (error) {
      alert(`Error updating wishlist: ${error.message}`);
    } finally {
      setIsWishlistLoading(false);
    }
  };

  // List view component
  if (view === 'list') {
    return (
      <Link
        to={`/products/${product.slug}`}
        className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200 transform hover:-translate-y-1"
      >
        <div className="flex gap-6 p-6">
          {/* Product Image */}
          <div className="relative w-32 h-32 md:w-40 md:h-40 flex-shrink-0 overflow-hidden bg-gray-100 rounded-lg">
            <img
              src={product.primary_image || 'https://picsum.photos/seed/placeholder/400/400'}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                e.target.src = 'https://picsum.photos/seed/product/400/400';
              }}
            />
            {product.is_featured && (
              <span className="absolute top-3 left-3 bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                Featured
              </span>
            )}
            {product.stock_quantity < product.low_stock_threshold && product.stock_quantity > 0 && (
              <span className="absolute top-3 right-3 bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
                Low Stock
              </span>
            )}
            {product.stock_quantity === 0 && (
              <span className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                Out of Stock
              </span>
            )}
            {/* Quick Action Buttons */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300">
              <div className="absolute bottom-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {/* Wishlist Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleWishlistToggle(e);
                  }}
                  disabled={isWishlistLoading}
                  className="p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                  title={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  {isWishlistLoading ? (
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
                  ) : (
                    <HeartIcon
                      filled={isInWishlist(product.id)}
                      className={`w-4 h-4 transition-colors ${
                        isInWishlist(product.id) ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
                      }`}
                    />
                  )}
                </button>

                {/* Quick View Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsQuickViewOpen(true);
                  }}
                  className="p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                  title="Quick View"
                >
                  <svg className="w-4 h-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="flex-1">
            {/* Brand */}
            {product.brand_name && (
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                <span
                  role="link"
                  tabIndex={0}
                  className="hover:text-primary transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate(`/brands/${product.brand_slug}`);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      e.stopPropagation();
                      navigate(`/brands/${product.brand_slug}`);
                    }
                  }}
                >
                  {product.brand_name}
                </span>
              </p>
            )}

            {/* Product Name */}
            <h3 className="font-semibold text-gray-900 text-lg mb-3 group-hover:text-primary transition-colors">
              {product.name}
            </h3>

            {/* Rating */}
            {product.avg_rating > 0 && (
              <div className="flex items-center gap-2 mb-3">
                <div className="flex">
                  {renderStars(Math.round(product.avg_rating))}
                </div>
                <span className="text-sm text-gray-600">
                  ({product.review_count || 0} reviews)
                </span>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {product.description}
              </p>
            )}

            {/* Price */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xl font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
              {product.compare_at_price && product.compare_at_price > product.price && (
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(product.compare_at_price)}
                </span>
              )}
              {product.compare_at_price && product.compare_at_price > product.price && (
                <span className="text-sm bg-red-100 text-red-600 px-2 py-1 rounded-full font-semibold">
                  Save {Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}%
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-4 mb-4">
              <span className={`text-sm font-medium ${
                product.stock_quantity === 0 ? 'text-red-600' :
                product.stock_quantity < product.low_stock_threshold ? 'text-amber-600' :
                'text-green-600'
              }`}>
                {product.stock_quantity === 0 ? 'Out of Stock' :
                 product.stock_quantity < product.low_stock_threshold ? 'Low Stock' :
                 `${product.stock_quantity} in stock`}
              </span>
              {product.category_name && (
                <span className="text-sm text-gray-500">
                  Category: {product.category_name}
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                className={`flex-1 py-3 px-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  product.stock_quantity === 0 || isLoading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-primary text-white hover:bg-green-600 shadow-md hover:shadow-lg'
                }`}
                disabled={product.stock_quantity === 0 || isLoading}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAddToCart(e);
                }}
              >
                {isLoading ? 'Adding...' : (product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart')}
              </button>
              <span
                role="link"
                tabIndex={0}
                className="px-4 py-3 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 hover:border-gray-400 transition font-semibold cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate(`/products/${product.slug}`);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate(`/products/${product.slug}`);
                  }
                }}
              >
                View Details
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Grid view component (original)
  return (
    <>
      <Link
        to={`/products/${product.slug}`}
        className={`product-card group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200 transform hover:-translate-y-1 ${
          isHovered ? 'shadow-xl' : 'shadow-sm'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={product.primary_image || 'https://picsum.photos/seed/placeholder/400/400'}
            alt={product.name}
            className={`product-image w-full h-full object-cover transition-transform duration-500 ${
              isHovered ? 'scale-110' : 'scale-100'
            }`}
            onError={(e) => {
              e.target.src = 'https://picsum.photos/seed/product/400/400';
            }}
          />
          {product.is_featured && (
            <span className="absolute top-3 left-3 bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
              Featured
            </span>
          )}
          {product.stock_quantity < product.low_stock_threshold && product.stock_quantity > 0 && (
            <span className="absolute top-3 right-3 bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
              Low Stock
            </span>
          )}
          {product.stock_quantity === 0 && (
            <span className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
              Out of Stock
            </span>
          )}
          {/* Quick Action Buttons */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300">
            <div className="absolute bottom-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {/* Wishlist Button */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleWishlistToggle(e);
                }}
                disabled={isWishlistLoading}
                className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                title={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                {isWishlistLoading ? (
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
                ) : (
                  <HeartIcon
                    filled={isInWishlist(product.id)}
                    className={`w-5 h-5 transition-colors ${
                      isInWishlist(product.id) ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
                    }`}
                  />
                )}
              </button>

              {/* Quick View Button */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsQuickViewOpen(true);
                }}
                className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                title="Quick View"
              >
                <svg className="w-5 h-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-5">
          {/* Brand */}
          {product.brand_name && (
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
              <span
                role="link"
                tabIndex={0}
                className="hover:text-primary transition-colors cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate(`/brands/${product.brand_slug}`);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate(`/brands/${product.brand_slug}`);
                  }
                }}
              >
                {product.brand_name}
              </span>
            </p>
          )}

          {/* Product Name */}
          <h3 className="font-semibold text-gray-900 text-lg mb-3 line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          {product.avg_rating > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <div className="stars flex text-sm">
                {renderStars(Math.round(product.avg_rating))}
              </div>
              <span className="text-xs text-gray-600">
                ({product.review_count || 0} reviews)
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xl font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.compare_at_price)}
              </span>
            )}
            {product.compare_at_price && product.compare_at_price > product.price && (
              <span className="text-sm bg-red-100 text-red-600 px-2 py-1 rounded-full font-semibold">
                Save {Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}%
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            className={`product-card-add-to-cart-btn w-full py-3 px-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
              product.stock_quantity === 0 || isLoading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-primary text-white hover:bg-green-600 shadow-md hover:shadow-lg'
            }`}
            disabled={product.stock_quantity === 0 || isLoading}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleAddToCart(e);
            }}
          >
            {isLoading ? 'Adding...' : (product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart')}
          </button>
        </div>
      </Link>

      {isQuickViewOpen && (
        <QuickViewModal
          product={product}
          isOpen={isQuickViewOpen}
          onClose={() => setIsQuickViewOpen(false)}
        />
      )}
    </>
  );
}
