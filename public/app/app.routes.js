angular.module('appRoutes', ['ngRoute'])

/*
$locationProvider
$http
$httpProvier
all in OOB, no including additional angular module

$routeProvier in ngRoute angular module
need to include
*/
.config(function($routeProvider, $locationProvider) {
  
  $routeProvider

    .when('/', {
      templateUrl: 'app/views/pages/home.html' //has to be relative to index.html
    })
    .when('/login', {
      templateUrl: 'app/views/pages/login.html'
    }).
    .when('/signup', {
      templateUrl: 'app/views/pages/signup.html'
    });

  $locationProvider.html5Mode(true);
  /* 
  without the above line, if you type localhost:3000/ it automatically changes to localhost:3000/#/ and show the home page
  if you type in your browser localhost:3000/#/login, works fine
  however, when you are on localhost:3000/#/ and click on the a tag href="/login", it becomes
  localhost:3000/login#/  this points to no page
  
  Now, after 
  1. setting the  $locationProvider.html5Mode(true);
  2. and also add the base tag of index.html
  <head>
  <base href="/">
  ...
  </head>

  Now if you type localhost:3000, the URL no change and show home page
  click on the a tag href="/login"
  it will become localhost:3000/login and works fine, showing the login html page

  Also need to include the script tag to the 3rd party angluar module 
  - https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.3.13/angular-route.min.js
  */
    


});