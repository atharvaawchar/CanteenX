import express from 'express';
import db from '../config/db.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all 20 tables & overview statistics
router.get('/', (req, res) => {
  try {
    const tables = db.prepare('SELECT * FROM tables ORDER BY id ASC').all();

    const summary = {
      total: tables.length,
      available: tables.filter(t => t.status === 'AVAILABLE').length,
      occupied: tables.filter(t => t.status === 'OCCUPIED').length,
      reserved: tables.filter(t => t.status === 'RESERVED').length,
      cleaning: tables.filter(t => t.status === 'CLEANING').length
    };

    res.json({ tables, summary });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch table layout' });
  }
});

// Reserve a Table (Student - 20 minutes lock, max 1 active reservation)
router.post('/reserve', authenticateToken, (req, res) => {
  try {
    const { table_id } = req.body;
    const userId = req.user.id;

    if (!table_id) {
      return res.status(400).json({ error: 'Table ID required' });
    }

    const table = db.prepare('SELECT * FROM tables WHERE id = ?').get(table_id);
    if (!table) {
      return res.status(404).json({ error: 'Table not found' });
    }

    if (table.status !== 'AVAILABLE') {
      return res.status(400).json({ error: `Table ${table.table_number} is currently ${table.status.toLowerCase()}. Please select another table.` });
    }

    // Check if user already has an active reservation
    const activeRes = db.prepare(`
      SELECT * FROM table_reservations 
      WHERE user_id = ? AND status = 'ACTIVE' AND datetime(reserved_until) > datetime('now')
    `).get(userId);

    if (activeRes) {
      const activeTable = db.prepare('SELECT table_number FROM tables WHERE id = ?').get(activeRes.table_id);
      return res.status(400).json({
        error: `You already have an active table reservation for Table ${activeTable ? activeTable.table_number : activeRes.table_id}.`
      });
    }

    // 20 minutes reservation duration
    const reservedUntil = new Date(Date.now() + 20 * 60 * 1000).toISOString();

    db.prepare('UPDATE tables SET status = "RESERVED" WHERE id = ?').run(table_id);

    db.prepare(`
      INSERT INTO table_reservations (table_id, user_id, reserved_until, status)
      VALUES (?, ?, ?, 'ACTIVE')
    `).run(table_id, userId, reservedUntil);

    db.prepare(`
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (?, ?, ?, 'info')
    `).run(userId, 'Table Reserved', `Table ${table.table_number} reserved for 20 minutes.`, 'info');

    const updatedTables = db.prepare('SELECT * FROM tables ORDER BY id ASC').all();
    req.io?.emit('tables_updated', updatedTables);

    res.json({
      message: `Table ${table.table_number} reserved successfully!`,
      table_number: table.table_number,
      reserved_until: reservedUntil
    });
  } catch (err) {
    console.error('Table reservation error:', err);
    res.status(500).json({ error: 'Failed to reserve table' });
  }
});

// Admin: Update Table Status
router.patch('/:id/status', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { status } = req.body; // AVAILABLE, OCCUPIED, RESERVED, CLEANING
    const valid = ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'CLEANING'];

    if (!valid.includes(status)) {
      return res.status(400).json({ error: 'Invalid table status' });
    }

    db.prepare('UPDATE tables SET status = ? WHERE id = ?').run(status, req.params.id);

    if (status === 'AVAILABLE' || status === 'CLEANING') {
      db.prepare('UPDATE table_reservations SET status = "EXPIRED" WHERE table_id = ? AND status = "ACTIVE"').run(req.params.id);
    }

    const updatedTables = db.prepare('SELECT * FROM tables ORDER BY id ASC').all();
    req.io?.emit('tables_updated', updatedTables);

    res.json({ message: 'Table status updated', tables: updatedTables });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update table status' });
  }
});

export default router;
