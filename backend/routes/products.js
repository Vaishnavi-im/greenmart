const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET ALL PRODUCTS
router.get('/', async (req, res) => {
  try {
    const { category, sort } = req.query;
    let query = {};
    if (category) query.category = category;

    let products = await Product.find(query);

    if (sort === 'low') products.sort((a, b) => a.price - b.price);
    if (sort === 'high') products.sort((a, b) => b.price - a.price);

    res.json({ count: products.length, products });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET SINGLE PRODUCT
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE PRODUCT
router.post('/', async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({
      message: '✅ Product created!',
      product
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE PRODUCT
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json({ message: '✅ Product updated!', product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE PRODUCT
router.delete('/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: '✅ Product deleted!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;