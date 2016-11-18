angular.module('MyApp', ['appRoutes', 'authService', 'mainCtrl', 'userCtrl', 'userService'])
.config(function($httpProvider) {

  $httpProvider.interceptors.push('AuthInterceptor');

});