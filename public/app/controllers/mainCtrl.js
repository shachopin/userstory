angular.module('mainCtrl', [])


.controller('MainController', function($rootScope, $location, Auth) {

  var vm = this;


  vm.loggedIn = Auth.isLoggedIn();

  $rootScope.$on('$routeChangeStart', function() { //this means only when you do one of the routes in app.routes.js, this method will run
  //say you type dawei-userstory.herokuapp.com/blahblah  index.html will show, but this method here won't run because it's not one of the routesProvides routes, so blank content, top nabar will show, but the me api won't run, hence just say hello without username
  //say your token is valid, running any of the routeProvers will call /me and see hello your username correctly
    vm.loggedIn = Auth.isLoggedIn();

    Auth.getUser()
      .then(function(data) {
        vm.user = data.data;//data.data property is available when you do 
        //return $http.get('/api/me'); and it's sucessful. If it's 
        //unsuccessful, data.data is undefnd. And will redirect to login route 
        //due to the AuthInceptor response. Also when the token is unavalable, 
        //the $q.reject will run and then() block won't be entered
      });
  });


  vm.doLogin = function() {

    vm.processing = true;

    vm.error = '';

    Auth.login(vm.loginData.username, vm.loginData.password) //can be binded by ng-model directly, like this ng-model="login.loginData.username"
      .success(function(data) { //this data is the returned data from the success submethod of the promise object which got returned by Auth.login()
        //this data is the returned data from the success submethod of the promise object 
        //which got returned by Auth.login()  
        //login api will always be successful because status code in response is always 200

        vm.processing = false;

        Auth.getUser() //then() can be used for any case, dones't matter success or not. 
          .then(function(data) {
            vm.user = data.data; //notice here using data.data, why different from success?
          });

        if(data.success)
           /* here is the api response
           res.json({
            success: true,
            message: "Successfully login!",
            token: token
          });
        */

          $location.path('/');
        else
          /*
            res.send({message: "Invalid Password"}); or res.send({message: "User doesn't exist"});
        */

          vm.error = data.message;

      });
  }


  vm.doLogout = function() {
    Auth.logout();
    $location.path('/logout');
  }


});