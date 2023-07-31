//this is the logic to get userInfo before update them
const Users=require("../models/users");
const userInfo=async(req,res)=>{
const {user}=req.body;
try{
   
    const userPro=await Users.findById({_id:user});
    if(userPro){
res.status(200).json(userPro)
    }else{
res.status(500).json({"error":"Failed to fetch data"});
    }
}catch(error){
    console.log(error);
    res.status(500).json({error:"something went wrong , Please try again latter"});
} 
}
module.exports=userInfo;