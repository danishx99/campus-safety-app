  const express = require("./server/node_modules/express");
  const mongoose = require("./server/node_modules/mongoose");
  const cheerio = require("./server/node_modules/cheerio");
  const compression = require("./server/node_modules/compression");
  const cookieParser = require("./server/node_modules/cookie-parser");
  const bodyParser = require("./server/node_modules/body-parser");
  const path = require("path");
  const dotenv = require("./server/node_modules/dotenv");
  const cors = require("./server/node_modules/cors");
  const User = require("./server/schemas/User.js");
  const sendNotification = require("./server/utils/sendNotification.js");
  const app = express();
  const PORT = process.env.PORT || 3000;


  //Add GZIP compression to improve performance,the compression middleware compresses the response bodies for all requests that pass through it.
  app.use(compression());

  // const cron = require('./server/node_modules/node-cron');

  // Import your cron job function
  const { initializeCronJob } = require('./server/utils/cronJobs');
  

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

  // Serve frontend static files from the 'client' directory, add cache control so that the browser caches the files for 1 day
  // app.use(express.static('client', {
  //   maxAge: '7d', // Cache for 7 days
  //   etag: false
  // }));

// const fs = require('fs');

// // Serve static HTML files and intercept them to apply lazy loading
// app.use((req, res, next) => {
//   const filePath = path.join(__dirname, 'client', req.path);

//   if (fs.existsSync(filePath) && filePath.endsWith('.html')) {
//     fs.readFile(filePath, 'utf8', (err, data) => {
//       if (err) {
//         return next();
//       }

//       // Load the HTML into Cheerio
//       const $ = cheerio.load(data);

//       // Add lazy loading to <img> tags
//       const imgTagsModified = $('img:not([loading])').attr('loading', 'lazy').length;

//       // Send the modified HTML
//       res.send($.html());

//       // Log success message
//       console.log(`Lazy loading added to ${imgTagsModified} image(s) for ${filePath}`);
//     });
//   } else {
//     next();
//   }
// });


  app.use(express.static('client'));
  

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
    res.status(404).sendFile(path.join(__dirname, "./client/html/error", "notFound404.html"));
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

    // Initialize cron job after the server starts
    initializeCronJob();
  });

  module.exports = app;
