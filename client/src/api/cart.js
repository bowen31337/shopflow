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