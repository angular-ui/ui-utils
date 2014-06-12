'use strict';

/**
 * Adds a 'ui-scrollfix' class to the element when the page scrolls past it's position.
 * @param [offset] {int} optional Y-offset to override the detected offset.
 *   Takes 300 (absolute) or -300 or +300 (relative to detected)
 */
angular.module('ui.scrollfix',[]).directive('uiScrollfix', ['$window', function ($window) {
  return {
    require: '^?uiScrollfixTarget',
    link: function (scope, elm, attrs, uiScrollfixTarget) {
      var top = elm[0].offsetTop,
          $target = uiScrollfixTarget && uiScrollfixTarget.$element || angular.element($window),
          originalHeight = elm.outerHeight(),
          offsetMark, $bottom;

      if (!attrs.uiScrollfix) {
        attrs.uiScrollfix = top;
      } else if (typeof(attrs.uiScrollfix) === 'string') {
        // charAt is generally faster than indexOf: http://jsperf.com/indexof-vs-charat
        if (attrs.uiScrollfix.charAt(0) === '-') {
          attrs.uiScrollfix = top - parseFloat(attrs.uiScrollfix.substr(1));
        } else if (attrs.uiScrollfix.charAt(0) === '+') {
          attrs.uiScrollfix = top + parseFloat(attrs.uiScrollfix.substr(1));
        }
      }
      if (attrs.uiScrollfixBottom) {
        $bottom = angular.element(attrs.uiScrollfixBottom);
      }

      function onScroll() {
        // if pageYOffset is defined use it, otherwise use other crap for IE
        var offset;
        if (angular.isDefined($window.pageYOffset)) {
          offset = $window.pageYOffset;
        } else {
          var iebody = (document.compatMode && document.compatMode !== 'BackCompat') ? document.documentElement : document.body;
          offset = iebody.scrollTop;
        }
        if (!elm.hasClass('ui-scrollfix') && offset > attrs.uiScrollfix) {
          elm.addClass('ui-scrollfix');
        } else if (elm.hasClass('ui-scrollfix') && offset < attrs.uiScrollfix) {
          elm.removeClass('ui-scrollfix');
        }
        if (!!attrs.uiScrollfixBottom && elm.hasClass('ui-scrollfix')) {
          var elmBottom = elm.offset().top + elm.outerHeight();

          if (!elm.hasClass('ui-scrollfix-bottom') && elmBottom >= $bottom.offset().top) {
            offsetMark = offset - (elmBottom - $bottom.offset().top);
            elm.addClass('ui-scrollfix-bottom');
          } else if(elm.hasClass('ui-scrollfix-bottom') && offsetMark > offset) {
            elm.removeClass('ui-scrollfix-bottom');
          }

          if (typeof(attrs.uiScrollfixSquish) !== 'undefined') {
            if (elm.hasClass('ui-scrollfix-bottom') || originalHeight > elm.outerHeight()) {
              elm.css('bottom', ($window.innerHeight + offset - $bottom.offset().top));
            } else {
              elm.css('bottom', '');
            }
          } else {
            if (elm.hasClass('ui-scrollfix-bottom')) {
              var elementTop = elm.offset().top - elm.parent().offset().top + ($bottom.offset().top - elmBottom);
              elm.css({position: 'absolute', top: elementTop});
            } else {
              elm.css({position: '', top: ''});
            }
          }
        }
      }

      $target.on('scroll', onScroll);

      // Unbind scroll event handler when directive is removed
      scope.$on('$destroy', function() {
        $target.off('scroll', onScroll);
      });
    }
  };
}]).directive('uiScrollfixTarget', [function () {
  return {
    controller: ['$element', function($element) {
      this.$element = $element;
    }]
  };
}]);
