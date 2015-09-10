angular.module('app').factory('DatepickerFactory', function($filter) {
  var datepicker = function() {
    this.value = null;
    this.format = 'dd/MM/yyyy';
    this.opened = false;
    this.options = {};
  };

  datepicker.prototype.today = function() {
    this.value = new Date();
  };

  datepicker.prototype.clear = function() {
    this.value = null;
  };

  datepicker.prototype.open = function($event) {
    $event.preventDefault();
    $event.stopPropagation();

    this.opened = true;
  };

  datepicker.prototype.get = function() {
    return $filter('date')(this.value, this.format);
  };

  datepicker.prototype.isFit = function(property){
    return property.type === 'date';
  };

  datepicker.prototype.createFactory = function(){
    return new datepicker();
  };

  return datepicker;
});
