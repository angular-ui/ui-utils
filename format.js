'use strict';
angular.module('ui.format', []).filter('format', function () {
  return function (value, replace) {
    var target = value;
    if (angular.isString(target) && replace !== undefined) {
      if (!angular.isArray(replace) && !angular.isObject(replace)) {
        replace = [replace];
      }
      if (angular.isArray(replace)) {
        var rlen = replace.length;
        var rfx = function (str, i) {
          i = parseInt(i, 10);
          return i >= 0 && i < rlen ? replace[i] : str;
        };
        target = target.replace(/\$([0-9]+)/g, rfx);
      } else {
        angular.forEach(replace, function (value, key) {
          target = target.split(':' + key).join(value);
        });
      }
    }
    return target;
  };
});