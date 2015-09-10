angular.module('app').directive("igovSearch", ['CatalogService', 'statesRepository', 'RegionListFactory', 'LocalityListFactory', '$filter', 'eventListService',
 function(CatalogService, statesRepository, RegionListFactory, LocalityListFactory, $filter, eventListService) {
  var directive = {
    restrict: 'E',
    scope: {},
    templateUrl: 'app/common/components/form/directives/igovSearch/igovSearch.html',
    link: function($scope, $el, $attr) {
      var fullCatalog = [];
      $scope.data = {
        region: null,
        city: null
      };
      $scope.regionList = new RegionListFactory();
      $scope.regionList.load(null, null);
      $scope.localityList = new LocalityListFactory();
      $scope.operator = -1;
      $scope.operators = [];
      $scope.selectedStatus = -1;
      $scope.bShowExtSearch = false;
      function getIDPlaces() {
        var result;
        if ($scope.bShowExtSearch && $scope.data.region !== null) {
          var places = [$scope.data.region].concat($scope.data.city === null ? $scope.data.region.aCity : $scope.data.city)
          result = places.map(function(e) { return e.sID_UA; });
        } else {
          result = statesRepository.getIDPlaces();
        }
        return result;
      }
      function updateCatalog(ctlg) {
        $scope.catalog = ctlg;
        if ($scope.operator == -1) {
          $scope.operators = CatalogService.getOperators(ctlg);
        }
        eventListService.publish('catalog:update', ctlg);
      }
      $scope.search = function() {
        $scope.spinner = true;
        eventListService.publish('catalog:updatePending');
        $scope.catalog = [];
        return CatalogService.getModeSpecificServices(getIDPlaces(), $scope.sSearch).then(function (result) {
          fullCatalog = result;
          if ($scope.bShowExtSearch) {
            $scope.filterByExtSearch();
          } else {
            updateCatalog(angular.copy(fullCatalog));
          }
        });
      };
      // method to filter full catalog depending on current extended search parameters
      // choosen by user
      $scope.filterByExtSearch = function() {
        var filterCriteria = {};
        if ($scope.selectedStatus != -1) {
          filterCriteria.nStatus = $scope.selectedStatus;
        }
        if ($scope.operator != -1) {
          filterCriteria.sSubjectOperatorName = $scope.operator;
        }
        // create a copy of current fullCatalog
        var ctlg = angular.copy(fullCatalog);
        angular.forEach(ctlg, function(category) {
          angular.forEach(category.aSubcategory, function(subCategory) {
            // leave services that match filterCriteria
            subCategory.aService = $filter('filter')(subCategory.aService, filterCriteria);
          });
          // leave subcategories that are not empty
          category.aSubcategory = $filter('filter')(category.aSubcategory, function(subCategory) {
            if (subCategory.aService.length > 0) {
              return true;
            }
          });
        });
        // leave categories that are not empty
        ctlg = $filter('filter')(ctlg, function(category) {
          if (category.aSubcategory.length >0 ) {
            return true;
          }
        });
        updateCatalog(ctlg);
      };

      $scope.onExtSearchClick = function() {
        $scope.bShowExtSearch = !$scope.bShowExtSearch;
        if ($scope.operator != -1 || $scope.selectedStatus != -1 || $scope.data.region != null) {
            $scope.search();
        }
      };
      $scope.clear = function() {
        $scope.sSearch = '';
        $scope.search();
      };
      $scope.loadRegionList = function(search) {
        return $scope.regionList.load(null, search);
      };
      $scope.onSelectRegionList = function($item) {
        $scope.data.region = $item;
        $scope.regionList.select($item);
        $scope.data.city = null;
        $scope.localityList.reset();
        $scope.search();
        $scope.localityList.load(null, $item.nID, null).then(function(cities) {
          $scope.localityList.typeahead.defaultList = cities;
        });
      };

      $scope.loadLocalityList = function(search) {
        return $scope.localityList.load(null, $scope.data.region.nID, search);
      };

      $scope.onSelectLocalityList = function($item, $model, $label) {
        $scope.data.city = $item;
        $scope.localityList.select($item, $model, $label);
        $scope.search();
      };
      $scope.search();
    }

  };
  return directive;
}])
