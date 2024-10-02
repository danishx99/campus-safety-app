const express = require("./server/node_modules/express");
const mongoose = require("./server/node_modules/mongoose");
const cookieParser = require("./server/node_modules/cookie-parser");
const bodyParser = require("./server/node_modules/body-parser");
const path = require("path");
const dotenv = require("./server/node_modules/dotenv");
const cors = require("./server/node_modules/cors");
const User = require("./server/schemas/User.js");
const sendNotification = require("./server/utils/sendNotification.js");
const app = express();
const PORT = process.env.PORT || 3000;

// Import routes
const frontendRoutes = require("./server/routes/frontendRoutes.js");
const authRoutes = require("./server/routes/authRoutes.js");
const safetyResourcesRoutes = require("./server/routes/safetyResourcesRoutes.js");
const profileRoutes = require("./server/routes/profileRoutes.js");
const incidentReportingRoutes = require("./server/routes/incidentReportingRoutes.js");
const emergencyAlertRoutes = require("./server/routes/emergencyAlertRoutes.js");
const notificationRoutes = require("./server/routes/notificationRoutes.js");
const locationRoutes = require("./server/routes/locationRoutes.js");

// Load environment variables from .env file
dotenv.config();

// Middleware
app.use(cors()); // Enable all CORS requests
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser()); // Parse cookies
// Set a larger limit for JSON bodies

// Serve frontend static files from the 'client' directory
app.use(express.static("client"));

// Route middleware
app.use("", frontendRoutes);
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use("/incidentReporting", incidentReportingRoutes);
app.use("/emergency", emergencyAlertRoutes);
app.use("/safetyResources", safetyResourcesRoutes);
app.use("/notifications", notificationRoutes);
app.use("/location", locationRoutes);

//catch all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "./client/html/error", "notFound404.html"));
});

//Route to clear user collection
app.get("/clearusers", async (req, res) => {
  try {
    await User.deleteMany({});
    res.send("User collection cleared");
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});


// MongoDB connection
mongoose
  .connect(process.env.DB_CONNECT)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// Start the server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

module.exports = app;
