angular.module('app').config(function ($stateProvider, statesRepositoryProvider) {
  statesRepositoryProvider.init(window.location.host);
  $stateProvider
    .state('index', statesRepositoryProvider.index())
    .state('index.service', {
          abstract: true,
          url: 'service/{id:int}',
          resolve: {
            service: function ($stateParams, ServiceService) {
              console.log('calling get service');
              return ServiceService.get($stateParams.id);
            }
          },
          views: {
            'main@': {
              templateUrl: 'app/service/index.html',
              controller: 'ServiceFormController'
            }
          }
        }
    )
    .state('index.subcategory', {
      url: 'subcategory/:catID/:scatID',
      resolve: {
        catalog: function (CatalogService) {
          return CatalogService.getServices();
        }
      },
      views: {
        'main@': {
          templateUrl: 'app/service/subcategory/subcategory.html',
          controller: 'SubcategoryController'
        }
      }
    })
    .state('index.service.general', {
      url: '/general',
      views: {
        'content': {
          controller: 'ServiceGeneralController'
        }
      }
    })
    .state('index.service.general.city', {
      url: '/city',
      resolve: {
        regions: function ($stateParams, PlacesService, service) {
          console.log('regions resolve called');
          return PlacesService.getRegions().then(function (response) {
            var regions = response.data;
            var aServiceData = service.aServiceData;

            angular.forEach(regions, function (region) {
              var color = 'red';
              angular.forEach(aServiceData, function (oServiceData) {
                if (oServiceData.hasOwnProperty('nID_City') == false) {
                  return;
                }
                var oCity = oServiceData.nID_City;
                var oRegion = oCity.nID_Region;
                if (oRegion.nID == region.nID) {
                  color = 'green';
                }
              });
              region.color = color;
            });

            return regions;
          });
        }
      },
      views: {
        'content@index.service': {
          templateUrl: 'app/service/city/content.html',
          controller: 'ServiceCityController'
        }
      }
    })
    .state('index.service.general.city.error', {
      url: '/absent',
      views: {
        'status': {
          templateUrl: 'app/service/city/absent.html',
          controller: 'ServiceCityAbsentController'
        }
      }
    })
    .state('index.service.instruction', {
      url: '/instruction',
      views: {
        'content': {
          templateUrl: 'app/service/instruction.html',
          controller: 'ServiceInstructionController'
        }
      }
    })
    .state('index.service.legislation', {
      url: '/legislation',
      views: {
        'content': {
          templateUrl: 'app/service/legislation.html',
          controller: 'ServiceLegislationController'
        }
      }
    })
    .state('index.service.questions', {
      url: '/questions',
      views: {
        'content': {
          templateUrl: 'app/service/questions.html',
          controller: 'ServiceQuestionsController'
        }
      }
    })
    .state('index.service.discussion', {
      url: '/discussion',
      views: {
        'content': {
          templateUrl: 'app/service/discussion.html',
          controller: 'ServiceDiscussionController'
        }
      }
    }).state('index.service.general.city.built-in', {
      url: '/built-in',
      views: {
        'city-content': {
          templateUrl: 'app/service/city/built-in/index.html',
          controller: 'ServiceBuiltInController'
        }
      }
    })
    .state('index.service.general.city.built-in.bankid', {
      url: '/built-in/region/{region:int}/city/{city:int}/?code',
      parent: 'index.service.general.city',
      data: {
        region: null,
        city: null
      },
      resolve: {
        region: function ($state, $stateParams, PlacesService) {
          return PlacesService.getRegion($stateParams.region).then(function (response) {
            var currentState = $state.get('index.service.general.city.built-in.bankid');
            currentState.data.region = response.data;
            return response.data;
          });
        },
        city: function ($state, $stateParams, PlacesService) {
          return PlacesService.getCity($stateParams.region, $stateParams.city).then(function (response) {
            var currentState = $state.get('index.service.general.city.built-in.bankid');
            currentState.data.city = response.data;
            return response.data;
          });
        },
        oService: function ($stateParams, service) {
          return service;
        },
        oServiceData: function ($stateParams, service) {
          var aServiceData = service.aServiceData;
          var oServiceData = null;
		  if($stateParams.city > 0) {
			  angular.forEach(aServiceData, function (value, key) {
				if (value.nID_City && value.nID_City.nID === $stateParams.city) {
				  oServiceData = value;
				}
			  });
		  } else {
			  angular.forEach(aServiceData, function (value, key) {
				if (value.nID_Region && value.nID_Region.nID === $stateParams.region) {
				  oServiceData = value;
				}
			  });
		  }
          return oServiceData;
        },
        BankIDLogin: function ($q, $state, $location, $stateParams, BankIDService) {
          return BankIDService.isLoggedIn().then(function () {
            return {loggedIn: true};
          }).catch(function () {
            return $q.reject(null);
          });
        },
        BankIDAccount: function (BankIDService) {
          return BankIDService.account();
        },
        processDefinitions: function (ServiceService, oServiceData) {
          return ServiceService.getProcessDefinitions(oServiceData, true);
        },
        processDefinitionId: function (oServiceData, processDefinitions) {
          var sProcessDefinitionKeyWithVersion = oServiceData.oData.oParams.processDefinitionId;
          var sProcessDefinitionKey = sProcessDefinitionKeyWithVersion.split(':')[0];

          var sProcessDefinitionName = "тест";

          angular.forEach(processDefinitions.data, function (value, key) {
            if (value.key == sProcessDefinitionKey) {
              sProcessDefinitionKeyWithVersion = value.id;
              sProcessDefinitionName = "(" + value.name + ")";
            }
          });

          return {
            sProcessDefinitionKeyWithVersion: sProcessDefinitionKeyWithVersion,
            sProcessDefinitionName: sProcessDefinitionName
          };
        },
        ActivitiForm: function (ActivitiService, oServiceData, processDefinitionId) {
          return ActivitiService.getForm(oServiceData, processDefinitionId);
        },
        service: function ($stateParams, ServiceService) {
          return ServiceService.get($stateParams.id);
        }
      },
      views: {
        'city-content': {
          templateUrl: 'app/service/city/built-in/bankid.html',
          controller: 'ServiceBuiltInBankIDController'
        }
      }
    })
    .state('index.service.general.city.built-in.bankid.submitted', {
      url: null,
      data: {id: null},
      onExit: function ($state) {
        var state = $state.get('index.service.general.city.built-in.bankid.submitted');
        state.data = {id: null};
      },
      views: {
        'city-content@index.service.general.city': {
          templateUrl: 'app/service/city/built-in/bankid.submitted.html',
          controller: function ($state, $scope, $sce) {
            $scope.state = $state.get('index.service.general.city.built-in.bankid.submitted');
            $scope.getHtml = function (html) {
              return $sce.trustAsHtml(html);
            };
          }
        }
      }
    })
    .state('index.service.statistics', {
      url: '/statistics',
      views: {
        'content': {
          templateUrl: 'app/service/statistics.html',
          controller: 'ServiceStatisticsController'
        }
      }
    });
});
