angular.module('app').controller('ServiceController', ['$scope', '$rootScope', '$timeout', 'CatalogService', 'AdminService', '$filter', 'statesRepository', 'RegionListFactory', 'LocalityListFactory', 'eventListService',
    function($scope, $rootScope, $timeout, CatalogService, AdminService, $filter, statesRepository, RegionListFactory, LocalityListFactory, eventListService) {
  
  $scope.catalog = [];
  $scope.catalogCounts = {0: 0, 1: 0, 2: 0};
  $scope.limit = 4;
  $scope.bAdmin = AdminService.isAdmin();
  $scope.recalcCounts = true;
  $scope.spinner = true;

  var subscriptions = [];
  var subscriberId = eventListService.subscribe('catalog:update', function(data) {
    $scope.spinner = false;
    $scope.catalog = data;
    // TODO: move other handlers here, like update counters, etc
  }, false);
  subscriptions.push(subscriberId)
  

  subscriberId = eventListService.subscribe('catalog:updatePending', function() {
    $scope.spinner = true;
  });
  subscriptions.push(subscriberId);
  $scope.$on('$destroy', function() {
    subscriptions.forEach(function(item) {
      eventListService.unsubscribe(item);
    });
  })

//TODO: move this code to eventList event handler
  $scope.$watch('catalog', function(newValue) {
    console.log('service.controller catalog changed');
    $timeout(function() {
      if ($scope.bShowExtSearch == false) {
        if ($scope.recalcCounts == true) {
          $scope.catalogCounts = {0: 0, 1: 0, 2: 0};
        }

        $scope.operators = [];
      }

      angular.forEach(newValue, function(item) {
        angular.forEach(item.aSubcategory, function(subItem) {
          angular.forEach(subItem.aService, function(aServiceItem) {
            if ($scope.bShowExtSearch == false) {
              if ($scope.recalcCounts == true) {
                $scope.catalogCounts[aServiceItem.nStatus]++;
              }

              var found = false;
              for (var i = 0; i < $scope.operators.length; i++) {
                if ($scope.operators[i].sSubjectOperatorName === aServiceItem.sSubjectOperatorName) {
                  found = true;
                  break;
                }
              }
              if (!found) {
                $scope.operators.push(aServiceItem);
              }
            }
          });
        });
        if (item.aSubcategory) {
          item.aSubcategory = jQuery.grep(item.aSubcategory, function(sc) {
            return sc.aService.length > 0;
          });

          if (item.aSubcategory.length == 0) {
            item.sName = "";
          }
        }
      });
      $scope.recalcCounts = true;
    });
  });
}]);
