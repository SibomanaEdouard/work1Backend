const Tasks=require('../models/tasks');
const Users=require("../models/users");

//this is the logic to count the number of task for 
const count=async(req,res)=>{
const{sender}=req.body;
try{
const numberOfTask= await Tasks.countDocuments({sender});
if(numberOfTask!=null){
    res.status(200).json(numberOfTask); 

}else{
    res.status(404).json("There is no task");
}

}catch(error){
    console.log(error)
    res.status(500).json("something went wrong please Try again latter!");
}

}

//this is the logic to retrieve the username
const username = async (req, res) => {
    const { sender } = req.body;
  
    try {
      const name = await Users.findById(sender);
  
      if (name !== null) {
        res.status(200).json(name);
      } else {
        res.status(404).json('The username is not found');
      }
    } catch (error) {
      console.log(error);
      res.status(500).json("something went wrong");
    }
  };
  
module.exports={
    count,
 username
};
