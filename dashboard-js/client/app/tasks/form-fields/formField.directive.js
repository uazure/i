'use strict';
angular.module('dashboardJsApp').directive('formField', function() {
  return {
    restrict: 'E',
    templateUrl: 'app/tasks/form-fields/formField.html',
    link: function($scope) {
      console.log('formField $scope item', $scope.item);
      // parse $scope.item data and prepare a code for it's visualization
      var item = $scope.item;
      $scope.isRequired = item.writable && (item.required || isCommentAfterReject(item));
      $scope.isFormPropertyDisabled = isFormPropertyDisabled(item);
      $scope.sFieldLabel = sFieldLabel(item.name);

      



      function isCommentAfterReject(item) {
        if (item.id != "comment") {
          return false;
        }

        var decision = $.grep($scope.taskForm, function (e) { return e.id == "decide"; });
        if (decision.length == 0) {
          // no decision
        } else if (decision.length == 1) {
          if (decision[0].value == "reject") {
            return true;
          }
        }
        return false;
      };
      function sFieldLabel (sField) {
        var s = '';
        if (sField !== null) {
          var a = sField.split(';');
          s = a[0].trim();
        }
        return s;
      };

      function isFormPropertyDisabled(item) {
        // FIXME: check this logic
        if ($scope.selectedTask && $scope.selectedTask.assignee === null) {
          return true;
        } else if ($scope.selectedTask && $scope.selectedTask.assignee !== null && !item) {
          return true;
        } else if ($scope.sSelectedTask === 'finished') {
          return true;
        }
        return false;
      };

      $scope.sDate_FieldQueueData = function (sValue) {
      var nAt = sValue.indexOf("sDate");
      var nTo = sValue.indexOf("}");
      var s = sValue.substring(nAt + 5 + 1 + 1, nTo - 1 - 6);
      var sDate = "Дата назначена!";
      try {
        sDate = s;
      } catch (_) {
        sDate = "Дата назначена!";
      }
      return sDate;
      };
    }
  };
});