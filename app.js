const express = require("./server/node_modules/express");
const mongoose = require("./server/node_modules/mongoose");
const cookieParser = require("./server/node_modules/cookie-parser");
const bodyParser = require("./server/node_modules/body-parser");
const dotenv = require("./server/node_modules/dotenv");
const cors = require("./server/node_modules/cors");
const app = express();
const PORT = process.env.PORT || 3000;
const frontendRoutes = require("./server/routes/frontendRoutes.js");
const authRoutes = require("./server/routes/authRoutes.js");
const adminRoutes = require("./server/routes/adminRoutes.js");
const userRoutes = require("./server/routes/userRoutes.js");
const profileRoutes = require("./server/routes/profileRoutes.js");
const incidentReportingRoutes = require("./server/routes/incidentReportingRoutes.js");

app.use(cors()); // Enable all CORS requests
app.use(express.json()); // automatically passes body as json object

//Serve frontend from two folders above the current directory
app.use(express.static("client"));
app.use(express.urlencoded({ extended: true }));

// console.log(__dirname);

dotenv.config();

app.use(cookieParser());

app.use("", frontendRoutes);
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/profile", profileRoutes);
app.use("/incidentReporting", incidentReportingRoutes);
app.use("/user", userRoutes);

//console.log(process.env.DB_CONNECT);

//Connect to MongoDB
mongoose
  .connect(process.env.DB_CONNECT)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
