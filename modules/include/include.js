'use strict';

// modeled after: angular-1.0.7/src/ng/directive/ngInclude.js
angular.module('ui.include',[])
.directive('uiInclude', ['$http', '$templateCache', '$anchorScroll', '$compile',
                 function($http,   $templateCache,   $anchorScroll,   $compile) {
  return {
    restrict: 'ECA',
    terminal: true,
    compile: function(element, attr) {
      var srcExp = attr.uiInclude || attr.src,
          fragExp = attr.fragment || '',
          onloadExp = attr.onload || '',
          autoScrollExp = attr.autoscroll;

      return function(scope, element) {
        var changeCounter = 0,
            childScope;

        var clearContent = function() {
          if (childScope) {
            childScope.$destroy();
            childScope = null;
          }

          element.html('');
        };

        function ngIncludeWatchAction() {
          var thisChangeId = ++changeCounter;
          var src = scope.$eval(srcExp);
          var fragment = scope.$eval(fragExp);

          if (src) {
            $http.get(src, {cache: $templateCache}).success(function(response) {
              if (thisChangeId !== changeCounter) { return; }

              if (childScope) { childScope.$destroy(); }
              childScope = scope.$new();

              var contents;
              if (fragment) {
                contents = angular.element('<div/>').html(response).find(fragment);
              }
              else {
                contents = angular.element('<div/>').html(response).contents();
              }
              element.html(contents);
              $compile(contents)(childScope);

              if (angular.isDefined(autoScrollExp) && (!autoScrollExp || scope.$eval(autoScrollExp))) {
                $anchorScroll();
              }

              childScope.$emit('$includeContentLoaded');
              scope.$eval(onloadExp);
            }).error(function() {
              if (thisChangeId === changeCounter) { clearContent(); }
            });
          } else { clearContent(); }
        }

        scope.$watch(fragExp, ngIncludeWatchAction);
        scope.$watch(srcExp, ngIncludeWatchAction);
      };
    }
  };
}]);
