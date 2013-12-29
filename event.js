'use strict';
angular.module('ui.event', []).directive('uiEvent', [
  '$parse',
  function ($parse) {
    return function ($scope, elm, attrs) {
      var events = $scope.$eval(attrs.uiEvent);
      angular.forEach(events, function (uiEvent, eventName) {
        var fn = $parse(uiEvent);
        elm.bind(eventName, function (evt) {
          var params = Array.prototype.slice.call(arguments);
          params = params.splice(1);
          fn($scope, {
            $event: evt,
            $params: params
          });
          if (!$scope.$$phase) {
            $scope.$apply();
          }
        });
      });
    };
  }
]);