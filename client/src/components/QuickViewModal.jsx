import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addToWishlist, removeFromWishlist } from '../api/wishlist';
import { fetchProductBySlug } from '../api/products';
import useCartStore from '../stores/cartStore';
import useAuthStore from '../stores/authStore';
import { LoadingSpinner } from './LoadingSpinner';
import HeartIcon from './HeartIcon';

export default function QuickViewModal({ product, isOpen, onClose }) {
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [fullProduct, setFullProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const { user, isAuthenticated } = useAuthStore();
  const { addToCart, isInWishlist, fetchWishlist } = useCartStore();
  const navigate = useNavigate();

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

  useEffect(() => {
    if (isOpen && product) {
      setIsLoading(true);
      fetchProductBySlug(product.slug)
        .then((data) => {
          setFullProduct(data.product);
          setSelectedImage(data.product.primary_image || '/placeholder.jpg');
        })
        .catch((error) => {
          console.error('Failed to fetch product details:', error);
          setFullProduct(product);
          setSelectedImage(product.primary_image || '/placeholder.jpg');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setFullProduct(null);
      setSelectedImage(null);
    }
  }, [isOpen, product]);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      onClose();
      // Redirect to login page for guest users with return URL
      const returnUrl = window.location.pathname;
      navigate(`/login?return=${encodeURIComponent(returnUrl)}`);
      return;
    }

    try {
      await addToCart(fullProduct.id, quantity);
      // Show success message could be added here
      onClose();
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      onClose();
      // Redirect to login page for guest users with return URL
      const returnUrl = window.location.pathname;
      navigate(`/login?return=${encodeURIComponent(returnUrl)}`);
      return;
    }

    setIsWishlistLoading(true);

    try {
      const isInWishlistCheck = isInWishlist(fullProduct.id);

      if (isInWishlistCheck) {
        await removeFromWishlist(fullProduct.id);
      } else {
        await addToWishlist(fullProduct.id);
      }

      // Refresh wishlist data
      await fetchWishlist();
    } catch (error) {
      console.error('Error updating wishlist:', error);
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) newQuantity = 1;
    if (newQuantity > 99) newQuantity = 99;
    setQuantity(newQuantity);
  };

  const handleViewDetails = () => {
    onClose();
    navigate(`/products/${fullProduct.slug}`);
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="quick-view-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="absolute top-3 right-3 z-10">
            <button
              type="button"
              className="bg-white rounded-full p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center min-h-96">
              <LoadingSpinner size="large" />
            </div>
          ) : (
            <div className="flex flex-col md:flex-row">
              {/* Product Images */}
              <div className="md:w-1/2 p-4 md:p-6">
                <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                  <img
                    src={fullProduct?.primary_image || '/placeholder.jpg'}
                    alt={fullProduct?.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/600x600?text=Product+Image';
                    }}
                  />
                </div>

                {/* Thumbnail gallery */}
                <div className="mt-4 grid grid-cols-4 gap-2">
                  <button
                    onClick={() => setSelectedImage(fullProduct?.primary_image || '/placeholder.jpg')}
                    className={`aspect-square overflow-hidden rounded bg-gray-100 ${
                      selectedImage === (fullProduct?.primary_image || '/placeholder.jpg') ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    <img
                      src={fullProduct?.primary_image || '/placeholder.jpg'}
                      alt={fullProduct?.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/150x150?text=Product+Image';
                      }}
                    />
                  </button>
                  {fullProduct?.images && fullProduct.images.length > 0 && (
                    fullProduct.images.slice(0, 3).map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(image.url)}
                        className={`aspect-square overflow-hidden rounded bg-gray-100 ${
                          selectedImage === image.url ? 'ring-2 ring-primary' : ''
                        }`}
                      >
                        <img
                          src={image.url}
                          alt={`${fullProduct.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/150x150?text=Product+Image';
                          }}
                        />
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Product Details */}
              <div className="md:w-1/2 p-4 md:p-6">
                <div className="space-y-4">
                  {/* Brand */}
                  {fullProduct?.brand_name && (
                    <p className="text-sm text-gray-500 uppercase tracking-wide">
                      <a href={`/brands/${fullProduct.brand_slug}`} className="hover:text-primary transition-colors">
                        {fullProduct.brand_name}
                      </a>
                    </p>
                  )}

                  {/* Product Name */}
                  <h2 id="quick-view-title" className="text-2xl font-bold text-gray-900">
                    {fullProduct?.name}
                  </h2>

                  {/* Rating */}
                  {fullProduct?.avg_rating > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {renderStars(Math.round(fullProduct.avg_rating))}
                      </div>
                      <span className="text-sm text-gray-600">
                        ({fullProduct.review_count || 0} reviews)
                      </span>
                    </div>
                  )}

                  {/* Price */}
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-gray-900">
                      {formatPrice(fullProduct?.price)}
                    </span>
                    {fullProduct?.compare_at_price && fullProduct.compare_at_price > fullProduct.price && (
                      <>
                        <span className="text-lg text-gray-500 line-through">
                          {formatPrice(fullProduct.compare_at_price)}
                        </span>
                        <span className="text-sm bg-red-100 text-red-600 px-2 py-1 rounded-full">
                          Save {Math.round(((fullProduct.compare_at_price - fullProduct.price) / fullProduct.compare_at_price) * 100)}%
                        </span>
                      </>
                    )}
                  </div>

                  {/* Stock Status */}
                  <div className="flex items-center gap-4">
                    <span className={`text-sm font-medium ${
                      fullProduct?.stock_quantity === 0 ? 'text-red-600' :
                      fullProduct?.stock_quantity < fullProduct?.low_stock_threshold ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {fullProduct?.stock_quantity === 0 ? 'Out of Stock' :
                       fullProduct?.stock_quantity < fullProduct?.low_stock_threshold ? 'Low Stock - Only ' + fullProduct.stock_quantity + ' left' :
                       `${fullProduct.stock_quantity} in stock`}
                    </span>
                  </div>

                  {/* Description */}
                  {fullProduct?.description && (
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {fullProduct.description}
                    </p>
                  )}

                  {/* Category */}
                  {fullProduct?.category_name && (
                    <p className="text-sm text-gray-500">
                      Category: {fullProduct.category_name}
                    </p>
                  )}

                  {/* Quantity and Actions */}
                  <div className="space-y-4">
                    {/* Quantity Selector */}
                    <div className="flex items-center gap-3">
                      <label className="text-sm text-gray-600">Quantity:</label>
                      <div className="flex items-center border border-gray-300 rounded-full">
                        <button
                          onClick={() => handleQuantityChange(quantity - 1)}
                          disabled={isLoading || fullProduct?.stock_quantity === 0}
                          className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={quantity}
                          onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                          className="w-16 text-center border-x border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                          min="1"
                          max={99}
                          disabled={isLoading || fullProduct?.stock_quantity === 0}
                        />
                        <button
                          onClick={() => handleQuantityChange(quantity + 1)}
                          disabled={isLoading || fullProduct?.stock_quantity === 0}
                          className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        className="flex-1 bg-primary text-white py-3 px-4 rounded-full hover:bg-green-600 transition font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
                        disabled={fullProduct?.stock_quantity === 0 || isLoading}
                        onClick={handleAddToCart}
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center gap-2">
                            <LoadingSpinner size="small" />
                            Adding...
                          </div>
                        ) : (fullProduct?.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart')}
                      </button>

                      <button
                        className="p-3 border border-gray-300 rounded-full hover:bg-gray-50 transition"
                        onClick={handleWishlistToggle}
                        disabled={isWishlistLoading}
                        title={isInWishlist(fullProduct?.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                      >
                        {isWishlistLoading ? (
                          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                        ) : (
                          <HeartIcon
                            filled={isInWishlist(fullProduct?.id)}
                            className={isInWishlist(fullProduct?.id) ? 'heart-filled' : 'heart-outline'}
                          />
                        )}
                      </button>
                    </div>

                    <button
                      className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-full hover:bg-gray-50 transition font-semibold"
                      onClick={handleViewDetails}
                    >
                      View Full Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}