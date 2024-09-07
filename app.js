const express = require("./server/node_modules/express");
const mongoose = require("./server/node_modules/mongoose");
const cookieParser = require("./server/node_modules/cookie-parser");
const bodyParser = require("./server/node_modules/body-parser");
const dotenv = require("./server/node_modules/dotenv");

const app = express();
const PORT = process.env.PORT || 3000;
dotenv.config();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

//Serve frontend from two folders above the current directory
app.use(express.static("client"));

const path = require("path");

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./client/html/index.html"));
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
