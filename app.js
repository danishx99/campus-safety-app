const express = require('./server/node_modules/express');
const mongoose = require('./server/node_modules/mongoose');
const cookieParser = require('./server/node_modules/cookie-parser');
const bodyParser = require('./server/node_modules/body-parser');
const dotenv = require('./server/node_modules/dotenv');
const cors = require('./server/node_modules/cors');
const User = require('./server/schemas/User.js');
const sendNotification = require('./server/utils/sendNotification.js');
const app = express();
const PORT = process.env.PORT || 3000;

// Import routes
const frontendRoutes = require('./server/routes/frontendRoutes.js');
const authRoutes = require('./server/routes/authRoutes.js');
const adminRoutes = require('./server/routes/adminRoutes.js');
const userRoutes = require('./server/routes/userRoutes.js');
const profileRoutes = require('./server/routes/profileRoutes.js');
const incidentReportingRoutes = require('./server/routes/incidentReportingRoutes.js');

// Load environment variables from .env file
dotenv.config();

// Middleware
app.use(cors()); // Enable all CORS requests
app.use(express.json()); // Automatically parses incoming JSON requests
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cookieParser()); // Parse cookies

// Serve frontend static files from the 'client' directory
app.use(express.static('client'));

// Route middleware
app.use('', frontendRoutes);
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/profile', profileRoutes);
app.use('/incidentReporting', incidentReportingRoutes);
app.use('/user', userRoutes);

//Route to clear user collection
app.get('/clearusers', async (req, res) => {
  try {
    await User.deleteMany({});
    res.send('User collection cleared');
  } catch (err) {
    console.log(err)
    res.status(500).send(err);
  }
});

app.get('/sendNotificationToEveryone', async (req, res) => {
  try {
    // Get all FCM tokens
    const users = await User.find({});
    const fcmTokens = users.map(user => user.FCMtoken);
    console.log('FCM tokens:', fcmTokens);

    // Send a notification to all users
    await sendNotification(fcmTokens, 'Hello', 'This is a test notification');
    res.send('Notification sent to everyone');
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

// MongoDB connection
mongoose
  .connect(process.env.DB_CONNECT)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// Start the server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
