import mongoose from "mongoose";

const franchiseStockSchema = new mongoose.Schema({
  franchise: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'franchise',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
franchiseStockSchema.index({ franchise: 1, product: 1 }, { unique: true });

// Method to update stock
franchiseStockSchema.methods.updateStock = async function(quantity, isAddition = true) {
  if (isAddition) {
    this.quantity += quantity;
  } else {
    if (this.quantity < quantity) {
      throw new Error('Insufficient stock');
    }
    this.quantity -= quantity;
  }
  this.lastUpdated = Date.now();
  await this.save();
};

const franchisestock = mongoose.model('franchisestock' , franchiseStockSchema)

export default franchisestock