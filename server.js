var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var config = require('./config')

var app = express();
app.use(bodyParser.urlencoded({extended: true})); //to allow image or video, false will only take string
app.use(bodyParser.json());
app.use(morgan('dev')); //log request info in the console

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