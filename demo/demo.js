'use strict';

angular.module('doc.ui-utils', ['ui.utils', 'prettifyDirective' ]);

angular.module('ui.scroll')
    .factory('datasource', [
    '$log', '$timeout', function(console, $timeout) {
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
