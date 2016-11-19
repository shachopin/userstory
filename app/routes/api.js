var User = require('../models/user');
var Story = require('../models/story');
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
    var token = createToken(user);

    user.save(function (err) {
      if (err) {
        res.send(err);
        return;
      }
      res.json({
        success: true,
        message: "user has been created",
        token: token
      }); //although here is javascript object, the response will be in json format
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
    }).select('name username password').exec(function(err, user){
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
          console.log("here is the decoded info", decoded);
          /*
            here is the decoded info 
            {
              "id": "582be53f3f34440200b84fac",
              "name": "Dawei",
              "username": "shachopin",
              "iat": 1479516215,
              "exp": 1479602615
            }
          */
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
     //chaining method, never put ;
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
    /*
     To test:

     POST localhost:3000/api

     request header:
     x-access-token:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU4MmJlNTNmM2YzNDQ0MDIwMGI4NGZhYyIsImlhdCI6MTQ3OTM0NDE5MiwiZXhwIjoxNDc5NDMwNTkyfQ.hJKqmLY5Qjr_LzvTSq4rbFScU2WOzH1aBbmbN9IFKRs
     Content-Type:application/x-www-form-urlencoded

     request body:
     click the "x-www-form-urlencoded" radio button
     type content:This is my second story

     click send
     shows 
     {"message": "New Story Created!"}
    */


    .get(function(req, res) {

      Story.find({ creator: req.decoded.id }, function(err, stories) {

        if(err) {
          res.send(err);
          return;
        }

        res.send(stories);
      });
    });
    /*
    To test:
    GET localhost:3000/api
    request header:
    x-access-token:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU4MmJlNTNmM2YzNDQ0MDIwMGI4NGZhYyIsImlhdCI6MTQ3OTM0NDE5MiwiZXhwIjoxNDc5NDMwNTkyfQ.hJKqmLY5Qjr_LzvTSq4rbFScU2WOzH1aBbmbN9IFKRs
  
    response body
    [
  {
    "_id": "582d4de12daf3a016bcded87",
    "creator": "582be53f3f34440200b84fac",
    "content": "This is my story",
    "__v": 0,
    "created": "2016-11-17T06:27:45.370Z"
  },
  {
    "_id": "582d4dfb2daf3a016bcded88",
    "creator": "582be53f3f34440200b84fac",
    "content": "This is my second story",
    "__v": 0,
    "created": "2016-11-17T06:28:11.636Z"
  }]
    */

  api.get('/me', function(req, res) {
    res.send(req.decoded);
  });
  // this is for frontend to use, no other way to retrieve the my profile info
  /*
  To test:
    GET localhost:3000/api/me
    request header:
    x-access-token:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU4MmJlNTNmM2YzNDQ0MDIwMGI4NGZhYyIsImlhdCI6MTQ3OTM0NDE5MiwiZXhwIjoxNDc5NDMwNTkyfQ.hJKqmLY5Qjr_LzvTSq4rbFScU2WOzH1aBbmbN9IFKRs
  
    response body
    {
      "id": "582be53f3f34440200b84fac",
      "name": "Dawei",
      "username": "shachopin",
      "iat": 1479516215,
      "exp": 1479602615
    }
  */
  return api;

}