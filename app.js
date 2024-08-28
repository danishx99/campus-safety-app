const express = require('express')
const path= require('path')     // so we can render the frontend
const app = express()
const PORT = 3000

app.use(express.json())         // automatically passes body as json object
app.use(express.static(path.join(__dirname, 'client/html')))     // server static files from 'public' directory 
app.use(express.static(path.join(__dirname, 'client/styles')));     // serve static files from 'styles' directory
app.use(express.urlencoded({extended: true}));


app.get('/', (req, res) => {
  res.send(path.join(__dirname,'client/html','index.html'));
})

app.get('/login', (req, res) => {
    res.send(path.join(__dirname,'client/html/auth','login.html'));
  })

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
})