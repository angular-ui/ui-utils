'use strict';
angular.module('ui.showhide', []).directive('uiShow', [function () {
    return function (scope, elm, attrs) {
      scope.$watch(attrs.uiShow, function (newVal) {
        if (newVal) {
          elm.addClass('ui-show');
        } else {
          elm.removeClass('ui-show');
        }
      });
    };
  }]).directive('uiHide', [function () {
    return function (scope, elm, attrs) {
      scope.$watch(attrs.uiHide, function (newVal) {
        if (newVal) {
          elm.addClass('ui-hide');
        } else {
          elm.removeClass('ui-hide');
        }
      });
    };
  }]).directive('uiToggle', [function () {
    return function (scope, elm, attrs) {
      scope.$watch(attrs.uiToggle, function (newVal) {
        if (newVal) {
          elm.removeClass('ui-hide').addClass('ui-show');
        } else {
          elm.removeClass('ui-show').addClass('ui-hide');
        }
      });
    };
  }]);