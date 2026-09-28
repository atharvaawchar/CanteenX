import express from 'express';
import db from '../config/db.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all pickup slots with live booking count
router.get('/', (req, res) => {
  try {
    const slots = db.prepare('SELECT * FROM pickup_slots WHERE is_active = 1 ORDER BY id ASC').all();
    res.json(slots);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pickup slots' });
  }
});

// Admin: Update slot capacity or toggle active
router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { capacity, is_active } = req.body;
    db.prepare(`
      UPDATE pickup_slots 
      SET capacity = COALESCE(?, capacity),
          is_active = COALESCE(?, is_active)
      WHERE id = ?
    `).run(capacity, is_active, req.params.id);

    const updated = db.prepare('SELECT * FROM pickup_slots ORDER BY id ASC').all();
    req.io?.emit('slots_updated', updated);

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update slot' });
  }
});

export default router;
