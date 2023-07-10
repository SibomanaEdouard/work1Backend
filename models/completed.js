const mongoose = require("mongoose");

const CompletedSchema = new mongoose.Schema({
  // task: {
  //   type:String,
  //   required:true
  // },
  sender:{
     type:mongoose.Schema.Types.ObjectId,
    ref:'users',
    required:true
  },
  taskId:{
    type:mongoose.Schema.Types.ObjectId,
   ref:'tasks',
   required:true
 },

  time:{
    type:Date,
    default:Date.now
}
});

module.exports = mongoose.model("completedTasks", CompletedSchema);