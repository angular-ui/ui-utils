'use strict';

/**
 * Wraps the
 * @param text {string} haystack to search through
 * @param search {string} needle to search for
 * @param [caseSensitive] {boolean} optional boolean to use case-sensitive searching
 */
angular.module('ui.highlight',[]).filter('highlight', [ '$sce' , function ($sce) {
  return function (text, search, caseSensitive) {
    if (search || angular.isNumber(search)) {
      text = text.toString();
      search = search.toString();
      if (caseSensitive) {
        return $sce.trustAsHtml(text.split(search).join('<span class="ui-match">' + search + '</span>'));
      } else {
        return $sce.trustAsHtml(text.replace(new RegExp(search, 'gi'), '<span class="ui-match">$&</span>'));
      }
    } else {
      return $sce.trustAsHtml(text);
    }
  };
}]);
