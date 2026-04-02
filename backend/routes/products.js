const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../database');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

function parseFeatured(val) {
  return val === '1' || val === 1 || val === true ? 1 : 0;
}

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedExtensions = /^\.(jpe?g|png|gif|webp)$/i;
    const allowedMimeTypes = /^image\/(jpeg|png|gif|webp)$/;
    const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedMimeTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (jpg, png, gif, webp) are allowed.'));
    }
  }
});

// GET /api/products - Public: list products with optional filters
router.get('/', (req, res) => {
  try {
    const { category, search, featured } = req.query;
    let query = `
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      query += ' AND p.category_id = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (featured === 'true') {
      query += ' AND p.featured = 1';
    }

    query += ' ORDER BY p.created_at DESC';

    const products = db.prepare(query).all(...params);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products.' });
  }
});

// GET /api/products/:id - Public: get single product
router.get('/:id', (req, res) => {
  try {
    const product = db.prepare(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `).get(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product.' });
  }
});

// POST /api/products - Admin only: create product
router.post('/', authenticateAdmin, upload.single('image'), (req, res) => {
  try {
    const { name, price, description, image_url, category_id, featured } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'Product name and price are required.' });
    }

    let image = image_url || '';
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }

    const result = db.prepare(
      'INSERT INTO products (name, price, description, image, category_id, featured) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(name, parseFloat(price), description || '', image, category_id || null, parseFeatured(featured));

    const product = db.prepare(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create product.' });
  }
});

// PUT /api/products/:id - Admin only: update product
router.put('/:id', authenticateAdmin, upload.single('image'), (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const { name, price, description, image_url, category_id, featured } = req.body;

    let image = existing.image;
    const oldImage = existing.image;
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    } else if (image_url !== undefined) {
      image = image_url;
    }
    // Clean up old uploaded file if image changed
    if (image !== oldImage && oldImage && oldImage.startsWith('/uploads/')) {
      const oldPath = path.join(__dirname, '..', oldImage);
      fs.unlink(oldPath, () => {});
    }

    db.prepare(
      'UPDATE products SET name = ?, price = ?, description = ?, image = ?, category_id = ?, featured = ? WHERE id = ?'
    ).run(
      name || existing.name,
      price !== undefined ? parseFloat(price) : existing.price,
      description !== undefined ? description : existing.description,
      image,
      category_id !== undefined ? (category_id || null) : existing.category_id,
      featured !== undefined ? parseFeatured(featured) : existing.featured,
      req.params.id
    );

    const product = db.prepare(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `).get(req.params.id);

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product.' });
  }
});

// DELETE /api/products/:id - Admin only: delete product
router.delete('/:id', authenticateAdmin, (req, res) => {
  try {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    // Clean up uploaded image file
    if (product.image && product.image.startsWith('/uploads/')) {
      const imgPath = path.join(__dirname, '..', product.image);
      fs.unlink(imgPath, () => {});
    }
    res.json({ message: 'Product deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product.' });
  }
});

module.exports = router;
