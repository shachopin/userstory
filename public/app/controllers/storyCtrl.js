angular.module('storyCtrl', [])


  .controller('StoryController', function(Story) {


    var vm = this;

    Story.all()
      .success(function(data) {
        vm.stories = data;
      });


    vm.createStory = function() {

      vm.processing = true;

   
      vm.message = '';
      Story.create(vm.storyData)
        .success(function(data) {
          vm.processing = false;
          vm.stories.unshift(vm.storyData); 
          //Use unshift, to add the in-memory story (which by the way is already saved to database) on the top of the stack
          //push method will push it to the bottom. Refresh it from database will see again it's reverse chronological
          
          //clear up the form
          vm.storyData = {};
          vm.message = data.message;
          
          
        });

    };

    

});
