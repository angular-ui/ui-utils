'use strict';
angular.module('ui.route', []).directive('uiRoute', [
  '$location',
  '$parse',
  function ($location, $parse) {
    return {
      restrict: 'AC',
      scope: true,
      compile: function (tElement, tAttrs) {
        var useProperty;
        if (tAttrs.uiRoute) {
          useProperty = 'uiRoute';
        } else if (tAttrs.ngHref) {
          useProperty = 'ngHref';
        } else if (tAttrs.href) {
          useProperty = 'href';
        } else {
          throw new Error('uiRoute missing a route or href property on ' + tElement[0]);
        }
        return function ($scope, elm, attrs) {
          var modelSetter = $parse(attrs.ngModel || attrs.routeModel || '$uiRoute').assign;
          var watcher = angular.noop;
          function staticWatcher(newVal) {
            var hash = newVal.indexOf('#');
            if (hash > -1) {
              newVal = newVal.substr(hash + 1);
            }
            watcher = function watchHref() {
              modelSetter($scope, $location.path().indexOf(newVal) > -1);
            };
            watcher();
          }
          function regexWatcher(newVal) {
            var hash = newVal.indexOf('#');
            if (hash > -1) {
              newVal = newVal.substr(hash + 1);
            }
            watcher = function watchRegex() {
              var regexp = new RegExp('^' + newVal + '$', ['i']);
              modelSetter($scope, regexp.test($location.path()));
            };
            watcher();
          }
          switch (useProperty) {
          case 'uiRoute':
            if (attrs.uiRoute) {
              regexWatcher(attrs.uiRoute);
            } else {
              attrs.$observe('uiRoute', regexWatcher);
            }
            break;
          case 'ngHref':
            if (attrs.ngHref) {
              staticWatcher(attrs.ngHref);
            } else {
              attrs.$observe('ngHref', staticWatcher);
            }
            break;
          case 'href':
            staticWatcher(attrs.href);
          }
          $scope.$on('$routeChangeSuccess', function () {
            watcher();
          });
          $scope.$on('$stateChangeSuccess', function () {
            watcher();
          });
        };
      }
    };
  }
]);