
import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({

    Street : {
        type : String , 
        default : ""
    } , 

    city : {
        type : String , 
        default : ""
    } ,

    state : {
        type : String , 
        default : ""
    } , 

    pincode : {
        type : String , 
        default : ""
    } , 

    country : {
        type : String , 
        default : ""
    },
    phone_number : {
        type : Number , 
        default : null
    } , 

    status : {
        type : Boolean , 
        default : true
    }

    
} , {
    timestamps : true
}) 

const Addressmodel = mongoose.model('address' , addressSchema)

export default Addressmodel;
