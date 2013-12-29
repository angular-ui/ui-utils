'use strict';
angular.module('ui.unique', []).filter('unique', [
  '$parse',
  function ($parse) {
    return function (items, filterOn) {
      if (filterOn === false) {
        return items;
      }
      if ((filterOn || angular.isUndefined(filterOn)) && angular.isArray(items)) {
        var newItems = [], get = angular.isString(filterOn) ? $parse(filterOn) : function (item) {
            return item;
          };
        var extractValueToCompare = function (item) {
          return angular.isObject(item) ? get(item) : item;
        };
        angular.forEach(items, function (item) {
          var isDuplicate = false;
          for (var i = 0; i < newItems.length; i++) {
            if (angular.equals(extractValueToCompare(newItems[i]), extractValueToCompare(item))) {
              isDuplicate = true;
              break;
            }
          }
          if (!isDuplicate) {
            newItems.push(item);
          }
        });
        items = newItems;
      }
      return items;
    };
  }
]);