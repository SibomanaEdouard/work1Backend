const deleteTask = require("../models/deletedTasks");

//to spacify the format of the data
const formatDate = (date) => {
  const options = { year: "numeric", month: "long" };
  return new Date(date).toLocaleDateString(undefined, options);
};

const getDeletedTasks = async (req, res) => {
  const { sender } = req.body;
  try {
    const tasks = await deleteTask.find({ sender });

    if (tasks.length !== 0) {
      // Convert the date for each task to the desired format
      const formattedTasks = tasks.map((task) => {
        return {
          ...task._doc,
          date: formatDate(task.date), // Format date field using formatDate function
        };
      });

      res.status(200).json(formattedTasks);
    } else {
      res.status(404).json({ message: "Not found!" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Sorry, something went wrong!" });
  }
};

module.exports = getDeletedTasks;
