import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import { fetchWishlist, removeFromWishlist, moveToCart } from '../api/wishlist';
import { addToCart } from '../api/cart';

export default function Wishlist() {
  const { user } = useAuthStore();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    if (user) {
      loadWishlist();
    }
  }, [user]);

  const loadWishlist = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await fetchWishlist();
      setWishlistItems(response.wishlist || []);
    } catch (error) {
      setError(error.message || 'Failed to load wishlist');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      setActionLoading(prev => ({ ...prev, [productId]: 'remove' }));
      setError('');
      await removeFromWishlist(productId);
      setWishlistItems(prev => prev.filter(item => item.product.id !== productId));
      setSuccess('Item removed from wishlist');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.message || 'Failed to remove item');
    } finally {
      setActionLoading(prev => ({ ...prev, [productId]: null }));
    }
  };

  const handleMoveToCart = async (productId, quantity = 1) => {
    try {
      setActionLoading(prev => ({ ...prev, [productId]: 'move' }));
      setError('');
      await moveToCart(productId, quantity);
      setWishlistItems(prev => prev.filter(item => item.product.id !== productId));
      setSuccess('Item moved to cart!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      // If move to cart fails, try regular add to cart
      try {
        await addToCart(productId, quantity);
        await removeFromWishlist(productId);
        setWishlistItems(prev => prev.filter(item => item.product.id !== productId));
        setSuccess('Item added to cart!');
        setTimeout(() => setSuccess(''), 3000);
      } catch (fallbackError) {
        setError(error.message || 'Failed to move item to cart');
      }
    } finally {
      setActionLoading(prev => ({ ...prev, [productId]: null }));
    }
  };

  const handleShareWishlist = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Wishlist',
          text: 'Check out my wishlist!',
          url: `${window.location.origin}/wishlist/shared/${user.id}`
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy link to clipboard
      try {
        const shareUrl = `${window.location.origin}/wishlist/shared/${user.id}`;
        await navigator.clipboard.writeText(shareUrl);
        setSuccess('Share link copied to clipboard!');
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        setError('Failed to copy share link');
      }
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl text-gray-300 mx-auto mb-4">❤️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign in required</h1>
          <p className="text-gray-600 mb-6">Please sign in to view your wishlist</p>
          <Link
            to="/login"
            className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
              <p className="text-gray-600 mt-1">
                {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
              </p>
            </div>
            {wishlistItems.length > 0 && (
              <button
                onClick={handleShareWishlist}
                className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <span className="mr-2">🔗</span>
                Share Wishlist
              </button>
            )}
          </div>
        </div>

        {/* Success and Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : wishlistItems.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <div className="text-6xl text-gray-300 mx-auto mb-4">❤️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6">
              Save items you love by clicking the heart icon on products
            </p>
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <span className="mr-2">🛍️</span>
              Start Shopping
            </Link>
          </div>
        ) : (
          /* Wishlist Items Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => {
              const product = item.product;
              const isLoading = actionLoading[product.id];

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
                >
                  {/* Product Image */}
                  <div className="relative">
                    <Link to={`/products/${product.id}`}>
                      <img
                        src={product.image_url || 'https://via.placeholder.com/300x300?text=No+Image'}
                        alt={product.alt_text || product.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </Link>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveFromWishlist(product.id)}
                      disabled={isLoading === 'remove'}
                      className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                      aria-label="Remove from wishlist"
                    >
                      {isLoading === 'remove' ? (
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                      ) : (
                        <span className="text-red-500 text-lg">❤️</span>
                      )}
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <div className="mb-2">
                      {product.category_name && (
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          {product.category_name}
                        </p>
                      )}
                      <Link
                        to={`/products/${product.id}`}
                        className="text-lg font-medium text-gray-900 hover:text-emerald-600 transition-colors line-clamp-2"
                      >
                        {product.name}
                      </Link>
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      {product.compare_at_price && product.compare_at_price > product.price ? (
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-gray-900">
                            ${product.price.toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-500 line-through">
                            ${product.compare_at_price.toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-lg font-bold text-gray-900">
                          ${product.price.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* Stock Status */}
                    <div className="mb-4">
                      {product.stock_quantity > 0 ? (
                        <p className="text-sm text-green-600">In Stock</p>
                      ) : (
                        <p className="text-sm text-red-600">Out of Stock</p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <button
                        onClick={() => handleMoveToCart(product.id, 1)}
                        disabled={isLoading === 'move' || product.stock_quantity === 0}
                        className="w-full flex items-center justify-center px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        {isLoading === 'move' ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        ) : (
                          <span className="mr-2">🛒</span>
                        )}
                        Move to Cart
                      </button>

                      <Link
                        to={`/products/${product.id}`}
                        className="w-full block text-center px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}