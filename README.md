# Collaborative-TaskMaster with User Authentication

## Overview
This project is a Collaborative-TaskMaster Application built using the **MERN stack** (MongoDB, Express.js, React.js, Node.js). The app allows multiple users to manage their personal to-do lists and share tasks with other users for collaboration. Real-time updates are achieved using **Socket.IO**.

## Features
### Frontend (React.js)
- **Authentication**
  - Signup and login with form validation.
  - JWT-based authentication.
- **Dashboard**
  - Display user-specific to-do lists.
  - Add, edit, and delete tasks.
  - Mark tasks as complete or incomplete.
  - Filter tasks by status (All, Pending, Completed).
- **Collaboration**
  - Share tasks with other users by entering their email.
  - Shared tasks appear on both users' dashboards.
  - Live updates using **Socket.IO**.
- **UI Enhancements**
  - Styled using **TailwindCSS**.
  - Modals for editing tasks and sharing tasks with collaborators.

### Backend (Node.js, Express.js)
- **Authentication**
  - JWT-based authentication and authorization middleware.
  - Password encryption using **bcrypt.js**.
- **Task Management API Endpoints**
  - `POST /tasks`: Create a new task.
  - `GET /tasks`: Fetch all tasks for the logged-in user.
  - `PUT /tasks/:id`: Update a task (mark as complete or edit description).
  - `DELETE /tasks/:id`: Delete a task.
  - `POST /tasks/:id/share`: Share a task with another user by email.
- **WebSocket Integration**
  - Set up a WebSocket server using **Socket.IO** for real-time task updates when shared tasks are modified.

### Database (MongoDB)
- **Collections**
  - `users`: Stores user details (name, email, hashed password, etc.).
  - `tasks`: Stores tasks with the following fields:
    - `title`: Task description.
    - `status`: Pending/Completed.
    - `owner`: User ID of the task creator.
    - `sharedWith`: Array of user IDs with whom the task is shared.
- **Mongoose** is used for schema definitions and data validation.

## Setup Instructions

### Prerequisites
- **Node.js**
- **MongoDB**
- **npm** or **yarn**

### Installation
1. **Clone the repository**
   ```bash
   git clone https://github.com/Sukhpal77/Collaborative-TaskMaster.git
   cd Collaborative-TaskMaster

2. **Install dependencies**

- For the backend:

      cd backend
      npm install

- For the frontend:

      cd client
      npm install

3. **Set up environment variables**

Create a .env file in the backend directory with the following variables:

    # JWT secrets
    ACCESS_TOKEN_SECRET=your_jwt_secret
    REFRESH_TOKEN_SECRET=your_jwt_secret

    # Email configuration
    EMAIL_USER=your_email
    EMAIL_PASS=your_password

    # Client URL (frontend)
    CLIENT_URL=your_frontent_url

    # Server port
    PORT=5000

Create a .env file in the frontend directory with the following variables:

    REACT_APP_API_URL=your_backend_url

4. **Run the application**

- Start the backend server:

      cd backend
      npm start

- Start the frontend:

      cd client
      npm start

5. **Access the application**

Open your browser and navigate to http://localhost:3000

### Additional Features
- Search and Filter
   - Search tasks by keywords.
- Pagination
   - Implement pagination for long task lists.
- Email Notifications
   - Notify users via email when a task is shared using Nodemailer.

### Folder Structure

        collaborative-todo-list/
        ├── backend/
        │   ├── controllers/
        │   ├── models/
        │   ├── routes/
        │   ├── server.js
        │   └── .env
        ├── client/
        │   ├── public/
        │   ├── src/
        │   ├── App.js
        │   └── index.js
        └── README.md
### License
 - This project is licensed under the MIT License.

### Author
Sukhpal Singh

 - Email: sukhpalsingh0333@gmail.com
 - GitHub: https://github.com/Sukhpal77
 - LinkedIn: [https://www.[linkedin.com/in/sukhpal-singh](http://www.linkedin.com/in/sukhpalsingh77)](https://www.linkedin.com/in/sukhpalsingh77/)
