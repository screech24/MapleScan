const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  product_name: {
    type: String,
    index: true
  },
  brands: {
    type: String,
    index: true
  },
  categories: {
    type: String,
    index: true
  },
  image_url: String,
  countries: {
    type: String,
    index: true
  },
  manufacturing_places: String,
  origins: String,
  ingredients_text: String,
  purchase_places: String,
  isCanadian: {
    type: Boolean,
    default: false,
    index: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true,
  // Store additional fields not defined in the schema
  strict: false
});

// Create text indexes for search
ProductSchema.index({ 
  product_name: 'text', 
  brands: 'text', 
  categories: 'text',
  countries: 'text'
});

// Method to check if a product is Canadian
ProductSchema.methods.checkIfCanadian = function() {
  if (!this.countries && !this.manufacturing_places && !this.origins) {
    return false;
  }
  
  const fields = [
    this.countries,
    this.manufacturing_places,
    this.origins
  ];
  
  for (const field of fields) {
    if (field && field.toLowerCase().includes('canada')) {
      return true;
    }
  }
  
  return false;
};

// Pre-save hook to set isCanadian flag
ProductSchema.pre('save', function(next) {
  this.isCanadian = this.checkIfCanadian();
  next();
});

module.exports = mongoose.model('Product', ProductSchema); 