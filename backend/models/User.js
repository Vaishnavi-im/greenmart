const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  role: {
    type: String,
    default: 'user'
  },
  walletBalance: {
    type: Number,
    default: 0
  },
  loyaltyPoints: {
    type: Number,
    default: 0
  },
  addresses: [
    {
      label: String,
      street: String,
      city: String,
      state: String,
      pincode: String,
      isDefault: Boolean
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);