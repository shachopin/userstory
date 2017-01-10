angular.module('storyService', [])


.factory('Story', function($http) {


  var storyFactory = {};

  /*
    storyFactory.allStories = function() {
    return $http.get('/api/all_stories');
  } 
  */

  storyFactory.all = function() {
    return $http.get('/api/');
  }

  storyFactory.create = function(storyData) {
    return $http.post('/api/', storyData);
  }
  
  return storyFactory;
});