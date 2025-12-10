import { Link } from 'react-router-dom';
import { useAuth } from '../stores/authStore';
import { toast } from 'react-hot-toast';

export default function ProductCard({ product, view = 'grid' }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const auth = useAuth();

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

  // List view component
  if (view === 'list') {
    return (
      <Link
        to={`/products/${product.slug}`}
        className="group bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100"
      >
        <div className="flex gap-6 p-6">
          {/* Product Image */}
          <div className="relative w-32 h-32 md:w-40 md:h-40 flex-shrink-0 overflow-hidden bg-gray-100 rounded-lg">
            <img
              src={product.primary_image || '/placeholder.jpg'}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/400x400?text=Product+Image';
              }}
            />
            {product.is_featured && (
              <span className="absolute top-2 left-2 bg-primary text-white px-2 py-1 rounded-full text-xs font-semibold">
                Featured
              </span>
            )}
            {product.stock_quantity < product.low_stock_threshold && product.stock_quantity > 0 && (
              <span className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                Low Stock
              </span>
            )}
            {product.stock_quantity === 0 && (
              <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                Out of Stock
              </span>
            )}
          </div>

          {/* Product Info */}
          <div className="flex-1">
            {/* Brand */}
            {product.brand_name && (
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                {product.brand_name}
              </p>
            )}

            {/* Product Name */}
            <h3 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-primary transition">
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
                <span className="text-sm bg-red-100 text-red-600 px-2 py-1 rounded-full">
                  Save {Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}%
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-4 mb-4">
              <span className={`text-sm font-medium ${
                product.stock_quantity === 0 ? 'text-red-600' :
                product.stock_quantity < product.low_stock_threshold ? 'text-yellow-600' :
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
                className="flex-1 bg-primary text-white py-3 px-4 rounded-full hover:bg-green-600 transition font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
                disabled={product.stock_quantity === 0}
                onClick={(e) => {
                  e.preventDefault();
                  // TODO: Add to cart functionality
                }}
              >
                {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <Link
                to={`/products/${product.slug}`}
                className="px-4 py-3 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition font-semibold"
              >
                View Details
              </Link>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Grid view component (original)
  return (
    <Link
      to={`/products/${product.slug}`}
      className="group bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100"
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={product.primary_image || '/placeholder.jpg'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x400?text=Product+Image';
          }}
        />
        {product.is_featured && (
          <span className="absolute top-2 left-2 bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold">
            Featured
          </span>
        )}
        {product.stock_quantity < product.low_stock_threshold && product.stock_quantity > 0 && (
          <span className="absolute top-2 right-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
            Low Stock
          </span>
        )}
        {product.stock_quantity === 0 && (
          <span className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
            Out of Stock
          </span>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Brand */}
        {product.brand_name && (
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            {product.brand_name}
          </p>
        )}

        {/* Product Name */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition">
          {product.name}
        </h3>

        {/* Rating */}
        {product.avg_rating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex text-sm">
              {renderStars(Math.round(product.avg_rating))}
            </div>
            <span className="text-xs text-gray-600">
              ({product.review_count || 0})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
          {product.compare_at_price && product.compare_at_price > product.price && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(product.compare_at_price)}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <div className="flex gap-2">
          <button
            className="flex-1 bg-primary text-white py-2 rounded-full hover:bg-green-600 transition font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
            disabled={product.stock_quantity === 0}
            onClick={(e) => {
              e.preventDefault();
              // TODO: Add to cart functionality
            }}
          >
            {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
          <button
            className="flex items-center justify-center w-12 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!auth.user) {
                toast.error('Please login to add to wishlist');
                return;
              }
              // TODO: Add to wishlist functionality
              toast.success('Added to wishlist');
            }}
            title="Add to wishlist"
          >
            ❤️
          </button>
        </div>
      </div>
    </Link>
  );
}
