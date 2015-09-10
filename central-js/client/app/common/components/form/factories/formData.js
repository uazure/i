angular.module('app').factory('FormDataFactory', function (ParameterFactory, DatepickerFactory, FileFactory, ScanFactory, BankIDDocumentsFactory, BankIDAddressesFactory, CountryService, ActivitiService, $q) {
  var FormDataFactory = function () {
    this.processDefinitionId = null;
    this.factories = [DatepickerFactory, FileFactory, ParameterFactory];
    this.fields = {};
    this.params = {};
  };

  var initializeWithFactory = function (params, factories, property) {
    var result = factories.filter(function (factory) {
      return factory.prototype.isFit(property);
    });
    if (result.length > 0) {
      params[property.id] = result[0].prototype.createFactory();
      params[property.id].value = property.value;
    }
  };

  var fillInCountryInformation = function (params, property, ActivitiForm) {
    if (property.id === 'resident' || property.id === 'sCountry') {
      // todo: #584 для теста п.2 закомментировать эту строку. после теста - удалить
      //this.params[property.id].value = 'Україна';
      if (params[property.id].value) {
        // #584 п.3 автоподстановка зачения sID_Three в поле sID_Country
        angular.forEach(ActivitiForm.formProperties, function (prop) {
          if (prop.id === 'sID_Country') {
            var param = params[property.id];
            CountryService.getCountries().then(function (list) {
              angular.forEach(list, function (country) {
                if (country.sNameShort_UA == param.value)
                  params[prop.id].value = country.sID_Three;
              });
            })
          }
        });
      } else {
        // #584 п.2 автоподстановка значения в поле "гражданство" из поля bankIdsID_Country если в форме оно не установлено
        angular.forEach(ActivitiForm.formProperties, function (prop) {
          if (prop.id == 'bankIdsID_Country') {
            var param = params[property.id];
            //CountryService.getCountryBy_sID_Three(prop.value).then(function (response) {
            CountryService.getCountryBy_sID_Two(prop.value).then(function (response) {
              param.value = response.data.sNameShort_UA;
            });
          }
        });
      }
    }
  };

  FormDataFactory.prototype.initialize = function (ActivitiForm) {
    this.processDefinitionId = ActivitiForm.processDefinitionId;
    for (var key in ActivitiForm.formProperties) {
      var property = ActivitiForm.formProperties[key];

      initializeWithFactory(this.params, this.factories, property);
      fillInCountryInformation(this.params, ActivitiForm, property);
      //<activiti:formProperty id="bankIdsID_Country" name="Громадянство (Code)" type="invisible" default="UA"></activiti:formProperty>
      //<activiti:formProperty id="sID_Country" name="Country Code (Code)" type="invisible"></activiti:formProperty>
      //<activiti:formProperty id="sCountry" name="Громадянство" type="string"></activiti:formProperty>

    }
  };

  FormDataFactory.prototype.hasParam = function (param) {
    return this.params.hasOwnProperty(param);
  };

  FormDataFactory.prototype.setBankIDAccount = function (BankIDAccount) {
    var self = this;
    return angular.forEach(BankIDAccount.customer, function (oValue, sKey) {
      switch (sKey) {
        case 'scans':
          var sFieldName;
          angular.forEach(oValue, function (scan) {
            sFieldName = ScanFactory.prototype.getName(scan.type);
            if (self.hasParam(sFieldName)) {
              self.params[sFieldName] = Object.create(ScanFactory.prototype);
              self.params[sFieldName].setScan(scan);
            }
          });
          break;
        case 'documents':
          var aDocument = new BankIDDocumentsFactory();
          aDocument.initialize(oValue);

          angular.forEach(aDocument.list, function (document) {
            var sFieldName = null;
            switch (document.type) {
              case 'passport':
                sFieldName = 'bankIdPassport';
            }
            if (sFieldName === null) {
              return;
            }
            if (self.hasParam(sFieldName)) {
              self.fields[sFieldName] = true;
              self.params[sFieldName].value = aDocument.getPassport();
            }
          }, this);
          break;

        case 'addresses':
          var aAddress = new BankIDAddressesFactory();
          aAddress.initialize(oValue);

          angular.forEach(aAddress.list, function (document) {
            var sFieldName = null;
            switch (document.type) {
              case 'factual':
                sFieldName = 'bankIdAddressFactual';
                if (self.hasParam(sFieldName)) {
                  self.fields[sFieldName] = true;
                  self.params[sFieldName].value = aAddress.getAddress();
                }
                sFieldName = 'bankIdsID_Country';
                if (self.hasParam(sFieldName)) {
                  self.fields[sFieldName] = true;
                  self.params[sFieldName].value = aAddress.getCountyCode();
                }
                break;
            }
            if (sFieldName === null) {
              return;
            }

          }, this);
          break;

        default:
          var sFieldName = 'bankId' + sKey;

          if (self.hasParam(sFieldName)) {
            self.fields[sFieldName] = true;
            self.params[sFieldName].value = oValue;
          }
          break;
      }
    }, this);
  };

  FormDataFactory.prototype.uploadScansFromBankID = function (oServiceData) {
    var self = this;
    var paramsForUpload = [];
    for (var key in this.params) {
      var param = this.params[key];
      if (param instanceof ScanFactory) {
        paramsForUpload.push({key: key, scan: param.getScan()});
      }
    }

    var prepareForLoading = function(paramsForUpload){
      paramsForUpload.forEach(function (paramForUpload) {
        self.params[paramForUpload.key].loading();
      });
    };

    var backToFileAll = function (paramsForUpload) {
      paramsForUpload.forEach(function (paramForUpload) {
        backToFile(paramForUpload.key);
      });
    };

    var backToFile = function (key) {
      self.params[key] = new FileFactory();
    };

    var populateWithValue = function (key, fileID) {
      self.params[key].loaded(fileID);
    };

    prepareForLoading(paramsForUpload);
    ActivitiService.autoUploadScans(oServiceData, paramsForUpload)
      .then(function (uploadResults) {
        uploadResults.forEach(function (uploadResult) {
          if (!uploadResult.error) {
            populateWithValue(uploadResult.scanField.key, uploadResult.fileID);
          } else {
            backToFile(uploadResult.scanField.key);
          }
        });
      }).catch(function () {
        backToFileAll(paramsForUpload);
      });
  };

  FormDataFactory.prototype.setFile = function (name, file) {
    var parameter = this.params[name];
    parameter.removeAll();
    parameter.addFiles([file]);
  };

  FormDataFactory.prototype.setFiles = function (name, files) {
    var parameter = this.params[name];
    parameter.removeAll();
    parameter.addFiles(files);
  };

  FormDataFactory.prototype.addFile = function (name, file) {
    var parameter = this.params[name];
    parameter.addFiles([file]);
  };

  FormDataFactory.prototype.addFiles = function (name, files) {
    var parameter = this.params[name];
    parameter.addFiles(files);
  };

  FormDataFactory.prototype.getRequestObject = function () {
    var data = {
      processDefinitionId: this.processDefinitionId,
      params: {}
    };
    for (var key in this.params) {
      var param = this.params[key];
      data.params[key] = param.get();
    }
    return data;
  };

  return FormDataFactory;
});
