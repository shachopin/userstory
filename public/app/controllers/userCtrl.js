angular.module('userCtrl', ['userService'])


.controller('UserController', function(User) {


  var vm = this;

  
  User.all()
    .success(function(data) {
      vm.users = data;
    })


})


.controller('UserCreateController', function(User, $location, $window) {

  var vm = this;

  vm.signupUser = function() {
    vm.message = '';

    User.create(vm.userData)//userData will be an object {name: "shachopin4", username: "shachopin", password: "davidnight"}
      .then(function(response) {
        vm.userData = {};
        vm.message = response.data.message; //because in .then, you should use reponse.data.message, diffent from .success() submethod

        $window.localStorage.setItem('token', response.data.token);
        $location.path('/');
      })
  }

})