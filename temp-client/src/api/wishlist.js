// API functions for wishlist

export async function fetchWishlist() {
  const response = await fetch('/api/wishlist');

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch wishlist');
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
    throw new Error(error.message || 'Failed to add product to wishlist');
  }

  return response.json();
}

export async function removeFromWishlist(productId) {
  const response = await fetch(`/api/wishlist/${productId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to remove product from wishlist');
  }

  return response.json();
}

export async function moveWishlistToCart(productId, quantity = 1) {
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
    throw new Error(error.message || 'Failed to move product to cart');
  }

  return response.json();
}

export async function getSharedWishlist(userId) {
  const response = await fetch(`/api/wishlist/shared/${userId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch shared wishlist');
  }

  return response.json();
}