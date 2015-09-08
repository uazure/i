angular.module('app').service('CatalogService', function ($http) {
  var servicesCache = {};
  this.getModeSpecificServices = function (asIDPlacesUA, sFind) {
    console.log('getModeSpecificServices asIDPlaceUA', asIDPlaceUA);
    
    var asIDPlaceUA = asIDPlacesUA && asIDPlacesUA.length > 0 ? asIDPlacesUA.reduce(function (ids, current, index) {
      return ids + ',' + current;
    }) : null;

    var data = {
      asIDPlaceUA: asIDPlaceUA,
      sFind: sFind || null
    };

    console.log('getModeSpecificServices data', data);
    return $http.get('./api/services', {
      params: data,
      data: data
    }).then(function (response) {
      servicesCache = response.data;
      //console.log('servicesCache', servicesCache);
      return response.data;
    });
  };

  this.getServices = function (sFind) {
    console.log('getServices');
    var data = {
      sFind: sFind || null
    };
    return $http.get('./api/services', {
      params: data,
      data: data
    }).then(function (response) {
      servicesCache = response.data;
      //console.log('servicesCache', servicesCache);
      return response.data;
    });
  };
});
