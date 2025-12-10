import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../stores/cartStore';
import useAuthStore from '../stores/authStore';

export default function Cart() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    items,
    isLoading,
    error,
    fetchCart,
    updateQuantity,
    removeFromCart,
    clearError
  } = useCartStore();

  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user]);

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1 || newQuantity > 99) return;
    try {
      await updateQuantity(itemId, newQuantity);
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await removeFromCart(itemId);
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const subtotal = items.reduce((sum, item) => {
    const price = item.variant?.adjustedPrice || item.product.price;
    return sum + price * item.quantity;
  }, 0);

  const tax = subtotal * 0.08; // 8% tax
  const shipping = subtotal > 50 ? 0 : 9.99; // Free shipping over $50
  const total = subtotal + tax + shipping;

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Cart</h1>
          <p className="text-gray-600 mb-4">
            Please log in to view your cart
          </p>
          <button
            onClick={() => navigate('/login')}
            className="bg-emerald-600 text-white px-6 py-2 rounded-md hover:bg-emerald-700 transition-colors"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <span className="block sm:inline">{error}</span>
          <button
            onClick={clearError}
            className="ml-2 text-sm underline hover:text-red-800"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading cart...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🛒</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">Add some products to get started</p>
              <button
                onClick={() => navigate('/products')}
                className="bg-emerald-600 text-white px-6 py-2 rounded-md hover:bg-emerald-700 transition-colors"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const price = item.variant?.adjustedPrice || item.product.price;
                const totalPrice = price * item.quantity;

                return (
                  <div key={item.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.product.image || '/api/placeholder/150/150'}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded-md flex-shrink-0"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {item.product.name}
                        </h3>
                        {item.variant && (
                          <p className="text-sm text-gray-600">
                            {item.variant.name}: {item.variant.value}
                            {item.variant.price_adjustment !== 0 && (
                              <span className="ml-2 text-emerald-600">
                                {item.variant.price_adjustment > 0 ? '+' : ''}
                                {(item.variant.price_adjustment).toFixed(2)}
                              </span>
                            )}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                            >
                              -
                            </button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                            >
                              +
                            </button>
                          </div>
                          <span className="font-semibold text-gray-900">
                            {totalPrice.toLocaleString('en-US', {
                              style: 'currency',
                              currency: 'USD'
                            })}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>{subtotal.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD'
                })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span>{shipping === 0 ? 'FREE' : shipping.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD'
                })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span>{tax.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD'
                })}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span>{total.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD'
                })}</span>
              </div>
            </div>

            {items.length > 0 && (
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-emerald-600 text-white py-3 rounded-md hover:bg-emerald-700 transition-colors font-semibold"
                >
                  Proceed to Checkout
                </button>
                <button
                  onClick={() => navigate('/products')}
                  className="w-full border border-gray-300 text-gray-700 py-3 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}