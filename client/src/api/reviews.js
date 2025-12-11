import { apiRequest } from './index.js';

/**
 * Fetch reviews for a product
 * @param {number} productId - Product ID
 * @returns {Promise<Array>} Array of reviews
 */
export async function fetchProductReviews(productId) {
  try {
    const response = await apiRequest(`/products/${productId}/reviews`, 'GET');
    return response.reviews || [];
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    return [];
  }
}

/**
 * Submit a review for a product
 * @param {number} productId - Product ID
 * @param {Object} reviewData - Review data
 * @param {number} reviewData.rating - Rating (1-5)
 * @param {string} reviewData.title - Review title (optional)
 * @param {string} reviewData.content - Review content
 * @returns {Promise<Object>} Created review
 */
export async function submitProductReview(productId, reviewData) {
  try {
    const response = await apiRequest(`/products/${productId}/reviews`, 'POST', reviewData);
    return response.review;
  } catch (error) {
    console.error('Error submitting review:', error);
    throw error;
  }
}

/**
 * Update a review
 * @param {number} reviewId - Review ID
 * @param {Object} reviewData - Updated review data
 * @returns {Promise<Object>} Updated review
 */
export async function updateReview(reviewId, reviewData) {
  try {
    const response = await apiRequest(`/reviews/${reviewId}`, 'PUT', reviewData);
    return response.review;
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
}

/**
 * Delete a review
 * @param {number} reviewId - Review ID
 * @returns {Promise<Object>} Success response
 */
export async function deleteReview(reviewId) {
  try {
    const response = await apiRequest(`/reviews/${reviewId}`, 'DELETE');
    return response;
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
}

/**
 * Mark a review as helpful
 * @param {number} reviewId - Review ID
 * @returns {Promise<Object>} Updated review with helpful count
 */
export async function markReviewAsHelpful(reviewId) {
  try {
    const response = await apiRequest(`/reviews/${reviewId}/helpful`, 'POST');
    return response;
  } catch (error) {
    console.error('Error marking review as helpful:', error);
    throw error;
  }
}