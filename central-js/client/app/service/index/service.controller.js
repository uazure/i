angular.module('app').controller('ServiceController', ['$scope', '$rootScope', '$timeout', 'CatalogService', 'AdminService', '$filter', 'statesRepository', 'RegionListFactory', 'LocalityListFactory', 'eventListService',
    function($scope, $rootScope, $timeout, CatalogService, AdminService, $filter, statesRepository, RegionListFactory, LocalityListFactory, eventListService) {
  
  $scope.catalog = [];
  eventListService.subscribe('catalog:update', function(data) {
    $scope.catalog = data;
    if ($scope.catalog && $scope.catalog.length > 0) {
      $scope.spinner = false;  
    }
  }, false);

  $scope.data = {region: null, city: null};

  $scope.catalogCounts = {0: 0, 1: 0, 2: 0};
  $scope.limit = 4;
  $scope.bAdmin = AdminService.isAdmin();
  $scope.recalcCounts = true;
  $scope.operators = [];
  
  
  $scope.spinner = true;

  



  $scope.filterByStatus = function(status) {
    $scope.selectedStatus = status;
    var ctlg = copyCatalog();
    angular.forEach(ctlg, function(item) {
      angular.forEach(item.aSubcategory, function(subItem) {
        subItem.aService = $filter('filter')(subItem.aService, {nStatus: status});
      });
    });

    $scope.recalcCounts = false;
    $scope.catalog = ctlg;
  };

  

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

  $scope.$watch('selectedStatus', function(newValue, oldValue) {
    if ((newValue == 2 || oldValue == 2) && $scope.data.region !== null)
      $scope.search();
  });

}]);
