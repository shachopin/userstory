var User = require('../models/user');

var config = require('../../config');

var secretKey = config.secretKey;

module.exports = function(app, express) {

  var api = express.Router();

  api.post('/signup', function(req, res){
    var user = new User({ ////almost like constructor, represent a record in the table, ActiveReord like Rails Model ORM
      name: req.body.name,
      username: req.body.username,
      password: req.body.password //body is bodyparser, because of this line in server.js -- app.use(bodyParser.urlencoded({extended: true}));
    });

    user.save(function (err) {
      if (err) {
        res.send(err);
        return;
      }
      res.json({message: "user has been created"}); //although here is javascript object, the response will be in json format
     /*   {
            "message": "user has been created"
          }
      */
    });
  });
  /* To test:
    go to postman
    post localhost:3000/api/signup
    click the "x-www-form-urlencoded" radio button
    type in key value pair one by one
    name: Dawei
    username: shachopin
    password: <your own password>
    Click on send, will see this json in response body 
    {
      "message": "user has been created"  
    }
  */
  
  api.get('/users', function(req, res) {
    User.find({}, function(err, users){//User is just like Rails activeModel class Post
      if (err) {
        res.send(err);
        return;
      }
      res.json(users);
    });  
  });
  /*
   To test:
   POSTMAN or just browser, type http://localhost:3000/api/users (this is a GET request)
   will see the json response of all the users

  */

  return api;

}