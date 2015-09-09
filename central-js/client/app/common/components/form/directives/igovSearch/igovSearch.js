angular.module('app').directive("igovSearch", ['CatalogService', 'statesRepository', 'RegionListFactory', 'LocalityListFactory', '$filter', 'eventListService',
 function(CatalogService, statesRepository, RegionListFactory, LocalityListFactory, $filter, eventListService) {
  var directive = {
    restrict: 'E',
    scope: {},
    templateUrl: 'app/common/components/form/directives/igovSearch/igovSearch.html',
    link: function($scope, $el, $attr) {
      var fullCatalog = {};
      $scope.data = {};
      $scope.regionList = new RegionListFactory();
      $scope.regionList.load(null, null);
      $scope.localityList = new LocalityListFactory();
      $scope.operator = -1;
      $scope.operators = [];
      $scope.selectedStatus = -1;
      $scope.bShowExtSearch = false;
      function getIDPlaces() {
        return ($scope.bShowExtSearch && $scope.data.region !== null) ?
          [$scope.data.region].concat($scope.data.city === null ? $scope.data.region.aCity : $scope.data.city)
            .map(function(e) { return e.sID_UA; }) : statesRepository.getIDPlaces();
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
      $scope.clear = function() {
        $scope.sSearch = '';
        $scope.search();
      }
      $scope.filterByExtSearch = function() {
        var filterCriteria = {};
        if ($scope.selectedStatus != -1) {
          filterCriteria.nStatus = $scope.selectedStatus;
        }
        if ($scope.operator != -1) {
          filterCriteria.sSubjectOperatorName = $scope.operator;
        }
        var ctlg = angular.copy(fullCatalog);
        angular.forEach(ctlg, function(item) {
          angular.forEach(item.aSubcategory, function(subItem) {
            subItem.aService = $filter('filter')(subItem.aService, filterCriteria);
          });
        });
        // check this code to return minimized catalog (without empty sections)
        updateCatalog(ctlg);
      };

      $scope.onExtSearchClick = function() {
        $scope.bShowExtSearch = !$scope.bShowExtSearch;
        if ($scope.operator != -1 || $scope.selectedStatus != -1 || $scope.data.region != null)
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
