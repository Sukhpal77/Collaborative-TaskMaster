import React, { useState, useEffect, useRef } from 'react';
import { FaSun, FaMoon, FaUser } from 'react-icons/fa';

const Header = ({ user, onLogout, toggleDarkMode, darkMode }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const handleLogoutClick = () => {
    setIsModalOpen(true);
  };

  const confirmLogout = () => {
    setIsModalOpen(false);
    onLogout();
  };

  const cancelLogout = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="p-4 bg-slate-200 dark:bg-gray-800 shadow-lg rounded-lg">
      <div className="flex items-center justify-between">
        <div className="text-xl font-bold text-gray-800 dark:text-white flex-grow text-center">
          Dashboard
        </div>

        <div className="relative flex items-center" ref={dropdownRef}>
          <span className="text-black dark:text-white pr-3">{user.name}</span>
          <button onClick={toggleDropdown} className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-white">
              <FaUser size={24} />
            </div>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 shadow-lg rounded-lg z-10">
              <button
                onClick={handleLogoutClick}
                className="block w-full px-4 py-2 text-left text-black dark:text-white hover:bg-red-500 dark:hover:bg-red-500 hover:text-white hover:cursor-pointer hover:rounded-lg"
              >
                Logout
              </button>
              <div className="block w-full px-4 py-2 flex items-center justify-between">
                <span className="text-black dark:text-white">Dark Mode</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={toggleDarkMode}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:bg-blue-600"></div>
                  <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5 dark:bg-black"></div>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              Confirm Logout
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to logout?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelLogout}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-black dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
