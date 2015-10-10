'use strict';
angular.module('dashboardJsApp').directive('queueDataField', ['$filter', function($filter) {
  return {
    restrict: 'E',
    link: function($scope) {
      console.log('queueDataField value', $scope.item.value);
      if ($scope.item.type.indexOf('queueData') < 0) {
        return;
      }
      var value = JSON.parse($scope.item.value);
      $scope.item.value = $filter('date')(new Date(value.sDate), 'yyyy-MM-dd HH:mm');
      $scope.item.nID_FlowSlotTicket = value.nID_FlowSlotTicket;
    },
    templateUrl: 'app/tasks/form-fields/queueDataField.html'
  };
}]);