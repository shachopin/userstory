angular.module('MyApp', ['appRoutes', 'authService', 'mainCtrl', 'userCtrl', 'userService'])
.config(function($httpProvider) {

  $httpProvider.interceptors.push('AuthInterceptor'); 
  //without this, all the /me api would fail due to no token is sent in the header

});