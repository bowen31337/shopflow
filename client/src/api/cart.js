// API functions for cart

export async function fetchCart() {
  const response = await fetch('/api/cart');

  if (!response.ok) {
    throw new Error('Failed to fetch cart');
  }

  return response.json();
}

export async function addToCart(productId, quantity = 1, variantId = null) {
  const response = await fetch('/api/cart/items', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      productId,
      quantity,
      variantId
    })
  });

  if (!response.ok) {
    throw new Error('Failed to add item to cart');
  }

  return response.json();
}

export async function updateCartItem(itemId, quantity) {
  const response = await fetch(`/api/cart/items/${itemId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      quantity
    })
  });

  if (!response.ok) {
    throw new Error('Failed to update cart item');
  }

  return response.json();
}

export async function removeFromCart(itemId) {
  const response = await fetch(`/api/cart/items/${itemId}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    throw new Error('Failed to remove item from cart');
  }

  return response.json();
}

// Wishlist API functions for Save for Later functionality
export async function addToWishlist(productId) {
  const response = await fetch('/api/wishlist', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      product_id: productId
    })
  });

  if (!response.ok) {
    throw new Error('Failed to add to wishlist');
  }

  return response.json();
}

export async function removeFromWishlist(productId) {
  const response = await fetch(`/api/wishlist/${productId}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    throw new Error('Failed to remove from wishlist');
  }

  return response.json();
}

// Promo code API functions
export async function applyPromoCode(code) {
  const response = await fetch('/api/cart/promo-code', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      code
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to apply promo code');
  }

  return response.json();
}

export async function removePromoCode() {
  const response = await fetch('/api/cart/promo-code', {
    method: 'DELETE'
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to remove promo code');
  }

  return response.json();
}

export async function getCartTotals() {
  const response = await fetch('/api/cart/totals');

  if (!response.ok) {
    throw new Error('Failed to get cart totals');
  }

  return response.json();
}