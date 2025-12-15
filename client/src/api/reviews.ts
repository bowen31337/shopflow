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

interface ReviewsResponse {
  success: boolean;
  product: {
    id: number;
    name: string;
  };
  reviews: Review[];
  count: number;
  average_rating: number;
  total_reviews: number;
  rating_distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

/**
 * Fetch reviews for a product
 * @param {number} productId - Product ID
 * @param {Object} options - Optional filtering and sorting options
 * @param {number|string} options.rating - Filter by rating (1-5) or 'all'
 * @param {string} options.sort - Sort by 'date', 'helpfulness', or 'rating'
 * @returns {Promise<ReviewsResponse>} Reviews response with metadata
 */
export async function fetchProductReviews(productId: number, options?: { rating?: number | string; sort?: string }): Promise<ReviewsResponse> {
  try {
    const params = new URLSearchParams();
    if (options?.rating && options.rating !== 'all') {
      params.append('rating', String(options.rating));
    }
    if (options?.sort) {
      params.append('sort', options.sort);
    }

    const queryString = params.toString();
    const url = `/api/products/${productId}/reviews${queryString ? `?${queryString}` : ''}`;

    const response = await api.get(url);
    return response;
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    throw error;
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
    const response = await api.post(`/api/products/${productId}/reviews`, reviewData);
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
    const response = await api.put(`/api/reviews/${reviewId}`, reviewData);
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
    const response = await api.delete(`/api/reviews/${reviewId}`);
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
    const response = await api.post(`/api/reviews/${reviewId}/helpful`);
    return response;
  } catch (error) {
    console.error('Error marking review as helpful:', error);
    throw error;
  }
}