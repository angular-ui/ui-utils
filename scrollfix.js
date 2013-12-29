'use strict';
angular.module('ui.scrollfix', []).directive('uiScrollfix', [
  '$window',
  function ($window) {
    return {
      require: '^?uiScrollfixTarget',
      link: function (scope, elm, attrs, uiScrollfixTarget) {
        var top = elm[0].offsetTop, $target = uiScrollfixTarget && uiScrollfixTarget.$element || angular.element($window);
        if (!attrs.uiScrollfix) {
          attrs.uiScrollfix = top;
        } else if (typeof attrs.uiScrollfix === 'string') {
          if (attrs.uiScrollfix.charAt(0) === '-') {
            attrs.uiScrollfix = top - parseFloat(attrs.uiScrollfix.substr(1));
          } else if (attrs.uiScrollfix.charAt(0) === '+') {
            attrs.uiScrollfix = top + parseFloat(attrs.uiScrollfix.substr(1));
          }
        }
        function onScroll() {
          var offset;
          if (angular.isDefined($window.pageYOffset)) {
            offset = $window.pageYOffset;
          } else {
            var iebody = document.compatMode && document.compatMode !== 'BackCompat' ? document.documentElement : document.body;
            offset = iebody.scrollTop;
          }
          if (!elm.hasClass('ui-scrollfix') && offset > attrs.uiScrollfix) {
            elm.addClass('ui-scrollfix');
          } else if (elm.hasClass('ui-scrollfix') && offset < attrs.uiScrollfix) {
            elm.removeClass('ui-scrollfix');
          }
        }
        $target.on('scroll', onScroll);
        scope.$on('$destroy', function () {
          $target.off('scroll', onScroll);
        });
      }
    };
  }
]).directive('uiScrollfixTarget', [function () {
    return {
      controller: [
        '$element',
        function ($element) {
          this.$element = $element;
        }
      ]
    };
  }]);