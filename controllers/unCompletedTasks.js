//this is the logic to count the uncompleted tasks
const Tasks=require('../models/tasks');

//let me count 
const CountUnCompleted=async(req,res)=>{
const {user}=req.body;
try{
const number=await Tasks.countDocuments({sender:user,status:"uncompleted"});
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

module.exports=CountUnCompleted;