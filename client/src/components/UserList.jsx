import React from 'react';
import { FaUser } from 'react-icons/fa';

function UserList({ userList, onlineUsers }) {
  console.log('online', onlineUsers);
  console.log('all', userList);
  return (
    <div className="space-y-4 h-[530px] overflow-scroll no-scrollbar">
      {userList.map((user) => (
        <div key={user.id} className="p-4 rounded-lg shadow-md bg-white dark:bg-gray-700">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${onlineUsers.includes(user._id) ? 'bg-green-500' : 'bg-gray-400'
                  }`}
              ></div>
              <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-gray-300 dark:bg-gray-500 text-gray-700 dark:text-white">
                <FaUser size={24} />
              </div>
              <div className="text-lg dark:text-gray-400">{user.name}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default UserList;
