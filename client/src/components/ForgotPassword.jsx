import React, { useState } from 'react';
import { useTheme } from './ThemeProvider';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaMoon, FaSun } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ForgotPassword() {
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const apiUrl = process.env.REACT_APP_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      await axios.post(`${apiUrl}/api/auth/reset-password-request`, { email });
      toast.success('Check your email to reset the password');
      setTimeout(() => navigate('/'), 3000); // Delay navigation by 3 seconds
    } catch (error) {
      setErrorMessage('Failed to send reset link. Please try again.');
      toast.error('Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-white'} md:${darkMode ? 'bg-gray-800' : 'bg-gradient-to-r from-teal-400 to-blue-600'}`}
    >
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      
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
            alt="Forgot Password illustration"
            className="rounded-lg shadow-xl transition-transform transform hover:scale-105"
          />
        </div>

        <div className="md:w-1/3 max-w-md space-y-6">
          <h2 className={`text-4xl font-extrabold text-center ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            Forgot Password
          </h2>

          <form onSubmit={handleSubmit}>
            <input
              className={`w-full px-5 py-4 text-lg rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-100 border-gray-300'} shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition`}
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {errorMessage && <div className="text-red-500 text-center mt-2">{errorMessage}</div>}

            <button
              className={`w-full px-6 py-4 text-lg font-semibold text-white rounded-lg shadow-xl ${darkMode ? 'bg-blue-400 hover:bg-blue-500' : 'bg-blue-600 hover:bg-blue-700'} transition-transform transform hover:scale-105 mt-4`}
              type="submit"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <p className={`mt-6 text-sm text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Remember your password?{' '}
            <a
              href="/"
              className={`text-blue-600 ${darkMode ? 'text-blue-400' : 'hover:underline'}`}
            >
              Login
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}

export default ForgotPassword;
