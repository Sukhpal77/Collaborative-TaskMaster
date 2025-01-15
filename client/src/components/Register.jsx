import React, { useState } from 'react';
import { useTheme } from './ThemeProvider';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaMoon, FaSun } from 'react-icons/fa';

function Register() {
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const apiUrl = process.env.REACT_APP_API_URL;

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name || !email || !password || !confirmPassword) {
      setErrorMessage('All fields are required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage('Please enter a valid email address');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${apiUrl}/api/auth/signup`, { name, email, password, confirmPassword });
      navigate('/');
    } catch (error) {
      setErrorMessage('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-white'} md:${darkMode ? 'bg-gray-800' : 'bg-gradient-to-r from-teal-400 to-blue-600'}`}
    >
      <button
        onClick={toggleDarkMode}
        className="absolute top-6 right-6 p-1 rounded-full bg-blue-600 dark:bg-blue-400 text-white dark:text-black shadow-xl hover:scale-125 transition"
      >
        {darkMode ? <FaSun size={16} /> : <FaMoon size={16} />}
      </button>

      <section
        className={`flex flex-col md:flex-row justify-center items-center space-y-8 md:space-y-0 md:space-x-16 p-8 rounded-xl shadow-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
      >
        <div className="md:w-1/3 max-w-md">
          <img
            src="https://tecdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp"
            alt="Register illustration"
            className="rounded-lg shadow-xl transition-transform transform hover:scale-105"
          />
        </div>

        <div className="md:w-1/3 max-w-md space-y-6">
          <h2 className={`text-4xl font-extrabold text-center ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            Register
          </h2>

          <form onSubmit={handleRegister}>
            <input
              className={`w-full px-5 py-4 text-lg rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-100 border-gray-300'} shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition`}
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className={`w-full px-5 py-4 text-lg rounded-lg border mt-4 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-100 border-gray-300'} shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition`}
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className={`w-full px-5 py-4 text-lg rounded-lg border mt-4 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-100 border-gray-300'} shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition`}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              className={`w-full px-5 py-4 text-lg rounded-lg border mt-4 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-100 border-gray-300'} shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition`}
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            {errorMessage && <div className="text-red-500 text-center mt-2">{errorMessage}</div>}

            <button
              className={`w-full px-6 py-4 text-lg font-semibold text-white rounded-lg shadow-xl ${darkMode ? 'bg-blue-400 hover:bg-blue-500' : 'bg-blue-600 hover:bg-blue-700'} transition-transform transform hover:scale-105 mt-4`}
              type="submit"
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>

          <p className={`mt-6 text-sm text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Already have an account?{' '}
            <button
              onClick={() => navigate('/')}
              className={`text-blue-600 ${darkMode ? 'text-blue-400' : 'hover:underline'}`}
            >
              Login
            </button>
          </p>
        </div>
      </section>
    </div>
  );
}

export default Register;
