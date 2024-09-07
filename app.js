const express = require("./server/node_modules/express");
const mongoose = require("./server/node_modules/mongoose");
const cookieParser = require("./server/node_modules/cookie-parser");
const bodyParser = require("./server/node_modules/body-parser");
const dotenv = require("./server/node_modules/dotenv");
const app = express()
const PORT = process.env.PORT|| 3000;
const frontendRoutes= require('./server/routes/frontendRoutes.js');
const authRoutes= require('./server/routes/authRoutes.js');
const adminRoutes= require('./server/routes/adminRoutes.js');
const profileRoutes= require('./server/routes/profileRoutes.js');
const cors = require('cors');

app.use(cors());  // Enable all CORS requests
app.use(express.json())         // automatically passes body as json object
//Serve frontend from two folders above the current directory
app.use(express.static("client"));
app.use(express.urlencoded({extended: true}));

// console.log(__dirname);

app.use("",frontendRoutes);
app.use("/auth",authRoutes);
app.use("/admin",adminRoutes);
app.use("/profile",profileRoutes);

dotenv.config();

console.log(process.env.DB_CONNECT);

//Connect to MongoDB
mongoose
  .connect(process.env.DB_CONNECT)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
})