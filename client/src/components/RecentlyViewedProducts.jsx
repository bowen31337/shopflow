import { Link } from 'react-router-dom';
import useRecentlyViewedStore from '../stores/recentlyViewedStore';

export default function RecentlyViewedProducts({ excludeProductId = null, className = '' }) {
  const { getRecentlyViewed } = useRecentlyViewedStore();

  const filteredProducts = getRecentlyViewed(excludeProductId);

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

  if (filteredProducts.length === 0) {
    return null;
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 mb-8 ${className}`}>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Recently Viewed</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {filteredProducts.map((product) => (
          <Link
            key={product.id}
            to={`/products/${product.slug}`}
            className="group"
          >
            <div className="relative overflow-hidden rounded-lg bg-gray-50 aspect-square">
              <img
                src={product.primary_image || '/images/placeholder.jpg'}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.target.src = '/images/placeholder.jpg';
                }}
              />

              {product.compare_at_price && product.compare_at_price > product.price && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                  Sale
                </div>
              )}
            </div>

            <div className="mt-2">
              <h3 className="text-sm font-medium text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
                {product.name}
              </h3>

              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center">
                  <span className="text-sm font-bold text-gray-900">
                    {formatPrice(product.price)}
                  </span>
                  {product.compare_at_price && product.compare_at_price > product.price && (
                    <span className="ml-2 text-xs text-gray-500 line-through">
                      {formatPrice(product.compare_at_price)}
                    </span>
                  )}
                </div>
              </div>

              {product.avg_rating && (
                <div className="flex items-center mt-1">
                  <div className="flex text-xs">
                    {renderStars(Math.round(product.avg_rating))}
                  </div>
                  <span className="ml-1 text-xs text-gray-500">
                    ({product.review_count})
                  </span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}