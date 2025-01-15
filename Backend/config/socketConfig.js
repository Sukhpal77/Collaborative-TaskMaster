const socketIo = require('socket.io');
const Task = require('../models/Task');
const User = require('../models/User');

let io;
const users = {};

const socketConfig = (server) => {
    io = socketIo(server, {
        cors: {
            origin: process.env.CLIENT_URL,
            methods: ['GET', 'POST'],
        },
    });

    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        socket.on('register', (userId) => {
            console.log(`User ${userId} registered with socket ${socket.id}`);
            users[userId] = socket.id;
            io.emit('onlineUsers', Object.keys(users));
        });

        socket.on('deleteTask', (taskId, userId) => {
            const targetSocketId = users[userId];
            if (targetSocketId) {
                io.to(targetSocketId).emit('taskDeleted', { taskId });
            }
        });

        socket.on('shareTask', async (taskId, userId) => {
            try {
                console.log(`Sharing task ${taskId} with user ${userId}`);
                const targetSocketId = users[userId];

                if (targetSocketId) {
                    const task = await Task.findById(taskId);

                    if (!task) {
                        console.log(`Task with ID ${taskId} not found.`);
                        return;
                    }

                    const users = await User.find({ _id: { $in: task.owner } }).select('name _id');

                    const userMap = users.reduce((acc, user) => {
                        acc[user._id] = user.name;
                        return acc;
                    }, {});

                    const newTask = {
                        id: task._id,
                        title: task.title,
                        status: task.status,
                        owner: task.owner,
                        name: userMap[task.owner] || 'Unknown',
                        sharedWith: task.sharedWith,
                        createdAt: task.createdAt,
                        updatedAt: task.updatedAt,
                    };

                    io.to(targetSocketId).emit('taskShared', newTask);
                    console.log(`Task "${task.title}" shared with user ${userId}.`);
                } else {
                    console.log(`User ${targetSocketId} is not connected.`);
                }
            } catch (error) {
                console.error('Error in shareTask event:', error);
            }
        });

        socket.on('rejectTask', async (userName, userId, taskName, taskId) => {
            try {
                const targetSocketId = users[userId];
                if (targetSocketId) {
                    io.to(targetSocketId).emit('taskRejected', {
                        userName: userName,
                        taskName: taskName,
                        taskId: taskId,
                    });
                }
            } catch (error) {
                console.error('Error in rejectTask event:', error);
            }
        });

        socket.on('updateTaskStatus', (taskId, newStatus, userId) => {
            const targetSocketId = users[userId];
            if (targetSocketId) {
                io.to(targetSocketId).emit('taskStatusUpdated', { taskId, newStatus });
            }
        });

        socket.on('disconnect', () => {
            console.log('A user disconnected:', socket.id);
            for (const userId in users) {
                if (users[userId] === socket.id) {
                    delete users[userId];
                    io.emit('onlineUsers', Object.keys(users));
                    break;
                }
            }
        });
    });
};

const getIoInstance = () => io;

module.exports = {
    socketConfig,
    getIoInstance,
};
