angular.module('app').controller('SubcategoryController', ['$scope', '$stateParams', '$filter', '$location', '$anchorScroll', 'eventListService', 'catalog',
    function($scope, $stateParams, $filter, $location, $anchorScroll, eventListService, catalog) {
  var category = $filter('filter')(catalog, {nID: $stateParams.catID})[0];
  var subcategory = $filter('filter')(category.aSubcategory, {nID: $stateParams.scatID})[0];
  $scope.categoryName = category.sName;
  $scope.subcategoryName = subcategory.sName;
  $scope.spinner = true;
  var subscribers = [];
  var subscriberId = eventListService.subscribe('catalog:updatePending', function() {
    console.log("spinner true");
    $scope.spinner = true;
    $scope.catalog = [];
    $scope.category = null;
    $scope.subcategory = null;
  });
  subscribers.push(subscriberId);
  subscriberId = eventListService.subscribe('catalog:update', function(data) {
    console.log('catalog updated, will update items');
    $scope.spinner = false;
    $scope.catalog = data;
    if ($scope.catalog.length > 0) {
      $scope.category = $filter('filter')($scope.catalog, {nID: $stateParams.catID})[0];  
    } else {
      $scope.category = null;
    }
    if ($scope.category) {
      $scope.subcategory = $filter('filter')($scope.category.aSubcategory, {nID: $stateParams.scatID})[0];  
    } else {
      $scope.subcategory = null;
    }
  }, false);
  subscribers.push(subscriberId);
  $scope.category = null;
  $scope.subcategory = null;
  $scope.$on('$destroy', function() {
    subscribers.forEach(function(subscriberId) {
      eventListService.unsubscribe(subscriberId);
    });
  })

  // Scroll to the top of the section - issues/589
  // After Angular upgrade (current version which is used is 1.3.15),
  // it can be used with parameter: $anchorScroll('top') (which will also keep location hash intact)
  // https://github.com/angular/angular.js/pull/9596/files
  $anchorScroll();

}]);