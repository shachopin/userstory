var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var config = require('./config');
var mongoose = require('mongoose');
var app = express();

mongoose.connect(config.database, function(err){
  if (err) {
    console.log(err);
  } else {
    console.log("Connected to the database");
  }
});

app.use(bodyParser.urlencoded({extended: true})); //to allow image or video, false will only take string
app.use(bodyParser.json());
app.use(morgan('dev')); //log request info in the console

var api = require('./app/routes/api')(app, express);
app.use('/api', api); //this is for the API have this prefix: /api - for example, localhost:3000/api/signup
//type anything else will go to the next route, to show the below html page: for example, if I tpe localhost:3000/api/userss
app.get('*', function(req,res){
  res.sendFile(__dirname + '/public/views/index.html');
});

app.listen(config.port, function(err){
  if(err) {
    console.log(err);
  } else {
    console.log("Listening on port 3000");
  }
});