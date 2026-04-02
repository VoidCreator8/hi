const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { initializeDatabase } = require('./database');

const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const productRoutes = require('./routes/products');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Initialize database
initializeDatabase();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);

// Catch-all: serve frontend for non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    const requestedFile = path.join(__dirname, '..', 'frontend', req.path);
    res.sendFile(requestedFile, (err) => {
      if (err) {
        res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
      }
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }
  if (err) {
    return res.status(500).json({ error: err.message || 'Internal server error.' });
  }
  next();
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
