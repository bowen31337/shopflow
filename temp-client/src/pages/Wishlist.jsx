import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchWishlist, removeFromWishlist, moveWishlistToCart } from '../api/wishlist';
import { useAuth } from '../stores/authStore';

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  const auth = useAuth();

  useEffect(() => {
    if (auth.user) {
      loadWishlist();
    }
  }, [auth.user]);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchWishlist();
      setWishlist(response.wishlist || []);
    } catch (err) {
      console.error('Failed to load wishlist:', err);
      setError(err.message || 'Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      setMessage('');
      await removeFromWishlist(productId);
      setMessage('Product removed from wishlist');
      // Refresh wishlist
      loadWishlist();
    } catch (err) {
      console.error('Failed to remove from wishlist:', err);
      setError(err.message || 'Failed to remove product from wishlist');
    }
  };

  const handleMoveToCart = async (productId) => {
    try {
      setMessage('');
      await moveWishlistToCart(productId, 1);
      setMessage('Product moved to cart');
      // Refresh wishlist
      loadWishlist();
    } catch (err) {
      console.error('Failed to move to cart:', err);
      setError(err.message || 'Failed to move product to cart');
    }
  };

  if (!auth.user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Please Login to View Your Wishlist
            </h2>
            <p className="text-gray-600 mb-6">
              Your wishlist saves your favorite items so you can come back to them later.
            </p>
            <div className="space-x-4">
              <Link
                to="/login"
                className="bg-emerald-600 text-white px-6 py-3 rounded-md hover:bg-emerald-700 transition-colors inline-block"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-white text-emerald-600 border border-emerald-600 px-6 py-3 rounded-md hover:bg-emerald-50 transition-colors inline-block"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
          <p className="text-gray-600">Save your favorite items to come back to them later</p>
        </div>
        <Link
          to="/products"
          className="bg-emerald-600 text-white px-6 py-3 rounded-md hover:bg-emerald-700 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md mb-6">
          {message}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {wishlist.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your wishlist is empty</h2>
          <p className="text-gray-600 mb-6">
            Add products to your wishlist by clicking the heart icon on product cards
          </p>
          <Link
            to="/products"
            className="bg-emerald-600 text-white px-6 py-3 rounded-md hover:bg-emerald-700 transition-colors inline-block"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map(({ product, created_at }) => (
            <div key={product.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square overflow-hidden">
                <img
                  src={product.image_url || '/placeholder-product.jpg'}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 line-clamp-2">
                      {product.name}
                    </h3>
                    {product.brand_name && (
                      <p className="text-sm text-gray-500">{product.brand_name}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveFromWishlist(product.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    title="Remove from wishlist"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  {product.compare_at_price && (
                    <span className="text-sm text-gray-500 line-through">
                      ${product.compare_at_price}
                    </span>
                  )}
                  <span className="text-lg font-bold text-gray-900">
                    ${product.price}
                  </span>
                  {product.compare_at_price && (
                    <span className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded-full">
                      Save ${product.compare_at_price - product.price}
                    </span>
                  )}
                </div>

                {product.stock_quantity <= 0 ? (
                  <div className="text-sm text-red-600 mb-3">Out of Stock</div>
                ) : product.stock_quantity <= 5 ? (
                  <div className="text-sm text-amber-600 mb-3">Low Stock - Only {product.stock_quantity} left</div>
                ) : (
                  <div className="text-sm text-green-600 mb-3">In Stock</div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => handleMoveToCart(product.id)}
                    className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors text-sm font-medium"
                  >
                    Move to Cart
                  </button>
                  <Link
                    to={`/products/${product.id}`}
                    className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    View Details
                  </Link>
                </div>

                <p className="text-xs text-gray-400 mt-3">
                  Added: {new Date(created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}