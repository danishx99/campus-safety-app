const express = require('./server/node_modules/express');
const mongoose = require('./server/node_modules/mongoose');
const cookieParser = require('./server/node_modules/cookie-parser');
const bodyParser = require('./server/node_modules/body-parser');
const dotenv = require('./server/node_modules/dotenv');
const cors = require('./server/node_modules/cors');
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

app.use(cookieParser());
// Increase the payload size limit
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use("", frontendRoutes);
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/profile", profileRoutes);
app.use("/incidentReporting", incidentReportingRoutes);
app.use("/user", userRoutes);

// MongoDB connection
mongoose
  .connect(process.env.DB_CONNECT)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// Start the server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
