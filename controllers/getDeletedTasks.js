const deleteTask=require("../models/deletedTasks");
//this is the logic to get the deleted tasks or history 
const getDeletedTasks=async(req,res)=>{
    const {sender}=req.body;
    try{
    const tasks=await deleteTask.find({sender});
    if(tasks!==null){
        res.status(200).json(tasks);
    }else{
        res.status(404).json({message:"Not found!"});
    }
}catch(error){
console.log(error);
res.status(500).json({error:" Sorry ,something went wrong!"});
}
}
module.exports=getDeletedTasks;