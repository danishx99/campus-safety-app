const express = require('express')
const path= require('path')     // so we can render the frontend
const app = express()
const PORT = 3000
const frontendRoutes= require('./server/routes/frontendRoutes.js');
const authRoutes= require('./server/routes/authRoutes.js');

app.use(express.json())         // automatically passes body as json object
//Serve frontend from two folders above the current directory
app.use(express.static("client"));
app.use(express.urlencoded({extended: true}));

// console.log(__dirname);

app.use("",frontendRoutes);
app.use("/auth",authRoutes);

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
})