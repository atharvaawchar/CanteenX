import express from 'express';
import db from '../config/db.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get categories
router.get('/categories', (req, res) => {
  try {
    const categories = db.prepare('SELECT * FROM categories').all();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get food items with optional category, search, veg filter & sort
router.get('/items', (req, res) => {
  try {
    const { category, search, veg, maxPrice, availability, sort } = req.query;

    let query = `
      SELECT f.*, c.name as category_name, c.slug as category_slug
      FROM food_items f
      LEFT JOIN categories c ON f.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (category && category !== 'all') {
      query += ` AND (c.slug = ? OR c.name = ?)`;
      params.push(category, category);
    }

    if (search) {
      query += ` AND (f.name LIKE ? OR f.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    if (veg === 'true' || veg === '1') {
      query += ` AND f.is_veg = 1`;
    }

    if (maxPrice) {
      query += ` AND f.price <= ?`;
      params.push(Number(maxPrice));
    }

    if (availability && availability !== 'all') {
      query += ` AND f.availability = ?`;
      params.push(availability);
    }

    if (sort === 'price_low') {
      query += ` ORDER BY f.price ASC`;
    } else if (sort === 'price_high') {
      query += ` ORDER BY f.price DESC`;
    } else if (sort === 'prep_time') {
      query += ` ORDER BY f.prep_time ASC`;
    } else if (sort === 'rating') {
      query += ` ORDER BY f.rating DESC`;
    } else { // default 'popular'
      query += ` ORDER BY f.order_count DESC, f.rating DESC`;
    }

    const items = db.prepare(query).all(...params);
    res.json(items);
  } catch (err) {
    console.error('Fetch items error:', err);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

// Get single food item with reviews
router.get('/items/:id', (req, res) => {
  try {
    const item = db.prepare(`
      SELECT f.*, c.name as category_name 
      FROM food_items f 
      LEFT JOIN categories c ON f.category_id = c.id 
      WHERE f.id = ?
    `).get(req.params.id);

    if (!item) {
      return res.status(404).json({ error: 'Food item not found' });
    }

    const reviews = db.prepare('SELECT * FROM reviews WHERE food_item_id = ? ORDER BY created_at DESC').all(req.params.id);

    res.json({ ...item, reviews });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch item details' });
  }
});

// Admin: Add Food Item
router.post('/items', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { category_id, name, description, price, stock, prep_time, is_veg, image_url, availability, is_special } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ error: 'Item name and price are required' });
    }

    const availState = stock <= 0 ? 'Sold Out' : (availability || 'Available');

    const result = db.prepare(`
      INSERT INTO food_items (category_id, name, description, price, stock, prep_time, is_veg, image_url, availability, is_special)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      category_id || 1,
      name,
      description || '',
      Number(price),
      Number(stock || 20),
      Number(prep_time || 10),
      is_veg ? 1 : 0,
      image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      availState,
      is_special ? 1 : 0
    );

    const newItem = db.prepare('SELECT * FROM food_items WHERE id = ?').get(result.lastInsertRowid);
    req.io?.emit('menu_updated', newItem);

    res.status(201).json(newItem);
  } catch (err) {
    console.error('Add food item error:', err);
    res.status(500).json({ error: 'Failed to add food item' });
  }
});

// Admin: Update Food Item
router.put('/items/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { category_id, name, description, price, stock, prep_time, is_veg, image_url, availability, is_special } = req.body;

    let availState = availability;
    if (stock !== undefined && Number(stock) <= 0) {
      availState = 'Sold Out';
    }

    db.prepare(`
      UPDATE food_items
      SET category_id = COALESCE(?, category_id),
          name = COALESCE(?, name),
          description = COALESCE(?, description),
          price = COALESCE(?, price),
          stock = COALESCE(?, stock),
          prep_time = COALESCE(?, prep_time),
          is_veg = COALESCE(?, is_veg),
          image_url = COALESCE(?, image_url),
          availability = COALESCE(?, availability),
          is_special = COALESCE(?, is_special)
      WHERE id = ?
    `).run(
      category_id,
      name,
      description,
      price,
      stock,
      prep_time,
      is_veg !== undefined ? (is_veg ? 1 : 0) : null,
      image_url,
      availState,
      is_special !== undefined ? (is_special ? 1 : 0) : null,
      req.params.id
    );

    const updatedItem = db.prepare('SELECT * FROM food_items WHERE id = ?').get(req.params.id);
    req.io?.emit('menu_updated', updatedItem);

    res.json(updatedItem);
  } catch (err) {
    console.error('Update item error:', err);
    res.status(500).json({ error: 'Failed to update food item' });
  }
});

// Admin: Delete Food Item
router.delete('/items/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    db.prepare('DELETE FROM food_items WHERE id = ?').run(req.params.id);
    req.io?.emit('menu_item_deleted', req.params.id);
    res.json({ message: 'Food item deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete food item' });
  }
});

export default router;
