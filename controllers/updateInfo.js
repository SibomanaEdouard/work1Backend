//this is the logic to update email and phone
const Users=require("../models/users");

const UpdateInfo=async(req,res)=>{
    const {user,phone,email}=req.body;
    try{
      const updateUser= await Users.findByIdAndUpdate(user,{$set:{phone:phone,email:email}});
if(updateUser){
    res.status(200).json({"message":"The data was updated successfully"});
}else{
    res.status(400).json({error:"Failed to updated data"});
}
    }catch(error){
console.log(error);
res.status(500).json({error:"something went wrong please try again latter!"});
    }

}
module.exports=UpdateInfo;


