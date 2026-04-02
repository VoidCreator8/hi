const express = require('express');
const { db } = require('../database');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/categories - Public: list all categories
router.get('/', (req, res) => {
  try {
    const categories = db.prepare(`
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      GROUP BY c.id
      ORDER BY c.name
    `).all();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories.' });
  }
});

// GET /api/categories/:id - Public: get single category
router.get('/:id', (req, res) => {
  try {
    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found.' });
    }
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch category.' });
  }
});

// POST /api/categories - Admin only: create category
router.post('/', authenticateAdmin, (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Category name is required.' });
    }

    const existing = db.prepare('SELECT id FROM categories WHERE name = ?').get(name);
    if (existing) {
      return res.status(409).json({ error: 'Category with this name already exists.' });
    }

    const result = db.prepare('INSERT INTO categories (name, description) VALUES (?, ?)').run(name, description || '');
    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create category.' });
  }
});

// PUT /api/categories/:id - Admin only: update category
router.put('/:id', authenticateAdmin, (req, res) => {
  try {
    const { name, description } = req.body;
    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found.' });
    }

    if (name) {
      const existing = db.prepare('SELECT id FROM categories WHERE name = ? AND id != ?').get(name, req.params.id);
      if (existing) {
        return res.status(409).json({ error: 'Category with this name already exists.' });
      }
    }

    db.prepare('UPDATE categories SET name = ?, description = ? WHERE id = ?').run(
      name || category.name,
      description !== undefined ? description : category.description,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update category.' });
  }
});

// DELETE /api/categories/:id - Admin only: delete category
router.delete('/:id', authenticateAdmin, (req, res) => {
  try {
    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found.' });
    }

    db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
    res.json({ message: 'Category deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete category.' });
  }
});

module.exports = router;
