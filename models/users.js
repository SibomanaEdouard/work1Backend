const mongoose=require('mongoose');
const userSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true,
        minLength:3,
        
    },
   
    email:{
        type:String,
        required:true,
        unique:true,
    minlength:5
        
    },
    password:{
        type:String,
        required:true,     
    },
    phone:{
        type:String,
        required:false,     
    },
    imageUrl:{
        type:String,
        required:false,     
    },
  
})
module.exports=mongoose.model('users',userSchema);