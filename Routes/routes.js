const mongoose=require("mongoose");
const userSchema=require('../models/users')
const express=require("express");
const app=express();
const Tasks=require("../models/tasks");
const bcrypt=require('bcrypt');
const nodemailer=require("nodemailer");
const jwt=require("jsonwebtoken");
const crypto=require("crypto");
const count=require("../controllers/count").count;
const username=require("../controllers/count").username;
const deletedTasks=require("../models/deletedTasks");
const getDeletedTasks=require("../controllers/getDeletedTasks");
const deleteHistory=require("../controllers/deleteHistory");
const ChangePassword=require("../controllers/newPassword");
const userInfo=require("../controllers/getUserProfile");
const UpdateInfo=require("../controllers/updateInfo");
const CountCompleted=require('../controllers/completedTasks');
const CountUnCompleted=require('../controllers/unCompletedTasks');
const multer=require('multer');

//this is to insert the user in the system
app.post('/sign',async(req,res)=>{

    const {username,email,password}=req.body;

    try{
        //let me hash password before save it
        const hashedPassword=await bcrypt.hash(password,10);

    const newUser=await new userSchema({
      username,
        email,
        password:hashedPassword
    })
    //to check the present of email
    const emailChecker=await userSchema.findOne({email});
    if(emailChecker){
      return  res.status(400).json("The email you inserted is already taken!")
    }
    const saveUser=await newUser.save();
    if(saveUser){
        res.status(200).json("The user was created successfully");
        console.log(newUser);
    }

    }catch(error){
        console.log(error);
res.status(400).json("Something went wrong");
    }
    
})

//user login
app.post('/login',async(req,res)=>{
    const{email,password}=req.body;
 //let me check if the email is exist 
 try{
 const emailChecker=await userSchema.findOne({email});
 if(!emailChecker){
   return  res.status(404).json({error:"Invalid email or password"})
 }
 else{
 const storedpass=emailChecker.password;
  const comparePassword=await bcrypt.compare(password,storedpass);
  if(!comparePassword){
    res.status(404).json({error:"Invalid email or password"});
  }
  else{
  res.status(200).json(emailChecker);
  }
}
 }catch(error){
    console.log(error)
    res.status(400).json({error:"Something went wrong please try again later!"});
 }
})

//this is to add  to add the task
app.post("/tasks",async(req,res)=>{
    const {task,sender}=req.body;
    try{
        //this is to check if the user exist;
        const CheckUser=await userSchema.findById(sender);
        if(!CheckUser){
            return  res.status(404).json("The user of this id is not found");
        }
        else{
        const newTask=  await new Tasks({
          task,
          sender
        })
        const saveTask= await newTask.save();
        if(saveTask){
            console.log("The task was added successfully");
            res.status(200).json("The task was saved successfully ");
        }
        else{
            res. status(400).json("The task was not saved");
        }
    }
    }catch(error){
        console.log(error);
        res.status(400).json({"message":"sorry something went wrong"});
    }
})
//this is for retrieving the tasks 
app.get('/tasks', async (req, res) => {
    const { sender } = req.query;
    try {
      const findTasks = await Tasks.find({ sender }).select(" task , _id , status ");
      if (!findTasks) {
        return res.status(404).json("You don't have any tasks! Please add tasks");
      } else {
        return res.status(200).json(findTasks);
      }
    } catch (error) {
      console.log(error);
      return res.status(400).json("Something went wrong");
    }
  });

//this is the logic to get data for prefilling the form before update
app.get('/update/:taskId', async (req, res) => {
  const { sender } = req.query;
  const { taskId } = req.params;

  try {
    const task = await Tasks.findOne({ sender, _id: taskId }).select(' task , status ');
    if (!task) {
      return res.status(404).json({ error: 'The task is not found!' });
    }

    res.status(200).json(task);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Something went wrong!' });
  }
});

//this is the logic for updating the task
app.put('/', async (req, res) => {
  const { sender, taskId,updatedtask,updatedstatus } = req.body;
  try {
    
  const task = await Tasks.findOne({ sender, _id: taskId });

    if (!task) {
      return res.status(404).json({error:"The task is not found!"});
      console.log("Failed to update the task");
    }

    const updatedTask = await Tasks.findByIdAndUpdate(task._id, {$set:{task:updatedtask,status:updatedstatus}}, { new: true });

    if (updatedTask) {
      res.status(200).json(updatedTask);
      console.log("the task was updated successfully!!");
    } else {
      res.status(500).json({error:"Failed to update the task"});
      console.log("Failed to update the task");
    }
 
  } catch (error) {
    console.log(error);
    res.status(500).json({error:"Something went wrong!"});
  }
});

//this is to delete one task from the database
app.delete('/one', async (req, res) => {
  const { sender, taskId } = req.body;
  
  try {
    const task = await Tasks.findOne({ sender, _id: taskId });

    if (!task) {
      return res.status(404).json({message:"The task is not found!"});
    }

    //this is to save the task before delete
const saveBeforeDelete = await deletedTasks.create({
  sender,
  task:task.task
});
if(!saveBeforeDelete){
  return res.status(500).json({message:"Failed to save task before delete"});
}else{
    const updatedTask = await Tasks.findByIdAndDelete(task);
    if (updatedTask) {
      res.status(200).json({message:"The task was deleted successfully"});
    } else {
      res.status(400).json({error:"Failed to  delete the task"});
    }
  }
  } catch (error) {
    console.log(error);
    res.status(500).json({error:"Something went wrong!"});
  }
});

// This is for deleting all tasks and save them individually in the deletedTasks collection
app.delete('/', async (req, res) => {
  const { sender } = req.body;
  try {
    // Let's check if there are any tasks in the database for the sender
    const tasksToDelete = await Tasks.find({ sender }).select('task');
    if (tasksToDelete.length === 0) {
      return res.status(404).json({ message: "There are no tasks to delete" });
    } else {
      // Iterate through each task to save them individually before deleting
      for (const task of tasksToDelete) {
        const saveBeforeDelete = await deletedTasks.create({
          sender,
          task: task.task,
        });
        if (!saveBeforeDelete) {
          return res.status(500).json({ message: "Failed to save deleted task" });
        }
      }

      // Delete all tasks associated with the sender
      const deleteAll = await Tasks.deleteMany({ sender });
      if (deleteAll) {
        return res.status(200).json({ message: "All tasks were deleted" });
      } else {
        return res.status(400).json({ error: "Tasks are not deleted" });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: "Something went wrong" });
  }
});

//this is the route for getting the number of the task for the user
 app.post('/getNumber',count);

 //this is the route to get username 
 app.post('/getUsername',username);

 //let me get history
 app.post('/getdeleted',getDeletedTasks);

 //this is the logic to delete the  data from history 
 app.post('/deletehistory',deleteHistory);

 //update password
 app.put('/updatepassword',ChangePassword);
 //to get user info
 app.post('/userinfo',userInfo);
 //to update user info
 app.put('/updateinfo',UpdateInfo);
 //to count completed
 app.post("/countcompleted",CountCompleted);
 //to count uncompleted
 app.post("/countuncompleted",CountUnCompleted);

  //this is to update the image
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });
app.put('/updateImage', upload.single('image'), async (req, res) => {
  const { userId } = req.body;
  try {
      const file = req.file;
      const imageUrl = file.filename;
      
      // Update the user's image URL
      const updateImage = await userSchema.findByIdAndUpdate(userId,{imageUrl})
      if(updateImage){
        res.status(200).json({imageUrl });
      }

    else {
      res.status(404).json({ error: 'The failed to update image'});
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Something went Wrong. Please try again later' });
  }
});
app.use('/uploads', express.static('uploads'));
module.exports=app;