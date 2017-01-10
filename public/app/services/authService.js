angular.module('authService', [])

.factory('Auth', function($http, $q, AuthToken) {
 //no need to use Dependency Injection or []

  var authFactory = {};


  authFactory.login = function(username, password) {

    return $http.post('/api/login', {//when testing you pass the form data like in request body, here you are passing a json string in request body, here you are putting json object, will be converted to json string
      username: username,
      password: password
    })  //return a promise object. sucess is one of its condition
    .success(function(data) {
      AuthToken.setToken(data.token);
      return data;
    })
  }

  authFactory.logout = function() {
    AuthToken.setToken();
  }

  authFactory.isLoggedIn = function() {
    if(AuthToken.getToken())
      return true;
    else
      return false;
  }

  authFactory.getUser = function() {
    if(AuthToken.getToken())
      return $http.get('/api/me'); //this is a promise object got returned, sucess() and then() can be used on all promise object, then() is like for any case, as long as there is return
    else
      return $q.reject({ message: "User has no token"});

  }


  return authFactory;

})


.factory('AuthToken', function($window) {

  var authTokenFactory = {};

  authTokenFactory.getToken = function() {
    return $window.localStorage.getItem('token');
  }

  authTokenFactory.setToken = function(token) {

    if(token)
      $window.localStorage.setItem('token', token);
    else
      $window.localStorage.removeItem('token');

  }

  return authTokenFactory;

})

.factory('AuthInterceptor', function($q, $location, AuthToken) {

  var interceptorFactory = {};


  interceptorFactory.request = function(config) {

    var token = AuthToken.getToken();

    if(token) {

      config.headers['x-access-token'] = token; //not all http call will have this request header. /me api will have it for sure

    }

    return config;

  };

  interceptorFactory.responseError = function(response) {
    if (response.status == 403) {
      $location.path('/login');
      console.log("redirecting to /login because response status is 403");
    }

    return $q.reject(response);
  }

  


  return interceptorFactory;
});
