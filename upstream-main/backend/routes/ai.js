const express = require('express');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// AI chat endpoint - requires authentication and specific roles
router.post('/chat', 
  authMiddleware, 
  requireRole(['admin', 'lawyer', 'judge']),
  async (req, res) => {
    try {
      const { model, messages } = req.body;

      if (!model || !messages) {
        return res.status(400).json({ error: 'חסרים פרמטרים נדרשים' });
      }

      console.log(`AI request from user ${req.user.email} (${req.user.role})`);

      // Mock response for now - replace with actual Hugging Face API call
      const mockResponse = {
        choices: [{
          message: {
            content: `זהו ניתוח משפטי דמה עבור המקרה שהוגש. 
            
בהתבסס על הפרטים שסופקו, ניתן לראות כי:

1. **ניתוח ראשוני**: המקרה מעלה שאלות משפטיות מעניינות בתחום המשפט האזרחי.

2. **הערכת ראיות**: יש צורך בבחינה מעמיקה יותר של הראיות הקיימות.

3. **המלצות**: מומלץ לאסוף ראיות נוספות ולהתייעץ עם מומחה בתחום.

*הערה: זהו ניתוח ראשוני בלבד ואינו מהווה ייעוץ משפטי מחייב.*`
          }
        }]
      };

      res.json(mockResponse);

    } catch (error) {
      console.error('AI service error:', error);
      res.status(500).json({ error: 'שגיאה בשירות הבינה המלאכותית' });
    }
  }
);

module.exports = router;