import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../stores/cartStore';

export default function Cart() {
  const navigate = useNavigate();
  const { items, subtotal, fetchCart, loading, error } = useCartStore();
  const [updatingItem, setUpdatingItem] = useState(null);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1 || newQuantity > 99) return;

    try {
      setUpdatingItem(itemId);
      await useCartStore.getState().updateItem(itemId, newQuantity);
    } catch (error) {
      alert(`Error updating quantity: ${error.message}`);
    } finally {
      setUpdatingItem(null);
    }
  };

  const removeItem = async (itemId) => {
    try {
      await useCartStore.getState().removeItem(itemId);
    } catch (error) {
      alert(`Error removing item: ${error.message}`);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const handleCheckout = () => {
    // TODO: Implement checkout flow
    alert('Checkout coming soon!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-24 h-24 bg-gray-200 rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                ))}
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
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-600 font-medium">Error loading cart</p>
            <p className="text-red-500 text-sm mt-2">{error}</p>
            <button
              onClick={() => fetchCart()}
              className="mt-4 bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700 transition"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-8">Add some products to your cart to get started</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-primary text-white px-8 py-3 rounded-full hover:bg-green-600 transition"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex gap-6">
                  <img
                    src={item.product.image || '/placeholder.jpg'}
                    alt={item.product.name}
                    className="w-24 h-24 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/100x100?text=Product';
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {item.product.name}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {formatPrice(item.unitPrice)}
                    </p>
                    {item.variant && (
                      <p className="text-gray-500 text-sm">
                        {item.variant.name}: {item.variant.value}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center border border-gray-300 rounded-full">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={updatingItem === item.id}
                          className="px-3 py-2 hover:bg-gray-100 transition disabled:opacity-50"
                        >
                          -
                        </button>
                        <span className="px-4 py-2 border-x border-gray-300 min-w-[3rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={updatingItem === item.id}
                          className="px-3 py-2 hover:bg-gray-100 transition disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        disabled={updatingItem === item.id}
                        className="text-red-500 hover:text-red-700 transition"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">
                      {formatPrice(item.totalPrice)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold">Free</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-semibold">$0.00</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full mt-6 bg-primary text-white py-3 rounded-full hover:bg-green-600 transition"
              >
                Proceed to Checkout
              </button>
              <p className="text-xs text-gray-500 mt-3 text-center">
                Free shipping on orders over $50
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}