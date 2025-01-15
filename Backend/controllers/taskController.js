const Task = require('../models/Task');
const User = require('../models/User');
const { getIoInstance } = require('../config/socketConfig');
const transporter = require('../utils/emailConfig'); 

exports.createTask = async (req, res) => {
  const { title, sharedWith } = req.body;
  try {
    const dublicateTask = await Task.findOne({ title, owner: req.user._id, sharedWith:req.user._id });

    if (dublicateTask) {
      return res.status(400).json({ message: 'Task with the same title already exists' });
    }
    const task = await Task.create({ title, owner: req.user._id, sharedWith });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create task' });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const { page = 1, limit = 5, search = '' } = req.query;

    const searchCondition = {
      title: { $regex: search, $options: 'i' },
      $or: [
        { owner: req.user._id },
        { sharedWith: req.user._id }
      ]
    };

    const tasks = await Task.find(searchCondition)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalTasks = await Task.countDocuments(searchCondition);

    const userIds = tasks.map(task => task.owner);
    const users = await User.find({ _id: { $in: userIds } }).select('name _id');

    const userMap = users.reduce((acc, user) => {
      acc[user._id] = user.name;
      return acc;
    }, {});

    const taskDetails = tasks.map(task => ({
      id: task._id,
      title: task.title,
      status: task.status,
      owner: task.owner,
      name: userMap[task.owner] || 'Unknown',
      sharedWith: task.sharedWith,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt
    }));

    const totalPages = Math.ceil(totalTasks / limit);

    res.status(200).json({
      tasks: taskDetails,
      totalTasks,
      totalPages,
      currentPage: parseInt(page),
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
};


exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, status } = req.body;
    const task = await Task.findOneAndUpdate(
      {
        _id: id,
        $or: [
          { owner: req.user._id },
          { sharedWith: req.user._id }
        ]
      },
      { title, status },
      { new: true }
    );
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const io = getIoInstance();
    io.emit('taskStatusUpdated', { taskId: id, newStatus: status });

    res.json({ task });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
};


exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findOne({ _id: id });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.sharedWith.includes(req.user._id)) {
      task.sharedWith = task.sharedWith.filter(userId => userId.toString() !== req.user._id.toString());
      await task.save();
      const io = getIoInstance();
      io.emit('rejectTask', { userName: req.user.name, userId: task.owner, taskName: task.title, taskId: id });
      return res.json({ message: 'Task successfully unshared' });
    }

    if (task.owner.toString() === req.user._id.toString()) {
      await Task.findOneAndDelete({ _id: id, owner: req.user._id });
      const io = getIoInstance();
      io.emit('taskDeleted', { taskId: id });
      return res.json({ message: 'Task deleted successfully' });
    }

    return res.status(403).json({ error: 'Unauthorized to delete this task' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};

exports.shareTask = async (req, res) => {
  try {
    const { taskId, userId } = req.body;
    const userToShare = await User.findOne({ _id: userId });
    if (!userToShare) return res.status(404).json({ error: 'User not found' });

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    if (task.owner.equals(req.user._id)) {
      task.sharedWith.push(userToShare._id);
      await task.save();

      const io = getIoInstance();
      io.to(userToShare.socketId).emit('taskShared', { taskId: taskId, userId: req.user._id });

      const mailOptions = {
        from: req.user.email,
        to: userToShare.email,
        subject: 'Task Shared with You',
        html: `
          <div class="bg-gray-100 p-6 rounded-lg shadow-lg">
            <h1 class="text-xl font-bold text-blue-600">Task Shared with You</h1>
            <p class="text-gray-700 mt-4">
              Hello <span class="font-semibold">${userToShare.name}</span>,
            </p>
            <p class="text-gray-700 mt-2">
              A new task has been shared with you by <span class="font-semibold">${req.user.name}</span>.
            </p>
            <p class="mt-4">
              <strong>Task ID:</strong> ${taskId}
            </p>
            <p class="text-gray-500 mt-6">Best regards,<br>Task Management Team</p>
          </div>
        `,
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) console.error('Error sending email:', err);
        else console.log('Email sent:', info.response);
      });

      res.json({ message: 'Task shared successfully and email notification sent' });
    } else {
      res.status(403).json({ error: 'You can only share your own tasks' });
    }
  } catch (error) {
    console.error('Error sharing task:', error);
    res.status(500).json({ error: 'Failed to share task' });
  }
};
