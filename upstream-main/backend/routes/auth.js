const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const { users } = require('../middleware/auth');

const router = express.Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'יותר מדי ניסיונות התחברות, נסה שוב בעוד 15 דקות',
  standardHeaders: true,
  legacyHeaders: false,
});

// Registration endpoint
router.post('/register', 
  authLimiter,
  [
    body('email').isEmail().withMessage('כתובת אימייל לא תקינה'),
    body('password').isLength({ min: 8 }).withMessage('סיסמה חייבת להכיל לפחות 8 תווים'),
    body('name').trim().isLength({ min: 2 }).withMessage('שם חייב להכיל לפחות 2 תווים'),
    body('role').isIn(['admin', 'lawyer', 'plaintiff', 'judge']).withMessage('תפקיד לא תקין')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'נתונים לא תקינים', 
          details: errors.array() 
        });
      }

      const { email, password, name, role } = req.body;

      // Check if user already exists
      const existingUser = users.find(u => u.email === email);
      if (existingUser) {
        return res.status(400).json({ error: 'משתמש עם אימייל זה כבר קיים' });
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const user = {
        id: Date.now().toString(),
        email,
        password: hashedPassword,
        name,
        role,
        createdAt: new Date().toISOString()
      };

      users.push(user);

      // Generate JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      console.log(`New user registered: ${email} (${role})`);

      res.status(201).json({
        message: 'משתמש נוצר בהצלחה',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'שגיאה ביצירת משתמש' });
    }
  }
);

// Login endpoint
router.post('/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('כתובת אימייל לא תקינה'),
    body('password').exists().withMessage('סיסמה נדרשת')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'נתונים לא תקינים', 
          details: errors.array() 
        });
      }

      const { email, password } = req.body;

      // Find user
      const user = users.find(u => u.email === email);
      if (!user) {
        return res.status(401).json({ error: 'אימייל או סיסמה שגויים' });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'אימייל או סיסמה שגויים' });
      }

      // Generate JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      console.log(`User logged in: ${email} (${user.role})`);

      res.json({
        message: 'התחברת בהצלחה',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'שגיאה בהתחברות' });
    }
  }
);

module.exports = router;