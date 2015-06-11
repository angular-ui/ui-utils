angular.module('ui.scroll')
    .factory('datasource', [
    '$log', '$timeout', function(console, $timeout) {
        'use strict';

        var get = function(index, count, success) {
            return $timeout(function() {
                var result = [];
                for (var i = index; i <= index + count - 1; i++){
                  result.push('item #' + i);
                }
                return success(result);
            }, 100);
        };
        return {
            get: get
        };
    }
]);

angular.module('doc.ui-utils', ['ui.utils', 'prettifyDirective', 'ui.uploader']);
