'use strict';
angular.module('ui.jq', []).value('uiJqConfig', {}).directive('uiJq', [
  'uiJqConfig',
  '$timeout',
  function uiJqInjectingFunction(uiJqConfig, $timeout) {
    return {
      restrict: 'A',
      compile: function uiJqCompilingFunction(tElm, tAttrs) {
        if (!angular.isFunction(tElm[tAttrs.uiJq])) {
          throw new Error('ui-jq: The "' + tAttrs.uiJq + '" function does not exist');
        }
        var options = uiJqConfig && uiJqConfig[tAttrs.uiJq];
        return function uiJqLinkingFunction(scope, elm, attrs) {
          var linkOptions = [];
          if (attrs.uiOptions) {
            linkOptions = scope.$eval('[' + attrs.uiOptions + ']');
            if (angular.isObject(options) && angular.isObject(linkOptions[0])) {
              linkOptions[0] = angular.extend({}, options, linkOptions[0]);
            }
          } else if (options) {
            linkOptions = [options];
          }
          if (attrs.ngModel && elm.is('select,input,textarea')) {
            elm.bind('change', function () {
              elm.trigger('input');
            });
          }
          function callPlugin() {
            $timeout(function () {
              elm[attrs.uiJq].apply(elm, linkOptions);
            }, 0, false);
          }
          if (attrs.uiRefresh) {
            scope.$watch(attrs.uiRefresh, function () {
              callPlugin();
            });
          }
          callPlugin();
        };
      }
    };
  }
]);