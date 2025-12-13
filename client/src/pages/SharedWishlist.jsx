import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSharedWishlist } from '../api/wishlist';

export default function SharedWishlist() {
  const { userId } = useParams();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [shareableUserInfo, setShareableUserInfo] = useState({});

  const loadSharedWishlist = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await getSharedWishlist(userId);
      setWishlistItems(response.wishlist || []);
      // For now, we'll just show generic user info since we don't have user names in the API
      setShareableUserInfo({
        displayName: 'Someone', // In a real app, you might fetch user info
        itemCount: response.count || 0
      });
    } catch (err) {
      setError(err.message || 'Failed to load shared wishlist');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadSharedWishlist();
  }, [loadSharedWishlist]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading wishlist...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl text-gray-300 mx-auto mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Wishlist Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            to="/products"
            className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <span className="mr-2">🛍️</span>
            Start Shopping
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
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {shareableUserInfo.displayName}'s Wishlist
            </h1>
            <p className="text-gray-600">
              {shareableUserInfo.itemCount} {shareableUserInfo.itemCount === 1 ? 'item' : 'items'} saved
            </p>
            <div className="mt-4 text-sm text-gray-500">
              This is a shared wishlist. You can view these items but won't be able to modify the list.
            </div>
          </div>
        </div>

        {/* Empty State */}
        {wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl text-gray-300 mx-auto mb-4">❤️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">This wishlist is empty</h2>
            <p className="text-gray-600 mb-6">
              Check back later for new items!
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

                    {/* View Only Badge */}
                    <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                      View Only
                    </div>
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

                    {/* Action Buttons - Only view details for shared wishlist */}
                    <div className="space-y-2">
                      <Link
                        to={`/products/${product.id}`}
                        className="w-full block text-center px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        View Details
                      </Link>

                      <Link
                        to="/products"
                        className="w-full block text-center px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Continue Shopping
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="text-gray-600 mb-4">
            Want to create your own wishlist?
          </div>
          <div className="space-x-4">
            <Link
              to="/register"
              className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Sign Up
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}