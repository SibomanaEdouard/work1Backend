//this is the logic to count completed tasks
const Tasks=require('../models/tasks');

//let me count 
const CountCompleted=async(req,res)=>{
const {user}=req.body;
try{
const number=await Tasks.countDocuments({sender:user,status:"completed"});
if(number!=null){
    res.status(200).json(number);
}    
else{
    res.status(400).json({error:"Failed to count the documents"});
}
}catch(error){
    console.log(error);
    res.status(500).json({error:"Sorry something went wrong please try again latter"});
}
}

module.exports=CountCompleted;