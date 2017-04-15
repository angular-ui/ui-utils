
/**
 * Filtering for objects
 *
 * @param collection {Object} The source object. If an array is passed, the default angular filter will be used instead.
 * @param expression {string|Object|function()} The predicate to be used for selecting items from array. Can be one of:
 *   * string: Predicate to use for checking the keys of the object
 *   * Object: A pattern object can be used to filter specific properties on objects contained by array. For example {name:"M", phone:"1"} predicate will return an array of items which have property name containing "M" and property phone containing "1". A special property name $ can be used (as in {$:"text"}) to accept a match against any property of the object. That's equivalent to the simple substring match with a string as described above.
 *   * function: A predicate function can be used to write arbitrary filters. The function is called for each element of array. The final result is an array of those elements that the predicate returned true for.
 */
angular.module('ui.filterObj',[]).filter('filterObj', ['$filter', function($filter){

    return function(collection, expression){
        var checker, result = {};
        if (angular.isArray(collection)) {
            result = $filter('filter').apply(this, expression);
        } else if (angular.isObject(collection) && expression) {
            if (angular.isFunction(expression)) {
                checker = expression;
            } else if (angular.isString(expression)) {
                checker = function(value, index){
                    return ~index.toUpperCase().indexOf(expression.toUpperCase());
                };
            } else {
                checker = function(collection, index){
                    var valid = false;
                    if ($ in expression) {
                        angular.forEach(collection, function(value, key){
                            if (~value.toUpperCase().indexOf(expression['$'].toUpperCase()))
                                valid = true;
                        });
                    }
                    angular.forEach(expression, function(value, key){
                        if (~value.toUpperCase().indexOf(expression[key].toUpperCase()))
                            valid = true;
                    });
                };
            }
            angular.forEach(collection, function(item, index){
                if (checker(item, index))
                    newValue[index] = value;
            });
        } else {
            result = collection;
        }
        return result;
    };
}]);