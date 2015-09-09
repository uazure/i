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
    $scope.fullCatalog = data;
    $scope.catalog = data;
    // TODO: move other handlers here, like update counters, etc
    $scope.catalogCounts = CatalogService.getCatalogCounts(data);
  }, false);
  subscriptions.push(subscriberId);


  subscriberId = eventListService.subscribe('catalog:updatePending', function() {
    $scope.spinner = true;
    $scope.catalog = [];
  });
  subscriptions.push(subscriberId);
  $scope.$on('$destroy', function() {
    subscriptions.forEach(function(item) {
      eventListService.unsubscribe(item);
    });
  });

  $scope.filterByStatus = function(status) {
    $scope.selectedStatus = status;
    var ctlg = angular.copy($scope.fullCatalog);
    angular.forEach(ctlg, function(item) {
      angular.forEach(item.aSubcategory, function(subItem) {
        subItem.aService = $filter('filter')(subItem.aService, {nStatus: status});
      });
    });
    $scope.catalog = ctlg;
  };
}]);
