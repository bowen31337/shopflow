// API functions for wishlist operations

export async function fetchWishlist() {
  const response = await fetch('/api/wishlist');

  if (!response.ok) {
    throw new Error('Failed to fetch wishlist');
  }

  return response.json();
}

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
    const error = await response.json();
    throw new Error(error.message || 'Failed to add to wishlist');
  }

  return response.json();
}

export async function removeFromWishlist(productId) {
  const response = await fetch(`/api/wishlist/${productId}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to remove from wishlist');
  }

  return response.json();
}

export async function moveToCart(productId, quantity = 1) {
  const response = await fetch(`/api/wishlist/${productId}/move-to-cart`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      quantity
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to move to cart');
  }

  return response.json();
}

export async function getSharedWishlist(userId) {
  const response = await fetch(`/api/wishlist/shared/${userId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch shared wishlist');
  }

  return response.json();
}