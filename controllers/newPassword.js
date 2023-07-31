//this is the logic to change password
const mongoose=require("mongoose");
const bcrypt=require("bcrypt");
const Users=require("../models/users");

const ChangePassword=async(req,res)=>{
    const {oldpassword,newpassword,confirmpassword,user}=req.body;
    try{
    //let me find the user  in the database
    const finduser= await Users.findById({_id:user});
    if(finduser){
const storedpass=finduser.password;
//let me compare the old password with the stored password
const comparePass=await bcrypt.compare(oldpassword,storedpass);
if(!comparePass){
    res.status(400).json({error:"Invalid password , please check password and try again"});
}else{
    //let me check if the new password is similar to the confirm password
    if(newpassword==confirmpassword){
        
        //let me hash password and update
        const hashedPassword= await bcrypt.hash(newpassword,10);

        //le me update the passwod
        const updatePass=await Users.findByIdAndUpdate({_id:user},{$set:{password:hashedPassword}});
        if(updatePass){
res.status(200).json({"message":"The password was updated successfully"});
        }else{
res.status(500).json({"error":"Failed to update password, Please check internet connection and try again"});
        }
    }else{
 res.status(400).json({"error":"New password and  password to confirm must be similar"});
 }
}
    }else{
       res.status(404).json({"error":"The user with this id is not found"}); 
}
}catch(error){
    console.log(error);
    res.status(500).json({"error":"Something went wrong Please try again latter"});
}
}
module.exports=ChangePassword;