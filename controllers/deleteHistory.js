const deleteTask = require("../models/deletedTasks");

const deleteHistory = async (req, res) => {
  const { sender, taskId } = req.body;
  try {
    // Use findOneAndDelete to find and delete the task based on sender and taskId
    const deletedTask = await deleteTask.findOneAndDelete({ sender, _id: taskId });

    if (deletedTask) {
      res.status(200).json({ message: "The task was deleted successfully" });
    } else {
      res.status(400).json({ error: "Failed to delete task! Please check connections and try again later!" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};
module.exports = deleteHistory;
