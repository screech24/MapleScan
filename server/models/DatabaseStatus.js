const mongoose = require('mongoose');

const DatabaseStatusSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    default: 'main'
  },
  status: {
    type: String,
    enum: ['ok', 'updating', 'error'],
    default: 'ok'
  },
  lastUpdate: {
    type: Date,
    default: Date.now
  },
  productCount: {
    type: Number,
    default: 0
  },
  canadianProductCount: {
    type: Number,
    default: 0
  },
  message: String,
  error: String
}, { timestamps: true });

module.exports = mongoose.model('DatabaseStatus', DatabaseStatusSchema); 