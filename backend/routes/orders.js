const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// CREATE ORDER
router.post('/', async (req, res) => {
  try {
    const orderId = 'GM' + Date.now();
    const order = await Order.create({
      ...req.body,
      orderId
    });
    res.status(201).json({
      message: '✅ Order placed successfully!',
      order
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET ALL ORDERS (admin)
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'firstName email')
      .sort({ createdAt: -1 });
    res.json({ count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET USER ORDERS
router.get('/user/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.userId })
      .sort({ createdAt: -1 });
    res.json({ count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET SINGLE ORDER
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'firstName email');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE ORDER STATUS
router.put('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus: req.body.orderStatus },
      { new: true }
    );
    res.json({ message: '✅ Order updated!', order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;