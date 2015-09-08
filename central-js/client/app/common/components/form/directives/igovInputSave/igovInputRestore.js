angular.module('app').directive("igovInputRestore", ['userInputSaveService', function(userInputSaveService) {
  var directive = {
    restrict: 'A',
    link: function($scope, $el, $attr) {
      $scope[$attr.ngModel] = userInputSaveService.restore();
    }
  };
  return directive;
}])