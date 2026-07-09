const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      name: String,
      emoji: String,
      price: Number,
      quantity: Number
    }
  ],
  deliveryAddress: {
    name: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  paymentMethod: {
    type: String,
    enum: ['upi', 'card', 'netbanking', 'cod'],
    default: 'cod'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  orderStatus: {
    type: String,
    enum: ['placed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'placed'
  },
  subtotal: Number,
  tax: Number,
  deliveryCharge: {
    type: Number,
    default: 0
  },
  total: Number,
  deliverySlot: String,
  orderId: String
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);