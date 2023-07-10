const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  task: {
    type:String,
    unique:false,
    required:true
  },
  sender:{
     type:mongoose.Schema.Types.ObjectId,
    ref:'users',
    required:true
  },
  time:{
    type:Date,
    default:Date.now
}
});

module.exports = mongoose.model("Tasks", TaskSchema);
