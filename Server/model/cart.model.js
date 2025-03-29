import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({

  productid :{
    type : mongoose.Schema.ObjectId , 
    ref : 'product'
  } , 

  quantity: {
    type: Number,
    default: 1,
  } ,
  user_id: {
    type: mongoose.Schema.ObjectId,
    ref: 'user',
    required: true
  },
  
  franchise: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'franchise'
  },
  
} , {
  timestamps : true
});

const cartmodel = mongoose.model('cartproduct' , cartSchema)

export default cartmodel
