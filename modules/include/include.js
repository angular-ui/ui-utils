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
            childScope,
            cached_src;

        var clearContent = function() {
          if (childScope) {
            childScope.$destroy();
            childScope = null;
          }

          cached_src = undefined;

          element.html('');
        };

        function ngIncludeWatchFragmentAction(fragment) {
          var cached_response = $templateCache.get(cached_src);
          if (! cached_response){ return;}
          var contents;

          if (childScope) { childScope.$destroy(); }
          childScope = scope.$new();

          if (fragment) {
            contents = angular.element('<div/>').html(cached_response).find(fragment);
          }
          else {
            contents = angular.element('<div/>').html(cached_response).contents();
          }

          element.html(contents);
          $compile(contents)(childScope);

          childScope.$emit('$includeContentLoaded');
          scope.$eval(onloadExp);

          if (angular.isDefined(autoScrollExp) && (!autoScrollExp || scope.$eval(autoScrollExp))) {
            $anchorScroll();
          }

        }

        function ngIncludeWatchSourceAction(src) {
          var thisChangeId = ++changeCounter;
          if (src && angular.isString(src)) {
            $http.get(src, {cache: $templateCache}).success(function(response) {
              if (thisChangeId !== changeCounter) { return; }

              cached_src = src;
              ngIncludeWatchFragmentAction(scope.$eval(fragExp));

            }).error(function() {
              if (thisChangeId === changeCounter) { clearContent(); }
            });
          } else { clearContent(); }
        }


       if (srcExp && srcExp !== ''){
         scope.$watch(srcExp, ngIncludeWatchSourceAction);

         if (fragExp && fragExp !== ''){
           scope.$watch(fragExp, ngIncludeWatchFragmentAction);
         }
       }
      };
    }
  };
}]);
