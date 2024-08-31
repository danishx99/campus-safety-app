const express = require('express')
const path= require('path')     // so we can render the frontend
const app = express()
const PORT = 3000

app.use(express.json())         // automatically passes body as json object
//Serve frontend from two folders above the current directory
app.use(express.static("client"));
app.use(express.urlencoded({extended: true}));

// console.log(__dirname);


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname,'client/html/auth','login.html'));
})

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname,'client/html/auth','register.html'));
  })

  app.get('/forgotPassword', (req, res) => {
    res.sendFile(path.join(__dirname,'client/html/auth','forgotPassword.html'));
  })

  app.get('/resetPassword', (req, res) => {
    res.sendFile(path.join(__dirname,'client/html/auth','resetPassword.html'));
  })

  app.get('/verifyEmail', (req, res) => {
    res.sendFile(path.join(__dirname,'client/html/auth','verifyEmail.html'));
  })

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
})