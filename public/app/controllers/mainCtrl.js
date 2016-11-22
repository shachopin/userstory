angular.module('mainCtrl', [])


.controller('MainController', function($rootScope, $location, Auth) {

  var vm = this;


  vm.loggedIn = Auth.isLoggedIn();

  $rootScope.$on('$routeChangeStart', function() { //this means only when you do one of the routes in app.routes.js, this method will run
  //say you type dawei-userstory.herokuapp.com/blahblah  index.html will show, but the me api won't run, hence just say hello without username
    vm.loggedIn = Auth.isLoggedIn();

    Auth.getUser()
      .then(function(data) {
        vm.user = data.data;
      });
  });


  vm.doLogin = function() {

    vm.processing = true;

    vm.error = '';

    Auth.login(vm.loginData.username, vm.loginData.password) //can be binded by ng-model directly, like this ng-model="login.loginData.username"
      .success(function(data) { //this data is the returned data from the success submethod of the promise object which got returned by Auth.login()
        vm.processing = false;

        Auth.getUser() //then() can be used for any case, dones't matter success or not. 
          .then(function(data) {
            vm.user = data.data; //notice here using data.data, why different from success?
          });

        if(data.success)
          $location.path('/');
        else
          vm.error = data.message;

      });
  }


  vm.doLogout = function() {
    Auth.logout();
    $location.path('/logout');
  }


});