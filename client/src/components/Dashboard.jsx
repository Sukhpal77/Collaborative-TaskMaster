import React, { useState, useEffect } from 'react';
import { useTheme } from './ThemeProvider';
import axiosInstance from '../axiosInstance';
import Header from './Header';
import UserList from './UserList';
import { FaShareAlt, FaTrashAlt, FaCheckCircle } from 'react-icons/fa';
import { io } from 'socket.io-client';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const apiUrl = process.env.REACT_APP_API_URL;

const socket = io(apiUrl);

function Dashboard() {
  const { darkMode, toggleDarkMode } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('All');
  const [newTask, setNewTask] = useState('');
  const [userList, setUserList] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isTaskLoading, setIsTaskLoading] = useState(true);
  const [isUserListLoading, setIsUserListLoading] = useState(true);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isSharingTask, setIsSharingTask] = useState(false);
  const [sharingUserId, setSharingUserId] = useState(null);
  const [user, setUser] = useState({
    userId: JSON.parse(localStorage.getItem('userData')).id,
    name: JSON.parse(localStorage.getItem('userData')).name || '',
    email: JSON.parse(localStorage.getItem('userData')).email || '',
    profilePic: '/path/to/profile-pic.jpg',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [taskBeingShared, setTaskBeingShared] = useState(null);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    socket.emit('register', user.userId);
    socket.on('onlineUsers', (users) => {
      setOnlineUsers(users);
    });
    socket.on('taskDeleted', ({ taskId }) => {
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
      toast.info('A task was deleted.');
    });

    socket.on('taskShared', (newTask) => {
      setTasks((prevTasks) => [...prevTasks, newTask]);
      toast.success('A new task was shared with you!');
    });

    socket.on('taskStatusUpdated', ({ taskId, newStatus }) => {
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task))
      );
      toast.info('Task status updated.');
    });

    socket.on('rejectTask', ({ userName, taskName, taskId }) => {
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? { ...task, sharedWith: [] } : task))
      );
      toast.info(`Task ${taskName} was rejected by ${userName}.`);
    });

    return () => {
      socket.off('taskDeleted');
      socket.off('taskShared');
      socket.off('taskStatusUpdated');
      socket.off('onlineUsers');
    };
  }, [user.email]);

  useEffect(() => {
    fetchTasks(page, search);
    setIsUserListLoading(true);
    axiosInstance.get('/api/get-all-users').then((response) => {
      setUserList(response.data);
      setIsUserListLoading(false);
    }).catch(() => {
      toast.error('Failed to load user list.');
      setIsUserListLoading(false);
    });
  }, [page, search]);

  const fetchTasks = (page, search) => {
    setIsTaskLoading(true);
    axiosInstance.get('/api/tasks', {
      params: { page, search, limit: 5 }
    })
      .then((response) => {
        setTasks(response.data.tasks);
        setTotalPages(response.data.totalPages);
        setIsTaskLoading(false);
      })
      .catch(() => {
        toast.error('Failed to load tasks.');
        setIsTaskLoading(false);
      });
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handlePagination = (newPage) => {
    setPage(newPage);
  };

  const handleAddTask = () => {
    if (!newTask) return;
    setIsAddingTask(true);
    const newTaskData = { title: newTask, status: 'Pending', owner: user.email };
    axiosInstance.post('/api/tasks', newTaskData).then((response) => {
      setTasks([...tasks, response.data]);
      setNewTask('');
      setIsAddingTask(false);
      toast.success('Task added successfully!');
    }).catch(() => {
      toast.error('Failed to add task.');
      setIsAddingTask(false);
    });
  };

  const handleToggleTaskCompletion = (taskId) => {
    const task = tasks.find((task) => task.id === taskId);
    const updatedStatus = task.status === 'Pending' ? 'Completed' : 'Pending';
    axiosInstance.put(`/api/tasks/${taskId}`, { status: updatedStatus }).then(() => {
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? { ...task, status: updatedStatus } : task))
      );
      toast.success(`Task marked as ${updatedStatus}.`);
    }).catch(() => {
      toast.error('Failed to update task status.');
    });
  };

  const handleDeleteTask = (taskId) => {
    axiosInstance.delete(`/api/tasks/${taskId}`).then(() => {
      setTasks(tasks.filter((task) => task.id !== taskId));
      toast.success('Task deleted successfully!');
    }).catch(() => {
      toast.error('Failed to delete task.');
    });
  };

  const onLogout = async () => {
    try {
      const response = await axiosInstance.post('/api/auth/logout');
      if (response.status === 200) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userData');
        window.location.href = '/';
      } else {
        toast.error('Failed to logout. Please try again.');
      }
    } catch (error) {
      toast.error('Failed to logout.');
    }
  };

  const handleShareTask = (taskId) => {
    setTaskBeingShared(taskId); 
    setIsModalOpen(true);
  };

  const handleUserSelect = (user) => {
    if (!taskBeingShared) return;
    setIsSharingTask(true);
    setSharingUserId(user._id);
    setSelectedUser(user);
    axiosInstance.post('/api/tasks/share-task', { taskId: taskBeingShared, userId: user._id })
      .then(() => {
        setTasks((prev) =>
          prev.map((task) =>
            task.id === taskBeingShared
              ? { ...task, sharedWith: [...task.sharedWith, user._id] }
              : task
          )
        );
        setIsModalOpen(false);
        setSharingUserId(null);
        socket.emit('shareTask', taskBeingShared, user._id);
        toast.success(`Task shared with ${user.name}!`);
        setIsSharingTask(false);
        setSharingUserId(null);
      }).catch(() => {
        toast.error('Failed to share task.');
        setIsSharingTask(false);
      });
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'All') return true;
    return filter === 'Completed' ? task.status === 'Completed' : task.status === 'Pending';
  });

  const handleSearch = (event) => {
    const query = event.target.value;
    fetchTasks(page, query);
  };
  return (
    <div className={`lg:h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} p-6 no-scrollbar`}>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <Header user={user} onLogout={onLogout} toggleDarkMode={toggleDarkMode} darkMode={darkMode} />
      <div className="flex flex-col lg:flex-row mt-6">
        <div className=" min-h-[620px] mb-6 lg:mb-0 lg:w-2/3 mr-0 lg:mr-6 bg-slate-200 dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className='flex flex-col items-center'>
            <div className='flex justify-between w-full items-baseline pb-2'>
              <h2 className="text-2xl font-semibold mb-2 dark:text-white">To-Do List</h2>
              <div className="flex justify-center items-center space-x-4 mt-1">
                <button
                  onClick={() => handlePagination(page > 1 ? page - 1 : 1)}
                  className="bg-gray-400 text-white text-lg rounded-full w-8 h-8 flex items-center justify-center hover:bg-blue-500 transition"
                >
                  &lt;
                </button>
                <span className="text-lg font-medium text-gray-700 dark:text-white">
                  Page {page}
                </span>
                <button
                  onClick={() => handlePagination(page < totalPages ? page + 1 : totalPages)}
                  className="bg-gray-400 text-white text-lg rounded-full w-8 h-8 flex items-center justify-center hover:bg-blue-500 transition"
                >
                  &gt;
                </button>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-5 mb-6">
            <input
              type="text"
              placeholder="Search tasks..."
              onChange={handleSearch}
              className="p-2  bg-white dark:bg-gray-800 text-gray-900 dark:text-white border rounded-xl shadow-sm"
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border rounded-lg shadow-sm"
            >
              <option value="All">All</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
            </select>
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Add new task"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                className="p-2 border rounded-l-3xl shadow-sm w-full md:w-64 dark:bg-gray-800 dark:text-white"
              />
              <button
                onClick={isAddingTask ? null : handleAddTask}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-r-3xl shadow-lg"
                disabled={isAddingTask}
              >
                {isAddingTask ? 'Adding...' : 'Add'}
              </button>
            </div>
          </div>
          {isTaskLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
            </div>
          ) : (
            <>
              <div className="space-y-4 h-[470px] overflow-scroll no-scrollbar">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md ${task.sharedWith.length > 0 ? 'border-2 border-blue-500' : ''}`}
                  >
                    <div className="flex items-center">
                      <button
                        onClick={() => handleToggleTaskCompletion(task.id)}
                        className={`p-2 rounded-full ${task.status === 'Completed' ? 'bg-green-500' : 'bg-gray-400'} mr-4 active:p-3`}
                      >
                        <FaCheckCircle color="white" />
                      </button>
                      <div className="flex flex-col">
                        <p className={`${task.status === 'Completed' ? 'line-through text-gray-500 ' : ''} dark:text-gray-100`}>{task.title}</p>
                        <p className=" text-xs text-gray-500">{task.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleShareTask(task.id)}
                        className={`p-2 text-white rounded-full ${task.sharedWith.length > 0 ? 'bg-green-500' : 'bg-blue-500'}`}
                      >
                        <FaShareAlt />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-2 bg-red-500 text-white rounded-full cursor-pointer active:p-3"
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="lg:w-1/3 bg-slate-200 dark:bg-gray-800 p-6 rounded-lg shadow-lg min-h-[620px]">
          <h2 className="text-2xl font-semibold mb-4 dark:text-white">Users</h2>
          {isUserListLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
            </div>
          ) : (
            <>
              <UserList userList={userList} onlineUsers={onlineUsers} />
            </>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Share Task</h2>
            <div className="space-y-2">
              {userList.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded-lg"
                >
                  <p className="text-gray-900 dark:text-white">{user.name}</p>
                  <button
                    onClick={() => handleUserSelect(user)}
                    className={`p-2 rounded-full text-white 
                  ${sharingUserId === user._id ? 'bg-gray-400' : 'bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700'}`}
                    disabled={sharingUserId === user._id}
                  >
                    {sharingUserId === user._id ? 'Sharing...' : 'Share'}
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => setIsModalOpen(false)}
              className="mt-4 p-2 bg-gray-600 dark:bg-gray-700 text-white rounded-full w-full hover:bg-gray-700 dark:hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
