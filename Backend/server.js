const express = require('express');
const http = require('http');
const { socketConfig } = require('./config/socketConfig');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');
const connectDB = require('./config/db');

dotenv.config();

const app = express();
const server = http.createServer(app);
socketConfig(server);

app.use(cors());
app.use(express.json());


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/get-all-users', userRoutes);


(async () => {
    try {
      await connectDB(); 
      const PORT = process.env.PORT || 5000;
      server.listen(PORT, () =>
        console.log(`Server running on port ${PORT}`)
      );
    } catch (error) {
      console.error('Failed to start the server:', error.message);
    }
  })();