/*global angular, $, document*/
/**
 * Adds a 'ui-scrollfix' class to the element when the page scrolls past it's position.
 * @param [offset] {int} optional Y-offset to override the detected offset.
 *   Takes 300 (absolute) or -300 or +300 (relative to detected)
 */
angular.module('ui.scrollfix',[]).directive('uiScrollfix', ['$window', function ($window) {
  'use strict';
  return {
    require: '^?uiScrollfixTarget',
    link: function (scope, elm, attrs, uiScrollfixTarget) {
      var top = elm[0].offsetTop,
          $target = uiScrollfixTarget && uiScrollfixTarget.$element || angular.element($window);
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

      $target.bind('scroll', function () {
        // if pageYOffset is defined use it, otherwise use other crap for IE
        var offset;
        if (angular.isDefined($window.pageYOffset)) {
          offset = $window.pageYOffset;
        } else {
          var iebody = (document.compatMode && document.compatMode !== "BackCompat") ? document.documentElement : document.body;
          offset = iebody.scrollTop;
        }
        if (!elm.hasClass('ui-scrollfix') && offset > attrs.uiScrollfix) {
          elm.addClass('ui-scrollfix');
        } else if (elm.hasClass('ui-scrollfix') && offset < attrs.uiScrollfix) {
          elm.removeClass('ui-scrollfix');
        }
      });
    }
  };
}]).directive('uiScrollfixTarget', [function () {
  'use strict';
  return {
    controller: function($element) {
      this.$element = $element;
    }
  };
}]);
