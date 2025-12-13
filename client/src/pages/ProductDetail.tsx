import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchProductBySlug } from '../api/products';
import { addToWishlist, removeFromWishlist } from '../api/wishlist';
import { fetchProductReviews, submitProductReview, updateReview, deleteReview } from '../api/reviews';
import useCartStore from '../stores/cartStore';
import useAuthStore from '../stores/authStore';
import useRecentlyViewedStore from '../stores/recentlyViewedStore';
import RecentlyViewedProducts from '../components/RecentlyViewedProducts';

// TypeScript interfaces
interface ProductImage {
  id: number;
  product_id: number;
  url: string;
  alt_text: string;
  position: number;
  is_primary: number;
}

interface ProductVariant {
  id: number;
  product_id: number;
  name: string;
  value: string;
  price_adjustment: number;
  stock_quantity: number;
  sku: string;
}

interface Review {
  id: number;
  product_id: number;
  user_id: number;
  rating: number;
  title: string | null;
  content: string;
  is_verified_purchase: number;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  user_name: string;
  user_email: string;
  images: Array<{
    id: number;
    url: string;
  }>;
}

interface Product {
  id: number;
  category_id: number;
  brand_id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  sku: string;
  barcode: string;
  stock_quantity: number;
  low_stock_threshold: number;
  is_active: number;
  is_featured: number;
  weight: number | null;
  dimensions: string | null;
  created_at: string;
  updated_at: string;
  primary_image: string;
  images: ProductImage[];
  variants: ProductVariant[];
  related_products: Array<{
    id: number;
    name: string;
    slug: string;
    price: number;
    primary_image: string;
  }>;
  avg_rating: number;
  review_count: number;
}

interface ReviewFormData {
  rating: number;
  title: string;
  content: string;
}

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState<boolean>(false);
  const [reviewsResponse, setReviewsResponse] = useState<any>(null);
  const [filterRating, setFilterRating] = useState<number | string>('all');
  const [sortBy, setSortBy] = useState<string>('date');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const { addToCart, isAuthenticated, isInWishlist, fetchWishlist } = useCartStore();
  const { user } = useAuthStore();
  const { addToRecentlyViewed } = useRecentlyViewedStore();
  const [isWishlistLoading, setIsWishlistLoading] = useState<boolean>(false);
  const [isReviewFormOpen, setIsReviewFormOpen] = useState<boolean>(false);
  const [isEditingReview, setIsEditingReview] = useState<number | null>(null);
  const [reviewForm, setReviewForm] = useState<ReviewFormData>({
    rating: 0,
    title: '',
    content: ''
  });
  const [reviewError, setReviewError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    loadProduct();
  }, [slug]);

  // Load wishlist data when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    }
  }, [isAuthenticated]);

  const loadProduct = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProductBySlug(slug);
      setProduct(data.product);
      setSelectedImage(0);

      // Add to recently viewed after loading product
      addToRecentlyViewed(data.product);

      // Load reviews for this product
      if (data.product && data.product.id) {
        await loadReviews(data.product.id);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async (productId: number): Promise<void> => {
    try {
      setReviewsLoading(true);
      const reviewsData = await fetchProductReviews(productId, {
        rating: filterRating,
        sort: sortBy
      });
      setReviewsResponse(reviewsData);
      setReviews(reviewsData.reviews);
    } catch (err) {
      console.error('Error loading reviews:', err);
      setReviews([]);
      setReviewsResponse(null);
    } finally {
      setReviewsLoading(false);
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const renderStars = (rating: number, interactive: boolean = false, onRatingClick: ((rating: number) => void) | null = null): JSX.Element => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingClick && onRatingClick(star)}
            className={`text-2xl transition-colors ${
              interactive
                ? star <= rating
                  ? 'text-yellow-400 hover:text-yellow-500'
                  : 'text-gray-300 hover:text-yellow-400'
                : star <= rating
                ? 'text-yellow-400'
                : 'text-gray-300'
            }`}
            disabled={!interactive}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  const handleReviewFormChange = (field: keyof ReviewFormData, value: string | number): void => {
    setReviewForm(prev => ({ ...prev, [field]: value }));
    if (reviewError) setReviewError('');
  };

  const handleFilterRating = (rating: number | string): void => {
    setFilterRating(rating);
    if (product) {
      loadReviews(product.id);
    }
  };

  const handleSortChange = (sort: string): void => {
    setSortBy(sort);
    if (product) {
      loadReviews(product.id);
    }
  };

  const handleSubmitReview = async (): Promise<void> => {
    if (!product) return;

    // Validate form
    if (reviewForm.rating < 1 || reviewForm.rating > 5) {
      setReviewError('Please select a rating (1-5 stars)');
      return;
    }

    if (!reviewForm.content || reviewForm.content.trim().length < 10) {
      setReviewError('Review content must be at least 10 characters long');
      return;
    }

    setIsSubmitting(true);
    setReviewError('');

    try {
      let result;
      if (isEditingReview) {
        // Update existing review
        result = await updateReview(isEditingReview, {
          rating: reviewForm.rating,
          title: reviewForm.title.trim(),
          content: reviewForm.content.trim()
        });

        // Update the review in the list
        setReviews(prev => prev.map(review =>
          review.id === isEditingReview ? result : review
        ));

        setIsEditingReview(null);
        alert('Review updated successfully!');
      } else {
        // Create new review
        result = await submitProductReview(product.id, {
          rating: reviewForm.rating,
          title: reviewForm.title.trim(),
          content: reviewForm.content.trim()
        });

        // Add the new review to the list
        setReviews(prev => [result, ...prev]);
        alert('Thank you for your review!');
      }

      setIsReviewFormOpen(false);
      setReviewForm({ rating: 0, title: '', content: '' });
    } catch (error) {
      console.error('Error submitting review:', error);
      if (error?.response?.data?.message) {
        setReviewError(error.response.data.message);
      } else if (error?.message) {
        setReviewError(error.message);
      } else {
        setReviewError('Failed to submit review. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditReview = (review: Review): void => {
    setIsEditingReview(review.id);
    setReviewForm({
      rating: review.rating,
      title: review.title || '',
      content: review.content
    });
  };

  const handleCancelEdit = (): void => {
    setIsEditingReview(null);
    setReviewForm({ rating: 0, title: '', content: '' });
    setReviewError('');
  };

  const handleSaveReview = async (reviewId: number): Promise<void> => {
    if (!product) return;

    // Validate form
    if (reviewForm.rating < 1 || reviewForm.rating > 5) {
      setReviewError('Please select a rating (1-5 stars)');
      return;
    }

    if (!reviewForm.content || reviewForm.content.trim().length < 10) {
      setReviewError('Review content must be at least 10 characters long');
      return;
    }

    setIsSubmitting(true);
    setReviewError('');

    try {
      const updatedReview = await updateReview(reviewId, {
        rating: reviewForm.rating,
        title: reviewForm.title.trim(),
        content: reviewForm.content.trim()
      });

      // Update the review in the list
      setReviews(prev => prev.map(review =>
        review.id === reviewId ? updatedReview : review
      ));

      setIsEditingReview(null);
      setReviewForm({ rating: 0, title: '', content: '' });
      alert('Review updated successfully!');
    } catch (error) {
      console.error('Error updating review:', error);
      if (error?.response?.data?.message) {
        setReviewError(error.response.data.message);
      } else if (error?.message) {
        setReviewError(error.message);
      } else {
        setReviewError('Failed to update review. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: number): Promise<void> => {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteReview(reviewId);

      // Remove the review from the list
      setReviews(prev => prev.filter(review => review.id !== reviewId));
      alert('Review deleted successfully!');

      // Reset edit state if the deleted review was being edited
      if (isEditingReview === reviewId) {
        setIsEditingReview(null);
        setReviewForm({ rating: 0, title: '', content: '' });
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      if (error?.response?.data?.message) {
        setReviewError(error.response.data.message);
      } else if (error?.message) {
        setReviewError(error.message);
      } else {
        setReviewError('Failed to delete review. Please try again.');
      }
    }
  };

  const handleWishlistToggle = async (): Promise<void> => {
    if (!isAuthenticated) {
      // Redirect to login page for guest users with return URL
      const returnUrl = window.location.pathname;
      window.location.href = `/login?return=${encodeURIComponent(returnUrl)}`;
      return;
    }

    if (!product) return;

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
    } catch (error: any) {
      alert(`Error updating wishlist: ${error.message}`);
    } finally {
      setIsWishlistLoading(false);
    }
  };

  // Group variants by name (e.g., Size, Color)
  const groupedVariants = product?.variants?.reduce((acc, variant) => {
    if (!acc[variant.name]) {
      acc[variant.name] = [];
    }
    acc[variant.name].push(variant);
    return acc;
  }, {});

  // Get selected variant for add to cart
  const getSelectedVariant = (): ProductVariant | undefined => {
    const variants = product?.variants || [];
    return variants.find(variant =>
      Object.keys(selectedVariants).every(key => selectedVariants[key] === variant.value)
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-96 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              </div>
              <div className="space-y-4">
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 font-medium">Failed to load product</p>
            <p className="text-red-500 text-sm mt-2">{error}</p>
            <Link
              to="/products"
              className="mt-4 inline-block bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700 transition"
            >
              Back to Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🛍️</div>
            <p className="text-gray-500 text-lg">Product not found</p>
            <Link
              to="/products"
              className="mt-4 inline-block bg-primary text-white px-6 py-2 rounded-full hover:bg-green-600 transition"
            >
              Back to Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const images = product.images || [product.primary_image];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="text-sm text-gray-500">
            <Link to="/" className="hover:text-primary">Home</Link>
            <span className="mx-2">›</span>
            <Link to="/products" className="hover:text-primary">Products</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-900">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <img
                src={images[selectedImage] || 'https://picsum.photos/seed/placeholder/400/400'}
                alt={product.name}
                className={`w-full h-[500px] object-cover cursor-zoom-in transition-transform duration-300 ${isZoomed ? 'scale-125' : 'scale-100'}`}
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onClick={() => setIsZoomed(!isZoomed)}
                onError={(e) => {
                  e.target.src = 'https://picsum.photos/seed/product/600/600';
                }}
              />
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index ? 'border-primary' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-20 object-cover"
                      onError={(e) => {
                        e.target.src = 'https://picsum.photos/seed/thumb/100/100';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              {product.brand_name && (
                <Link
                  to={`/products?brand=${product.brand_slug}`}
                  className="text-sm text-primary hover:text-green-600 font-medium"
                >
                  {product.brand_name}
                </Link>
              )}
              <h1 className="text-3xl font-bold text-gray-900 mt-2">{product.name}</h1>

              {/* Rating */}
              {product.avg_rating > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex text-sm">
                    {renderStars(Math.round(product.avg_rating))}
                  </div>
                  <span className="text-sm text-gray-600">
                    ({product.review_count || 0} reviews)
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-center gap-3 mt-4">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(product.price)}
                </span>
                {product.compare_at_price && product.compare_at_price > product.price && (
                  <span className="text-lg text-gray-500 line-through">
                    {formatPrice(product.compare_at_price)}
                  </span>
                )}
                {product.compare_at_price && product.compare_at_price > product.price && (
                  <span className="bg-red-500 text-white px-2 py-1 rounded-full text-sm">
                    Save {Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}%
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-4 mt-4">
                {product.stock_quantity === 0 ? (
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                    Out of Stock
                  </span>
                ) : product.stock_quantity < product.low_stock_threshold ? (
                  <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
                    Low Stock - Only {product.stock_quantity} left
                  </span>
                ) : (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                    In Stock
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-3">Description</h2>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Product Variants */}
            {groupedVariants && Object.keys(groupedVariants).length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-3">Options</h3>
                {Object.entries(groupedVariants).map(([variantName, variants]) => (
                  <div key={variantName} className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {variantName}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {variants.map((variant) => {
                        const isSelected = selectedVariants[variantName] === variant.value;
                        return (
                          <button
                            key={variant.id}
                            onClick={() => setSelectedVariants({
                              ...selectedVariants,
                              [variantName]: variant.value
                            })}
                            className={`px-4 py-2 border rounded-full text-sm font-medium transition-all ${
                              isSelected
                                ? 'border-primary bg-primary text-white'
                                : 'border-gray-300 hover:border-primary hover:text-primary'
                            }`}
                            disabled={variant.stock_quantity === 0}
                          >
                            {variant.value}
                            {variant.stock_quantity === 0 && (
                              <span className="ml-2 text-red-500">- Out of Stock</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add to Cart */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-4 mb-4">
                <label className="text-sm font-medium text-gray-700">Quantity:</label>
                <div className="flex items-center border border-gray-300 rounded-full">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-gray-100 transition"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x border-gray-300 min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(99, quantity + 1))}
                    className="px-3 py-2 hover:bg-gray-100 transition"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  className="flex-1 bg-primary text-white py-3 rounded-full font-semibold hover:bg-green-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                  disabled={product.stock_quantity === 0}
                  onClick={async () => {
                    try {
                      // Check if required variants are selected
                      const requiredVariantGroups = Object.keys(groupedVariants || {});
                      const missingVariants = requiredVariantGroups.filter(group => !selectedVariants[group]);

                      if (missingVariants.length > 0) {
                        alert(`Please select ${missingVariants.join(', ')}`);
                        return;
                      }

                      // Get the selected variant
                      const selectedVariant = getSelectedVariant();

                      if (!isAuthenticated) {
                        // Redirect to login page for guest users with return URL
                        const returnUrl = window.location.pathname;
                        window.location.href = `/login?return=${encodeURIComponent(returnUrl)}`;
                        return;
                      }

                      await addToCart(product.id, quantity, selectedVariant?.id);
                      alert(`Added ${quantity} ${product.name}(s) to cart!`);
                    } catch (error) {
                      alert(`Error adding to cart: ${error.message}`);
                    }
                  }}
                >
                  {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
                <button
                  className="px-6 py-3 border border-gray-300 rounded-full hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  onClick={handleWishlistToggle}
                  disabled={isWishlistLoading}
                  title={isInWishlist(product?.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  {isWishlistLoading ? (
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                  ) : (
                    <span className={isInWishlist(product?.id) ? 'text-red-500' : ''}>
                      {isInWishlist(product?.id) ? '❤️' : '🤍'}
                    </span>
                  )}
                </button>
              </div>

              <div className="mt-4 text-sm text-gray-600">
                <p>Free shipping on orders over $50</p>
              </div>
            </div>

            {/* Product Details */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Product Details</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">SKU:</span>
                  <p className="text-gray-900">{product.sku}</p>
                </div>
                <div>
                  <span className="text-gray-500">Category:</span>
                  <p className="text-gray-900">
                    <Link to={`/products?category=${product.category_slug}`} className="text-primary hover:text-green-600">
                      {product.category_name}
                    </Link>
                  </p>
                </div>
                {product.brand_name && (
                  <>
                    <div>
                      <span className="text-gray-500">Brand:</span>
                      <p className="text-gray-900">
                        <Link
                          to={`/brands/${product.brand_slug}`}
                          className="hover:text-primary transition-colors"
                        >
                          {product.brand_name}
                        </Link>
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Weight:</span>
                      <p className="text-gray-900">{product.weight || 'N/A'}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Customer Reviews</h2>

              {/* Rating Distribution Chart */}
              {reviewsResponse && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Rating Breakdown</h3>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = reviewsResponse.rating_distribution?.[star] || 0;
                      const total = reviewsResponse.total_reviews || 0;
                      const percentage = total > 0 ? (count / total) * 100 : 0;
                      return (
                        <div key={star} className="flex items-center gap-3">
                          <div className="flex items-center gap-1 min-w-[60px]">
                            <span className="text-yellow-400">★</span>
                            <span className="text-sm text-gray-600">{star} star</span>
                          </div>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <div className="text-sm text-gray-600 min-w-[30px] text-right">
                            {count}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 text-sm text-gray-600">
                    {reviewsResponse.total_reviews || 0} total reviews
                  </div>
                </div>
              )}

              {/* Filter and Sort Controls */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Rating</label>
                  <div className="flex flex-wrap gap-2">
                    {['all', 5, 4, 3, 2, 1].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => handleFilterRating(rating)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-full border text-sm ${
                          filterRating === rating
                            ? 'bg-primary text-white border-primary'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {rating === 'all' ? (
                          <>
                            <span>All Reviews</span>
                            <span className="text-xs">({reviewsResponse?.total_reviews || 0})</span>
                          </>
                        ) : (
                          <>
                            <span className="text-yellow-400">★</span>
                            <span>{rating} Star</span>
                            <span className="text-xs">({reviewsResponse?.rating_distribution?.[rating] || 0})</span>
                          </>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="w-full sm:w-64">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="date">Most Recent</option>
                    <option value="helpfulness">Most Helpful</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                </div>
              </div>

              {reviewsLoading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-2 border-gray-300 border-t-primary rounded-full animate-spin mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading reviews...</p>
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <div className="flex text-sm">
                              {renderStars(review.rating)}
                            </div>
                            <span className="text-sm font-medium text-gray-900">{review.title}</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            By <span className="font-medium">{review.user_name}</span> • {new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', 'day': 'numeric' })}
                            {review.is_verified_purchase && (
                              <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                                ✓ Verified Purchase
                              </span>
                            )}
                          </p>
                        </div>
                        {review.helpful_count > 0 && (
                          <span className="text-sm text-gray-500">
                            {review.helpful_count} {review.helpful_count === 1 ? 'person' : 'people'} found this helpful
                          </span>
                        )}
                      </div>

                      <p className="text-gray-700 mb-3">{review.content}</p>

                      {review.images && review.images.length > 0 && (
                        <div className="flex gap-2 mb-3">
                          {review.images.map((image) => (
                            <img
                              key={image.id}
                              src={image.url}
                              alt="Review"
                              className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                              onError={(e) => {
                                e.target.src = 'https://picsum.photos/seed/review/64/64';
                              }}
                            />
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => {/* TODO: Implement helpful functionality */}}
                          className="text-sm text-gray-600 hover:text-primary transition"
                        >
                          Helpful
                        </button>
                        {isAuthenticated && user && review.user_id === user.id && (
                          <div className="flex space-x-2">
                            {!isEditingReview || isEditingReview !== review.id ? (
                              <>
                                <button
                                  onClick={() => handleEditReview(review)}
                                  className="text-sm text-blue-600 hover:text-blue-800 transition"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteReview(review.id)}
                                  className="text-sm text-red-600 hover:text-red-800 transition"
                                >
                                  Delete
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleSaveReview(review.id)}
                                  disabled={isSubmitting}
                                  className="text-sm text-green-600 hover:text-green-800 transition disabled:opacity-50"
                                >
                                  {isSubmitting ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  disabled={isSubmitting}
                                  className="text-sm text-gray-600 hover:text-gray-800 transition disabled:opacity-50"
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
                  {isAuthenticated ? (
                    <button
                      onClick={() => setIsReviewFormOpen(true)}
                      className="mt-4 px-4 py-2 bg-primary text-white rounded-full hover:bg-green-600 transition"
                    >
                      Write a Review
                    </button>
                  ) : (
                    <p className="mt-2 text-sm text-gray-500">
                      <Link to="/login" className="text-primary hover:text-green-600">
                        Login
                      </Link> to write a review
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Review Form Modal */}
            {isReviewFormOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between p-6 border-b">
                    <h3 className="text-lg font-semibold">
                      {isEditingReview ? 'Edit Review' : 'Write a Review'}
                    </h3>
                    <button
                      onClick={() => {
                        setIsReviewFormOpen(false);
                        setReviewError('');
                        setReviewForm({ rating: 0, title: '', content: '' });
                        setIsEditingReview(null);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="p-6 space-y-4">
                    {reviewError && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        {reviewError}
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                      {renderStars(reviewForm.rating, true, (rating) => handleReviewFormChange('rating', rating))}
                      <p className="text-sm text-gray-500 mt-1">Click stars to rate this product</p>
                    </div>

                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                        Review Title (Optional)
                      </label>
                      <input
                        id="title"
                        type="text"
                        value={reviewForm.title}
                        onChange={(e) => handleReviewFormChange('title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Enter a title for your review"
                        maxLength={200}
                      />
                    </div>

                    <div>
                      <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                        Review Content *
                      </label>
                      <textarea
                        id="content"
                        rows={5}
                        value={reviewForm.content}
                        onChange={(e) => handleReviewFormChange('content', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Share your thoughts about this product..."
                        maxLength={2000}
                      />
                      <p className="text-sm text-gray-500 mt-1">Minimum 10 characters</p>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => {
                          setIsReviewFormOpen(false);
                          setReviewError('');
                          setReviewForm({ rating: 0, title: '', content: '' });
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmitReview}
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        {isSubmitting ? (isEditingReview ? 'Saving...' : 'Submitting...') : (isEditingReview ? 'Save Review' : 'Submit Review')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Related Products */}
            {product.related_products && product.related_products.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Related Products</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {product.related_products.map((relatedProduct) => (
                    <Link key={relatedProduct.id} to={`/products/${relatedProduct.slug}`} className="group">
                      <img
                        src={relatedProduct.primary_image || 'https://picsum.photos/seed/placeholder/400/400'}
                        alt={relatedProduct.name}
                        className="w-full h-24 object-cover rounded-lg group-hover:scale-105 transition-transform"
                      />
                      <p className="text-sm text-gray-900 group-hover:text-primary transition mt-2">
                        {relatedProduct.name}
                      </p>
                      <p className="text-sm text-gray-600">{formatPrice(relatedProduct.price)}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Recently Viewed Products */}
            <RecentlyViewedProducts excludeProductId={product?.id} />
          </div>
        </div>
      </div>
    </div>
  );
}