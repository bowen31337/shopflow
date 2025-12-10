import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

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
        <button
          className="mt-3 w-full bg-primary text-white py-2 rounded-full hover:bg-green-600 transition font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
          disabled={product.stock_quantity === 0}
          onClick={(e) => {
            e.preventDefault();
            // TODO: Add to cart functionality
          }}
        >
          {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </Link>
  );
}
