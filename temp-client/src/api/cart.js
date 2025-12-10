// API functions for cart

export async function fetchCart() {
  const response = await fetch('/api/cart');

  if (!response.ok) {
    throw new Error('Failed to fetch cart');
  }

  return response.json();
}

export async function addToCart(productId, quantity, variantId = null) {
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
    const error = await response.json();
    throw new Error(error.error || 'Failed to add item to cart');
  }

  return response.json();
}

export async function updateCartItem(id, quantity) {
  const response = await fetch(`/api/cart/items/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      quantity
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update cart item');
  }

  return response.json();
}

export async function removeFromCart(id) {
  const response = await fetch(`/api/cart/items/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to remove item from cart');
  }

  return response.json();
}