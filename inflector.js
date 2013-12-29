'use strict';
angular.module('ui.inflector', []).filter('inflector', function () {
  function ucwords(text) {
    return text.replace(/^([a-z])|\s+([a-z])/g, function ($1) {
      return $1.toUpperCase();
    });
  }
  function breakup(text, separator) {
    return text.replace(/[A-Z]/g, function (match) {
      return separator + match;
    });
  }
  var inflectors = {
      humanize: function (value) {
        return ucwords(breakup(value, ' ').split('_').join(' '));
      },
      underscore: function (value) {
        return value.substr(0, 1).toLowerCase() + breakup(value.substr(1), '_').toLowerCase().split(' ').join('_');
      },
      variable: function (value) {
        value = value.substr(0, 1).toLowerCase() + ucwords(value.split('_').join(' ')).substr(1).split(' ').join('');
        return value;
      }
    };
  return function (text, inflector) {
    if (inflector !== false && angular.isString(text)) {
      inflector = inflector || 'humanize';
      return inflectors[inflector](text);
    } else {
      return text;
    }
  };
});