const express = require('express');
const router = express.Router();
const db = require('../config/sqlite-db');

// Get user language preference
router.get('/language-preference', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const query = 'SELECT language_code FROM user_language_preferences WHERE user_id = ?';
    db.get(query, [userId], (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json({ language: row?.language_code || 'en' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user language preference
router.post('/language-preference', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { language } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (!language || typeof language !== 'string') {
      return res.status(400).json({ error: 'Language code is required' });
    }

    const query = `
      INSERT OR REPLACE INTO user_language_preferences (user_id, language_code, updated_at)
      VALUES (?, ?, datetime('now'))
    `;
    
    db.run(query, [userId, language], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to save language preference' });
      }
      
      res.json({ 
        success: true, 
        language,
        message: 'Language preference saved successfully' 
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
