import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchProductBySlug } from '../api/products';
import useCartStore from '../stores/cartStore';

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState({});
  const { addToCart, isAuthenticated } = useCartStore();

  useEffect(() => {
    loadProduct();
  }, [slug]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProductBySlug(slug);
      setProduct(data.product);
      setSelectedImage(0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
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
  const getSelectedVariant = () => {
    const variants = product?.variants || [];
    return variants.find(variant =>
      Object.keys(selectedVariants).every(key => selectedVariants[key] === variant.value)
    );
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
                src={images[selectedImage] || '/placeholder.jpg'}
                alt={product.name}
                className={`w-full h-[500px] object-cover cursor-zoom-in transition-transform duration-300 ${isZoomed ? 'scale-125' : 'scale-100'}`}
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onClick={() => setIsZoomed(!isZoomed)}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/600x600?text=Product+Image';
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
                        e.target.src = 'https://via.placeholder.com/100x100?text=Thumb';
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
                        alert('Please login to add items to cart');
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
                  className="px-6 py-3 border border-gray-300 rounded-full hover:bg-gray-50 transition"
                  onClick={() => {
                    // TODO: Add to wishlist functionality
                    alert('Added to wishlist!');
                  }}
                >
                  ❤️
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
                      <p className="text-gray-900">{product.brand_name}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Weight:</span>
                      <p className="text-gray-900">{product.weight || 'N/A'}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Related Products */}
            {product.related_products && product.related_products.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Related Products</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {product.related_products.map((relatedProduct) => (
                    <Link key={relatedProduct.id} to={`/products/${relatedProduct.slug}`} className="group">
                      <img
                        src={relatedProduct.primary_image || '/placeholder.jpg'}
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
          </div>
        </div>
      </div>
    </div>
  );
}