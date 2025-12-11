import useCartStore from '../stores/cartStore';

export default function CartDrawer({ isOpen, onClose }) {
  const { items, wishlistItems, getItemCount, getTotal, removeFromCart, updateQuantity, saveForLater, moveToCart, removeFromWishlist, isLoading, error } = useCartStore();

  const handleRemove = async (itemId) => {
    try {
      await removeFromCart(itemId);
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await updateQuantity(itemId, newQuantity);
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  const handleSaveForLater = async (itemId) => {
    try {
      await saveForLater(itemId);
    } catch (error) {
      console.error('Failed to save for later:', error);
    }
  };

  const handleMoveToCart = async (productId, quantity = 1) => {
    try {
      await moveToCart(productId, quantity);
    } catch (error) {
      console.error('Failed to move to cart:', error);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await removeFromWishlist(productId);
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 w-full max-w-md h-full bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Shopping Cart</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition"
              aria-label="Close cart"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {isLoading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading cart...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                <p className="font-semibold">Error:</p>
                <p>{error}</p>
              </div>
            )}

            {!isLoading && items.length === 0 && wishlistItems.length === 0 && (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🛒</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-gray-600 mb-4">Add some products to get started</p>
                <button
                  onClick={onClose}
                  className="bg-primary text-white px-6 py-2 rounded-full hover:bg-green-600 transition"
                >
                  Continue Shopping
                </button>
              </div>
            )}

            {/* Cart Items Section */}
            {!isLoading && items.length > 0 && (
              <div className="mb-6">
                <h3 className="text-md font-semibold mb-3">Your Cart</h3>
                <div className="space-y-4">
                  {items.map((item) => {
                    const price = item.variant?.adjustedPrice || item.product.price;
                    const totalPrice = price * item.quantity;

                    return (
                      <div key={item.id} className="flex gap-3 border rounded-lg p-3">
                        {/* Product Image */}
                        <div className="w-20 h-20 flex-shrink-0">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-cover rounded"
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                          {item.variant && (
                            <p className="text-sm text-gray-600">
                              {item.variant.name}: {item.variant.value}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-primary font-semibold">${price.toFixed(2)}</p>

                            {/* Quantity Controls */}
                            <div className="flex items-center border rounded-lg overflow-hidden">
                              <button
                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                className="px-2 py-1 hover:bg-gray-100"
                                disabled={isLoading}
                              >
                                −
                              </button>
                              <span className="px-3 py-1 border-x bg-gray-50 min-w-[2rem] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                className="px-2 py-1 hover:bg-gray-100"
                                disabled={isLoading}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col items-end gap-2">
                          <p className="font-semibold">${totalPrice.toFixed(2)}</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSaveForLater(item.id)}
                              className="text-blue-500 hover:text-blue-700 text-sm"
                              disabled={isLoading}
                            >
                              Save for Later
                            </button>
                            <button
                              onClick={() => handleRemove(item.id)}
                              className="text-red-500 hover:text-red-700 text-sm"
                              disabled={isLoading}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Saved for Later Section */}
            {!isLoading && wishlistItems.length > 0 && (
              <div className="mb-6">
                <h3 className="text-md font-semibold mb-3">Saved for Later</h3>
                <div className="space-y-4">
                  {wishlistItems.map((item) => {
                    const price = item.product.price;

                    return (
                      <div key={item.id} className="flex gap-3 border rounded-lg p-3">
                        {/* Product Image */}
                        <div className="w-20 h-20 flex-shrink-0">
                          <img
                            src={item.product.image_url}
                            alt={item.product.name}
                            className="w-full h-full object-cover rounded"
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                          <p className="text-primary font-semibold">${price.toFixed(2)}</p>
                          {item.product.compare_at_price && (
                            <p className="text-red-500 line-through text-sm">
                              ${item.product.compare_at_price.toFixed(2)}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col items-end gap-2">
                          <button
                            onClick={() => handleMoveToCart(item.product.id, 1)}
                            className="bg-primary text-white px-3 py-1 rounded-full hover:bg-green-600 transition text-sm"
                            disabled={isLoading}
                          >
                            Move to Cart
                          </button>
                          <button
                            onClick={() => handleRemoveFromWishlist(item.product.id)}
                            className="text-red-500 hover:text-red-700 text-sm"
                            disabled={isLoading}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty Wishlist Message */}
            {!isLoading && items.length > 0 && wishlistItems.length === 0 && (
              <div className="text-center py-4 text-gray-500 text-sm">
                No items saved for later
              </div>
            )}
          </div>

          {/* Footer */}
          {!isLoading && items.length > 0 && (
            <div className="border-t p-4">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${getTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>$0.00</span>
                </div>
                <hr />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${getTotal().toFixed(2)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={onClose}
                  className="border border-gray-300 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-50 transition"
                >
                  Continue Shopping
                </button>
                <button className="bg-primary text-white px-4 py-2 rounded-full hover:bg-green-600 transition">
                  Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}