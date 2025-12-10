import express from 'express';
import { body, param } from 'express-validator';
import db from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;

    const user = db.prepare(`
      SELECT id, email, name, phone, avatar_url, role, created_at, updated_at
      FROM users
      WHERE id = ?
    `).get(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        avatarUrl: user.avatar_url,
        role: user.role,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', [
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
], authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, email } = req.body;

    // Check if email is already taken by another user
    if (email) {
      const existingUser = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, userId);
      if (existingUser) {
        return res.status(400).json({ error: 'Email is already taken' });
      }
    }

    // Update user
    const result = db.prepare(`
      UPDATE users
      SET name = COALESCE(?, name),
          phone = COALESCE(?, phone),
          email = COALESCE(?, email),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name || null, phone || null, email || null, userId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return updated user
    const updatedUser = db.prepare(`
      SELECT id, email, name, phone, avatar_url, role, created_at, updated_at
      FROM users
      WHERE id = ?
    `).get(userId);

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        phone: updatedUser.phone,
        avatarUrl: updatedUser.avatar_url,
        role: updatedUser.role,
        createdAt: updatedUser.created_at,
        updatedAt: updatedUser.updated_at
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change password
router.post('/change-password', [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
], authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const bcrypt = require('bcryptjs');

    // Get current user
    const user = db.prepare('SELECT id, email, password_hash FROM users WHERE id = ?').get(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isMatch = bcrypt.compareSync(currentPassword, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = bcrypt.hashSync(newPassword, saltRounds);

    // Update password
    db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(hashedPassword, userId);

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Get user addresses
router.get('/addresses', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;

    const addresses = db.prepare(`
      SELECT id, user_id, label, first_name, last_name, street_address, apartment, city, state, postal_code, country, phone, is_default
      FROM addresses
      WHERE user_id = ?
      ORDER BY is_default DESC, created_at DESC
    `).all(userId);

    res.json({ addresses });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ error: 'Failed to fetch addresses' });
  }
});

// Add new address
router.post('/addresses', [
  body('label').isLength({ min: 2 }).withMessage('Label must be at least 2 characters'),
  body('firstName').isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  body('lastName').isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
  body('streetAddress').isLength({ min: 5 }).withMessage('Street address must be at least 5 characters'),
  body('city').isLength({ min: 2 }).withMessage('City must be at least 2 characters'),
  body('state').isLength({ min: 2 }).withMessage('State must be at least 2 characters'),
  body('postalCode').isLength({ min: 3 }).withMessage('Postal code must be at least 3 characters'),
  body('country').isLength({ min: 2 }).withMessage('Country must be at least 2 characters'),
  body('phone').isMobilePhone().withMessage('Please provide a valid phone number')
], authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const {
      label, firstName, lastName, streetAddress, apartment, city, state, postalCode, country, phone, isDefault
    } = req.body;

    // If setting as default, unset other defaults
    if (isDefault) {
      db.prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?').run(userId);
    }

    // Insert new address
    const result = db.prepare(`
      INSERT INTO addresses (user_id, label, first_name, last_name, street_address, apartment, city, state, postal_code, country, phone, is_default)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(userId, label, firstName, lastName, streetAddress, apartment || null, city, state, postalCode, country, phone, isDefault ? 1 : 0);

    // Return new address
    const newAddress = db.prepare(`
      SELECT id, user_id, label, first_name, last_name, street_address, apartment, city, state, postal_code, country, phone, is_default
      FROM addresses
      WHERE id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({
      message: 'Address added successfully',
      address: newAddress
    });
  } catch (error) {
    console.error('Error adding address:', error);
    res.status(500).json({ error: 'Failed to add address' });
  }
});

// Update address
router.put('/addresses/:id', [
  body('label').optional().isLength({ min: 2 }),
  body('firstName').optional().isLength({ min: 2 }),
  body('lastName').optional().isLength({ min: 2 }),
  body('streetAddress').optional().isLength({ min: 5 }),
  body('city').optional().isLength({ min: 2 }),
  body('state').optional().isLength({ min: 2 }),
  body('postalCode').optional().isLength({ min: 3 }),
  body('country').optional().isLength({ min: 2 }),
  body('phone').optional().isMobilePhone()
], authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const {
      label, firstName, lastName, streetAddress, apartment, city, state, postalCode, country, phone, isDefault
    } = req.body;

    // Check if address belongs to user
    const address = db.prepare('SELECT id, user_id FROM addresses WHERE id = ? AND user_id = ?').get(id, userId);

    if (!address) {
      return res.status(404).json({ error: 'Address not found' });
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      db.prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?').run(userId);
    }

    // Update address
    db.prepare(`
      UPDATE addresses
      SET label = COALESCE(?, label),
          first_name = COALESCE(?, first_name),
          last_name = COALESCE(?, last_name),
          street_address = COALESCE(?, street_address),
          apartment = COALESCE(?, apartment),
          city = COALESCE(?, city),
          state = COALESCE(?, state),
          postal_code = COALESCE(?, postal_code),
          country = COALESCE(?, country),
          phone = COALESCE(?, phone),
          is_default = ?
      WHERE id = ?
    `).run(
      label || null, firstName || null, lastName || null, streetAddress || null,
      apartment || null, city || null, state || null, postalCode || null,
      country || null, phone || null, isDefault ? 1 : 0, id
    );

    // Return updated address
    const updatedAddress = db.prepare(`
      SELECT id, user_id, label, first_name, last_name, street_address, apartment, city, state, postal_code, country, phone, is_default
      FROM addresses
      WHERE id = ?
    `).get(id);

    res.json({
      message: 'Address updated successfully',
      address: updatedAddress
    });
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ error: 'Failed to update address' });
  }
});

// Delete address
router.delete('/addresses/:id', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Check if address belongs to user
    const address = db.prepare('SELECT id, user_id FROM addresses WHERE id = ? AND user_id = ?').get(id, userId);

    if (!address) {
      return res.status(404).json({ error: 'Address not found' });
    }

    // Delete address
    db.prepare('DELETE FROM addresses WHERE id = ?').run(id);

    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({ error: 'Failed to delete address' });
  }
});

export default router;