import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import db from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Generate JWT tokens
function generateTokens(userId) {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });

  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'
  });

  return { accessToken, refreshToken };
}

// Register new user
router.post('/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').trim().notEmpty()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, name } = req.body;

      // Check if user already exists
      const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Generate email verification token
      const verifyToken = jwt.sign(
        { email, type: 'verify_email' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Insert user with email_verified = 0
      const result = db.prepare(`
        INSERT INTO users (email, password_hash, name, role, email_verified)
        VALUES (?, ?, ?, 'customer', 0)
      `).run(email, passwordHash, name);

      const userId = result.lastInsertRowid;

      // Log verification token (in production, send email)
      console.log(`Email verification token for ${email}: ${verifyToken}`);

      res.status(201).json({
        message: 'User registered successfully. Please check your email for verification instructions.',
        verificationToken: verifyToken
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }
);

// Login
router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, rememberMe } = req.body;

      // Get user
      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Verify password
      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Check if email is verified
      if (!user.email_verified) {
        return res.status(403).json({
          error: 'Please verify your email address before logging in',
          needsVerification: true
        });
      }

      // Generate tokens
      const tokens = generateTokens(user.id);

      // Remove password from response
      const { password_hash, ...userWithoutPassword } = user;

      res.json({
        message: 'Login successful',
        user: userWithoutPassword,
        ...tokens,
        rememberMe: !!rememberMe
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }
);

// Refresh token
router.post('/refresh-token',
  body('refreshToken').notEmpty(),
  (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { refreshToken } = req.body;

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

      // Generate new tokens
      const tokens = generateTokens(decoded.userId);

      res.json({
        message: 'Token refreshed',
        ...tokens
      });
    } catch (error) {
      res.status(403).json({ error: 'Invalid refresh token' });
    }
  }
);

// Get current user profile
router.get('/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// Password reset request
router.post('/forgot-password',
  body('email').isEmail().normalizeEmail(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email } = req.body;

      // Check if user exists
      const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email);

      // Always return success to prevent email enumeration
      res.json({
        message: 'If an account exists with this email, a password reset link has been sent'
      });

      if (user) {
        // In production, send actual email
        // For now, generate reset token and log it
        const resetToken = jwt.sign({ userId: user.id, type: 'reset' }, process.env.JWT_SECRET, {
          expiresIn: '1h'
        });
        console.log(`Password reset token for ${email}: ${resetToken}`);
      }
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({ error: 'Password reset request failed' });
    }
  }
);

// Reset password
router.post('/reset-password',
  [
    body('token').notEmpty(),
    body('newPassword').isLength({ min: 6 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { token, newPassword } = req.body;

      // Verify reset token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.type !== 'reset') {
        return res.status(400).json({ error: 'Invalid reset token' });
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(newPassword, 10);

      // Update password
      db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(passwordHash, decoded.userId);

      res.json({ message: 'Password reset successful' });
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(400).json({ error: 'Invalid or expired reset token' });
    }
  }
);

// Change password (authenticated)
router.post('/change-password',
  authenticateToken,
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 6 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { currentPassword, newPassword } = req.body;

      // Get user with password
      const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.id);

      // Verify current password
      const validPassword = await bcrypt.compare(currentPassword, user.password_hash);
      if (!validPassword) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(newPassword, 10);

      // Update password
      db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(passwordHash, req.user.id);

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ error: 'Password change failed' });
    }
  }
);

// Logout (client-side only, just return success)
router.post('/logout', authenticateToken, (req, res) => {
  res.json({ message: 'Logout successful' });
});

// Google OAuth login (mock implementation)
router.post('/google', async (req, res) => {
  try {
    // Mock Google OAuth - in a real app, this would redirect to Google's OAuth
    // For demo purposes, we'll create or find a user and return tokens

    const mockGoogleUser = {
      email: 'demo.google@example.com',
      name: 'Demo Google User',
      picture: 'https://via.placeholder.com/150',
      googleId: 'google_12345'
    };

    // Check if user already exists
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(mockGoogleUser.email);

    if (!user) {
      // Create new user
      const passwordHash = await bcrypt.hash('GoogleOAuth123!', 10);
      const result = db.prepare(`
        INSERT INTO users (email, password_hash, name, role, email_verified, avatar_url)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        mockGoogleUser.email,
        passwordHash,
        mockGoogleUser.name,
        'customer',
        1, // email_verified
        mockGoogleUser.picture
      );

      user = {
        id: result.lastInsertRowid,
        email: mockGoogleUser.email,
        name: mockGoogleUser.name,
        role: 'customer',
        email_verified: 1,
        avatar_url: mockGoogleUser.picture
      };
    }

    // Generate tokens
    const tokens = generateTokens(user.id);

    // Remove password from response
    const { password_hash, ...userWithoutPassword } = user;

    res.json({
      message: 'Google login successful',
      user: userWithoutPassword,
      ...tokens
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ error: 'Google login failed' });
  }
});

// Verify email address
router.post('/verify-email',
  body('token').notEmpty(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { token } = req.body;

      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.type !== 'verify_email') {
        return res.status(400).json({ error: 'Invalid verification token' });
      }

      // Update user's email verification status
      const result = db.prepare('UPDATE users SET email_verified = 1, updated_at = CURRENT_TIMESTAMP WHERE email = ?')
        .run(decoded.email);

      if (result.changes === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ message: 'Email verified successfully' });
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(400).json({ error: 'Invalid or expired verification token' });
    }
  }
);

// Resend verification email
router.post('/resend-verification',
  body('email').isEmail().normalizeEmail(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email } = req.body;

      // Find user
      const user = db.prepare('SELECT id, email_verified FROM users WHERE email = ?').get(email);

      if (!user) {
        // Always return success to prevent email enumeration
        return res.json({
          message: 'If an account exists with this email, a verification link has been sent'
        });
      }

      if (user.email_verified) {
        return res.status(400).json({ error: 'Email is already verified' });
      }

      // Generate new verification token
      const verifyToken = jwt.sign(
        { email, type: 'verify_email' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Log verification token (in production, send email)
      console.log(`Resent email verification token for ${email}: ${verifyToken}`);

      res.json({
        message: 'Verification email sent successfully',
        verificationToken: verifyToken
      });
    } catch (error) {
      console.error('Resend verification error:', error);
      res.status(500).json({ error: 'Failed to send verification email' });
    }
  }
);

export default router;
