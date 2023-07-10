const mongoose=require("mongoose");
const userSchema=require('../models/users')
const express=require("express");
const app=express();
const Tasks=require("../models/tasks");
const bcrypt=require('bcrypt');
const nodemailer=require("nodemailer");
const jwt=require("jsonwebtoken");
const CompletedSchema=require("../models/completed");
const crypto=require("crypto");
const { link } = require("fs");
const secretekey=generateSecreteKey();
//this is to insert the user in the system
app.post('/sign',async(req,res)=>{

    const {firstname,lastname,email,password}=req.body;

    try{
        //let me hash password before save it
        const hashedPassword=await bcrypt.hash(password,10);

    const newUser=await new userSchema({
        firstname,
        lastname,
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
  res.status(200).json(emailChecker._id);
  }
}
 }catch(error){
    console.log(error)
    res.status(400).json({error:"Something went wrong please try again later!"});
 }
})

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
           console.log(newTask);
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
      const findTasks = await Tasks.find({ sender }).select(" task , _id ");
      if (!findTasks) {
        return res.status(404).json("You don't have any tasks in your task page");
      } else {
        return res.status(200).json(findTasks);
      }
    } catch (error) {
      console.log(error);
      return res.status(400).json("Something went wrong");
    }
  });


  
//this is the logic for updating the task
app.put('/', async (req, res) => {
  const { sender, taskId,updatedtask } = req.body;
  try {
    //let me check if it is completed
  const isCompleted=await CompletedSchema.findOne({taskId});
  if(isCompleted){
    res.status(300).json({message:"The task is completed so you can't update it!"});
    console.log("The task is completed");
  }else{
    const task = await Tasks.findOne({ sender, _id: taskId });

    if (!task) {
      return res.status(404).json({error:"The task is not found!"});
      console.log("Failed to update the task");
    }

    const updatedTask = await Tasks.findByIdAndUpdate(task._id, {$set:{task:updatedtask}}, { new: true });

    if (updatedTask) {
      res.status(200).json(updatedTask);
      console.log("the task was updated successfully!!");
    } else {
      res.status(500).json({error:"Failed to update the task"});
      console.log("Failed to update the task");
    }
  }
  } catch (error) {
    console.log(error);
    res.status(500).json({error:"Something went wrong!"});
  }
});




// //this is to delete one task from the database
app.delete('/one', async (req, res) => {
  const { sender, taskId } = req.body;
  
  try {
    const task = await Tasks.findOne({ sender, _id: taskId });

    if (!task) {
      return res.status(404).json({message:"The task is not found!"});
    }

    const updatedTask = await Tasks.findByIdAndDelete(task);

    if (updatedTask) {
      res.status(200).json({message:"The task was deleted successfully"});
    } else {
      res.status(400).json({error:"Failed to  delete the task"});
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({error:"Something went wrong!"});
  }
});


//this is for deleting the all tasks
app.delete('/',async(req,res)=>{
    const {sender}=req.body;
    try{
      //let me check if there is any task in the database
      const isTask=await Tasks.find({sender});
      if(isTask.length==0){
        res.status(404).json({message:"There is no task to delete"});
      } else{
        const DeleteAll=await Tasks.deleteMany({sender});
        if(DeleteAll){
            res.status(200).json({message:"All tasks were deleted"});
        }
        else{
            res.status(400).json({error:"Tasks are not deleted"});
        }

      }
      
        
    }catch(error){
        console.log(error);
        res.status(400).json({error:"Some went wrong"});
    }

})

//this is the logic to mark the task as completed
app.post('/completed', async (req, res) => {
  const { sender, taskId} = req.body;

  try {
    const task = await Tasks.findOne({ sender, _id: taskId });

    if (task==null) {
      return res.status(404).json("The task is not found!");
    }else{

    //let me check is already completed
    const checkInCompleted=await CompletedSchema.findOne({sender,taskId});
    if(checkInCompleted){
      res.status(200).json({message:"The task is already completed"});
    }else{
    //let me save to the database
    const saveData=await CompletedSchema.create({
sender,
taskId,
// task
    })

const dataSaved=await saveData.save();

    if (dataSaved) {
      res.status(200).json({message:"The task was completed successfully!"});
      console.log('The task was completed successfully!');
    } else {
      res.status(400).json({error:"Failed to update the task"});
    }
  }
  }
  } catch (error) {
    console.log(error);
    res.status(500).json({error:"Something went wrong!"});
  }
});



//this is the logic to get all completed tasks
app.post('/completedTasks', async (req, res) => {
  const {sender}=req.body;

  try {
    const task = await CompletedSchema.find({sender}).select("taskId");

    if (task.length==0) {
      return res.status(404).json({error:"The task is not found!"});
    }else{
      const taskIds = task.map((task)=> task.taskId);
      //let me check the ids in the tasks
      const myTasks= await Tasks.find({_id:{$in:taskIds}}).select("task");
    
      res.status(200).json(myTasks);
      
console.log('The tasks were taken successfuly');
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({error:"Something went wrong!"});
  }
});

//this is to update password
app.post('/resetpassword',async(req,res)=>{

  try{
const {email}=req.body;

//check if the email is found in database
const emailChecker=await userSchema.findOne({email});
if(emailChecker!=null){
 
  const link="http://localhost:5000/resetpassword/$emailCheck.firstname";

const transporter = nodemailer.createTransport({
  // host: 'smtp.gmail.com',
  // port: 465,
service:"gmail",
  auth: {
      user:"sibomanaedouard83@gmail.com",
      pass:"sibo2003%"
  }
});
const mailOptions={

from:"sibomanaedouard83@gmail.com",
to:"siboedouard88@gmail.com",
subject:"Reset password",
Text:"This is testing email",
}
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to send reset password email' });
  } else {
    console.log('Reset password email sent: ' + info.response);
    res.status(200).json({ message: 'Reset password email sent successfully' });
  }
});
}
  
else{
  res.status(400).json({'error':"Invalid email,Please check it and try again!!"});
}
 
  }catch(error){
    res.status(400).json({"error":"something went wrong"});
    console.log(error);
  } 
})

//function to generate the secrete key
function generateSecreteKey(length=32){
  return crypto.randomBytes(length).toString('hex');
}
//function to generate the resettoken;
function generateResetToken(userId){
  const payLoad={userId};
  const options={expiresIn:'5s'};
  return jwt.sign(payLoad,secretekey,options);
}

//this is the function to verify the token 
function verifyResetToken(token, secretKey) {
  try {
    const decoded = jwt.verify(token, secretKey);
    return decoded.userId;
  } catch (error) {
    throw new Error('Invalid or expired reset token');
  }
}

module.exports=app;