var User = require('../models/user');
var Stody = require('../models/story');
var config = require('../../config');

var secretKey = config.secretKey;

var jsonwebtoken = require('jsonwebtoken');

function createToken(user) {

  var token = jsonwebtoken.sign({
    id: user._id,
    name: user.name,
    username: user.username
  }, secretKey, { //that's why your secretKey has to be difficult to guess, otherwise will be decoded easily by hackers
    expiresIn: "1440m"  //without specifying m, is seconds, you can do expiresIn: 60*60*24
  }); //expiresInMinutes got deprecated

  return token;

}


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
    The moment I click this, then automatically this request header is added - Content-Type:application/x-www-form-urlencoded
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
   NOTICE: the user info DOES NOT have password field, because in the user.js, you set select to false for password

  */

  api.post('/login',function(req, res){
    User.findOne({
      username: req.body.username
    }).select('password').exec(function(err, user){
      if (err) throw err;
      if(!user) {
        res.send({message: "User doesn't exist"});
      } else if (user) {
        console.log(user); //here the user object contains only the attributes specified in select method
        //so here it only has 'password'
        var validPassword = user.comparePassword(req.body.password);

        if (!validPassword) {
          res.send({message: "Invalid Password"});
        } else {
          //GET THE TOKEN
          var token = createToken(user);
          res.json({
            success: true,
            message: "Successfully login!",
            token: token
          });
        }
      }
    });
  });
  /* To test:
    go to postman
    post localhost:3000/api/login
    click the "x-www-form-urlencoded" radio button
    The moment I click this, then automatically this request header is added - Content-Type:application/x-www-form-urlencoded
    type in key value pair one by one
    username: shachopin
    password: <your own password>
    Click on send, will see this json in response body 
    {
      "success": true,
      "message": "Successfully login!",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU4MmJlNTNmM2YzNDQ0MDIwMGI4NGZhYyIsImlhdCI6MTQ3OTM0NDE5MiwiZXhwIjoxNDc5NDMwNTkyfQ.hJKqmLY5Qjr_LzvTSq4rbFScU2WOzH1aBbmbN9IFKRs"
    }
  */

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  ///here is the custom middleware, anything AFTER it will be your destination B, 
  //anything BEFORE it is destination A
  api.use(function(req, res, next) {
    console.log("Somebody just came to our app!");

    var token = req.body.token || req.param('token') || req.headers['x-access-token'];
    //can provide the token in one of the three ways
    // check if token exist
    if(token) {
      jsonwebtoken.verify(token, secretKey, function(err, decoded) {

        if(err) {
          res.status(403).send({ success: false, message: "Failed to authenticate user"});

        } else {
          //
          req.decoded = decoded;
          next(); //next route
        }
      });
    } else {
      res.status(403).send({ success: false, message: "No Token Provided"});
    }

  });
  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

  //Desitnation B //provide a legitimate token to reach here
  
  /* test code

  api.get('/', function(req, res){
    res.json("hello World!");

  });
  */
  /* To test:
    go to postman
    get localhost:3000/api
    response is
    {
      "success": false,
      "message": "No Token Provided"
    }
    now add a request header to your GET
    x-access-token:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU4MmJlNTNmM2YzNDQ0MDIwMGI4NGZhYyIsImlhdCI6MTQ3OTM0NDE5MiwiZXhwIjoxNDc5NDMwNTkyfQ.hJKqmLY5Qjr_LzvTSq4rbFScU2WOzH1aBbmbN9IFKRs
    You will see "hello World" in response body
    
    if you provide a wrong token:
    you will see this in reponse body:
    {
    "success": false,
    "message": "Failed to authenticate user"
    }

    If you have never generated a token, or if the token has expired,
    You need to login in to generate the token 

    go to postman
    post localhost:3000/api/login
    click the "x-www-form-urlencoded" radio button
    The moment I click this, then automatically this request header is added - Content-Type:application/x-www-form-urlencoded
    type in key value pair one by one
    username: shachopin
    password: <your own password>
    Click on send, will see this json in response body 
    {
      "success": true,
      "message": "Successfully login!",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU4MmJlNTNmM2YzNDQ0MDIwMGI4NGZhYyIsImlhdCI6MTQ3OTM0NDE5MiwiZXhwIjoxNDc5NDMwNTkyfQ.hJKqmLY5Qjr_LzvTSq4rbFScU2WOzH1aBbmbN9IFKRs"
    }
  */

  api.route('/')
     //chaning method, never put ;
    .post(function(req, res) {

      var story = new Story({
        creator: req.decoded.id,  //this is from your token decoded
        content: req.body.content,

      });

      story.save(function(err/*, newStory*/) {
        if(err) {
          res.send(err);
          return
        }
        //io.emit('story', newStory)
        res.json({message: "New Story Created!"});
      });
    })


    .get(function(req, res) {

      Story.find({ creator: req.decoded.id }, function(err, stories) {

        if(err) {
          res.send(err);
          return;
        }

        res.send(stories);
      });
    });

  api.get('/me', function(req, res) {
    res.send(req.decoded);
  });
  // this is for frontend to use, no other way to retrieve the my profile info

  return api;

}