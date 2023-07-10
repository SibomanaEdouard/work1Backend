const mongoose=require('mongoose');
const userSchema=new mongoose.Schema({
    firstname:{
        type:String,
        required:true,
        minLength:3,
        
    },
    lastname:{
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
    resetToken: {
        type: String,
        default: null,
      },
      resetTokenExpires: {
        type: Date,
        default: null,
      },

})
module.exports=mongoose.model('users',userSchema);