import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String,
    default: ""
  },
  price: { 
    type: Number, 
    required: true,
    min: 0
  },
  seller_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  image_url: { 
    type: String,
    default: "https://via.placeholder.com/300"
  },
  category: { 
    type: String,
    default: "General"
  },
  stock: { 
    type: Number, 
    default: 100,
    min: 0
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update the updatedAt field on save
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
export default Product;