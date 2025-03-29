import mongoose from "mongoose";

const franchiseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  }, 
  address: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    }, 
    state: {
      type: String,
      required: true
    },
    pincode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true
    }
  }, 
  // orderManager: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'user',
  //   required: true,
  // },
  contactNumber: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const franchisemodel = mongoose.model('franchise' , franchiseSchema)

export default franchisemodel;