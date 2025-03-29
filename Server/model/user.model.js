import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true["This field is mandatory"],
    trim: true
  },
  email: {
    type: String,
    required: true["This field is mandatory"],
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },

  img_url:{
    type : String 
  },

  verify_email : {
    type : Boolean , 
    default : false
  } , 

  last_login_date : {
    type : Date , 
    default : ""
  } , 

  Status : {
    type : String , 
    enum : ["Active" , "Inactive" , "Suspended"] , 
    default : "Active"
  } , 

  address_info : [
    {
        type : mongoose.Schema.Types.ObjectId ,
        ref :'address'
    }
  ] ,

  shopping_cart  : [
    {
        type : mongoose.Schema.Types.ObjectId , 
        ref :'cartproduct' 
    }
  ] , 

  order_history  : [
    {
        type : mongoose.Schema.Types.ObjectId , 
        ref :'order' 
    }
  ] , 

  forgot_password_otp : {
    type :String , 
    default : null
  } , 

  forgot_password_expiry : {
    type :Date , 
    default : ""
  } , 

  role: {
    type: String,
    enum: ['user', 'admin', 'orderManager'],
    default: 'user'
  },
  
  phone: {
    type: String,
    required: true
  },
  
  franchise: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'franchise'
  },

},{
    timestamps : true
});


userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});


userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const Usermodel = mongoose.model("user" ,userSchema) ; 
export default Usermodel;

