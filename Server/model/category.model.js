import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  image: {
    type: String,
    default : ""
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
} , {
    timestamps : true
});

const categorymodel = mongoose.model('category' ,categorySchema)

export default categorymodel