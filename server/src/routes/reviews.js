import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import db from '../database.js';
import { body, param, validationResult } from 'express-validator';

const router = express.Router();

// Helper function to handle validation errors
const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  return null;
};

// GET /api/products/:id/reviews - Get reviews for a product
router.get('/products/:id/reviews', [
  param('id').isInt({ min: 1 })
], (req, res) => {
  const validationError = handleValidationErrors(req, res);
  if (validationError) return validationError;

  try {
    const productId = parseInt(req.params.id);

    // Check if product exists
    const product = db.prepare('SELECT id, name FROM products WHERE id = ? AND is_active = 1').get(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Get reviews with user information
    const reviews = db.prepare(`
      SELECT
        r.id,
        r.product_id,
        r.user_id,
        r.rating,
        r.title,
        r.content,
        r.is_verified_purchase,
        r.helpful_count,
        r.created_at,
        r.updated_at,
        u.name as user_name,
        u.email as user_email
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.product_id = ?
      ORDER BY r.created_at DESC
    `).all(productId);

    // Get review images
    const reviewsWithImages = reviews.map(review => {
      const images = db.prepare(`
        SELECT id, url
        FROM review_images
        WHERE review_id = ?
        ORDER BY id
      `).all(review.id);

      return {
        ...review,
        images
      };
    });

    res.json({
      success: true,
      product: {
        id: product.id,
        name: product.name
      },
      reviews: reviewsWithImages,
      count: reviewsWithImages.length
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews'
    });
  }
});

// POST /api/products/:id/reviews - Submit a review
router.post('/products/:id/reviews', authenticateToken, [
  param('id').isInt({ min: 1 }),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('title').optional().isString().trim().isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),
  body('content').isString().trim().isLength({ min: 10, max: 2000 }).withMessage('Content must be between 10 and 2000 characters')
], (req, res) => {
  const validationError = handleValidationErrors(req, res);
  if (validationError) return validationError;

  try {
    const productId = parseInt(req.params.id);
    const userId = req.user.id;
    const { rating, title, content } = req.body;

    // Check if product exists
    const product = db.prepare('SELECT id, name FROM products WHERE id = ? AND is_active = 1').get(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user has already reviewed this product
    const existingReview = db.prepare('SELECT id FROM reviews WHERE product_id = ? AND user_id = ?').get(productId, userId);
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }

    // Check if user has purchased this product (for verified purchase badge)
    const hasPurchased = db.prepare(`
      SELECT 1 FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE oi.product_id = ? AND o.user_id = ? AND o.status = 'delivered'
      LIMIT 1
    `).get(productId, userId);

    // Insert review
    const result = db.prepare(`
      INSERT INTO reviews (product_id, user_id, rating, title, content, is_verified_purchase)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(productId, userId, rating, title || null, content, hasPurchased ? 1 : 0);

    const reviewId = result.lastInsertRowid;

    // Get the created review
    const newReview = db.prepare(`
      SELECT
        r.id,
        r.product_id,
        r.user_id,
        r.rating,
        r.title,
        r.content,
        r.is_verified_purchase,
        r.helpful_count,
        r.created_at,
        r.updated_at,
        u.name as user_name,
        u.email as user_email
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.id = ?
    `).get(reviewId);

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review: {
        ...newReview,
        images: [] // No images initially
      }
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit review'
    });
  }
});

// PUT /api/reviews/:id - Update a review
router.put('/reviews/:id', authenticateToken, [
  param('id').isInt({ min: 1 }),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('title').optional().isString().trim().isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),
  body('content').optional().isString().trim().isLength({ min: 10, max: 2000 }).withMessage('Content must be between 10 and 2000 characters')
], (req, res) => {
  const validationError = handleValidationErrors(req, res);
  if (validationError) return validationError;

  try {
    const reviewId = parseInt(req.params.id);
    const userId = req.user.id;
    const { rating, title, content } = req.body;

    // Check if review exists and belongs to user
    const review = db.prepare('SELECT id, user_id FROM reviews WHERE id = ?').get(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    if (review.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own reviews'
      });
    }

    // Build update query dynamically based on provided fields
    const updates = [];
    const params = [];

    if (rating !== undefined) {
      updates.push('rating = ?');
      params.push(rating);
    }

    if (title !== undefined) {
      updates.push('title = ?');
      params.push(title || null); // Allow null for title
    }

    if (content !== undefined) {
      updates.push('content = ?');
      params.push(content);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(reviewId);

    const updateQuery = `UPDATE reviews SET ${updates.join(', ')} WHERE id = ?`;
    db.prepare(updateQuery).run(...params);

    // Get updated review
    const updatedReview = db.prepare(`
      SELECT
        r.id,
        r.product_id,
        r.user_id,
        r.rating,
        r.title,
        r.content,
        r.is_verified_purchase,
        r.helpful_count,
        r.created_at,
        r.updated_at,
        u.name as user_name,
        u.email as user_email
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.id = ?
    `).get(reviewId);

    // Get review images
    const images = db.prepare(`
      SELECT id, url
      FROM review_images
      WHERE review_id = ?
      ORDER BY id
    `).all(reviewId);

    res.json({
      success: true,
      message: 'Review updated successfully',
      review: {
        ...updatedReview,
        images
      }
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review'
    });
  }
});

// DELETE /api/reviews/:id - Delete a review
router.delete('/reviews/:id', authenticateToken, [
  param('id').isInt({ min: 1 })
], (req, res) => {
  const validationError = handleValidationErrors(req, res);
  if (validationError) return validationError;

  try {
    const reviewId = parseInt(req.params.id);
    const userId = req.user.id;

    // Check if review exists and belongs to user
    const review = db.prepare('SELECT id, user_id FROM reviews WHERE id = ?').get(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    if (review.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own reviews'
      });
    }

    // Delete review (cascade will delete review_images)
    db.prepare('DELETE FROM reviews WHERE id = ?').run(reviewId);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review'
    });
  }
});

// POST /api/reviews/:id/helpful - Mark review as helpful
router.post('/reviews/:id/helpful', authenticateToken, [
  param('id').isInt({ min: 1 })
], (req, res) => {
  const validationError = handleValidationErrors(req, res);
  if (validationError) return validationError;

  try {
    const reviewId = parseInt(req.params.id);
    const userId = req.user.id;

    // Check if review exists
    const review = db.prepare('SELECT id FROM reviews WHERE id = ?').get(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user has already marked this review as helpful
    // Note: We're not tracking which users marked as helpful, just incrementing count
    // In a production app, you'd want to track this to prevent multiple votes

    // Increment helpful count
    db.prepare('UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = ?').run(reviewId);

    // Get updated helpful count
    const updatedReview = db.prepare('SELECT helpful_count FROM reviews WHERE id = ?').get(reviewId);

    res.json({
      success: true,
      message: 'Review marked as helpful',
      helpful_count: updatedReview.helpful_count
    });
  } catch (error) {
    console.error('Error marking review as helpful:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark review as helpful'
    });
  }
});

export default router;