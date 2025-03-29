import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'user',
    required: true
  },

  product_id :{
    type : mongoose.Schema.ObjectId , 
    ref : "product"
  } , 

  order_id :{
    type : String , 
    required : true , 
    unique : true
  } , 

  product_details : {
    name: String,
    image: Array,
   
  },

  paymentid: {
    type: String,
    default: ""
  },

  paymentStatus: {
    type: String,
    default: ""
  },

  deliveryAddress: {
    type : mongoose.Schema.ObjectId ,
    ref : 'address',
    required: true
  },

  subtotalAmount: {
    type: Number,
    default : 0
  },

  totalAmount: {
    type: Number,
    default : 0
  },

  invoice_reciept :{
    type : String , 
    default : ""

  } ,

  deliverystatus: {
    type: String,
    enum: ['pending', 'accepted', 'dispatched', 'delivered', 'cancelled'],
    default: 'pending'
},

  franchise: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'franchise',
    required: true
  },
  
  deliveryCharge: {
    type: Number,
    default: 0
  },
  
} , {
    timestamps : true
});

  const ordermodel = mongoose.model('order' , orderSchema)

  export default ordermodel


