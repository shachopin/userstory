angular.module('MyApp', ['appRoutes', 'authService', 'mainCtrl', 'userCtrl', 'userService', 'storyCtrl', 'storyService']) //for module dependecny injection, you stll need []
.config(function($httpProvider) {

  $httpProvider.interceptors.push('AuthInterceptor'); 
  //without this, all the /me api would fail due to no token is sent in the header x-access-token key
  //notice your chrome version on your MacOS doesn't work. it will send some default token value, causing /me api always failed

});