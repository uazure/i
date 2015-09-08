/* This simple filter service should be used to store user input for filtering
anything on the site and to share that input between different pages/states
*/
angular.module('app').service('userInputSaveService', [function () {
  var userInput = '';
  var userInputSaveService = {
    setFilter: function(filterText) {
      console.log('set filter', filterText);
      userInput = filterText;
    },
    resetFilter: function() {
      userInput = '';
    },
    getFilter: function() {
      return userInput;
    }
  };
  return userInputSaveService;
}]);
