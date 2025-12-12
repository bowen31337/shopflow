import api from './index.js';

// TypeScript interfaces
interface ReviewData {
  rating: number;
  title?: string;
  content: string;
}

interface Review {
  id: number;
  product_id: number;
  user_id: number;
  rating: number;
  title: string | null;
  content: string;
  is_verified_purchase: number;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  user_name: string;
  user_email: string;
  images: Array<{
    id: number;
    url: string;
  }>;
}

/**
 * Fetch reviews for a product
 * @param {number} productId - Product ID
 * @returns {Promise<Array>} Array of reviews
 */
export async function fetchProductReviews(productId: number): Promise<Review[]> {
  try {
    const response = await api.get(`/products/${productId}/reviews`);
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
export async function submitProductReview(productId: number, reviewData: ReviewData): Promise<Review> {
  try {
    const response = await api.post(`/products/${productId}/reviews`, reviewData);
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
export async function updateReview(reviewId: number, reviewData: Partial<ReviewData>): Promise<Review> {
  try {
    const response = await api.put(`/reviews/${reviewId}`, reviewData);
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
export async function deleteReview(reviewId: number): Promise<{ success: boolean; message: string }> {
  try {
    const response = await api.delete(`/reviews/${reviewId}`);
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
export async function markReviewAsHelpful(reviewId: number): Promise<{ success: boolean; message: string; helpful_count: number }> {
  try {
    const response = await api.post(`/reviews/${reviewId}/helpful`);
    return response;
  } catch (error) {
    console.error('Error marking review as helpful:', error);
    throw error;
  }
}