import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default : "" , 
    required: true
  },
  category: {
    type: mongoose.Schema.ObjectId,
    ref: 'category',
    required: true
  },

  price: {
    type: Number,
    required: true,
    min: 0
  },
  
  discount: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  warehouseStock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  lowStockThreshold: {
    type: Number,
    required: true,
    min: 0,
    default: 10
  },
  image: {
    type: Array,
    default : [] 
  },
  manufacturer: {
    type: String,
    required: false
  },
  
  publish: {
    type: Boolean,
    default: true
  }
  
} , {
    timestamps : true
});

const productmodel = mongoose.model('product' , productSchema)

export default productmodel


