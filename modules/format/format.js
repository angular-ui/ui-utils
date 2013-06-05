
/**
 * A replacement utility for internationalization very similar to sprintf.
 *
 * @param replace {mixed} The tokens to replace depends on type
 *  string: all instances of $0 will be replaced
 *  array: each instance of $0, $1, $2 etc. will be placed with each array item in corresponding order
 *  object: all attributes will be iterated through, with :key being replaced with its corresponding value
 * @return string
 *
 * @example: 'Hello :name, how are you :day'.format({ name:'John', day:'Today' })
 * @example: 'Records $0 to $1 out of $2 total'.format(['10', '20', '3000'])
 * @example: '$0 agrees to all mentions $0 makes in the event that $0 hits a tree while $0 is driving drunk'.format('Bob')
 */
angular.module('ui.format',[]).filter('format', function(){
  return function(value, replace) {
    var target = value;
    if (angular.isString(target) && replace !== undefined) {
      if (!angular.isArray(replace) && !angular.isObject(replace)) {
        replace = [replace];
      }
      if (angular.isArray(replace)) {
        var rlen = replace.length;
        var rfx = function (str, i) {
          i = parseInt(i, 10);
          return (i>=0 && i<rlen) ? replace[i] : str;
        };
        target = target.replace(/\$([0-9]+)/g, rfx);
      }
      else {
        angular.forEach(replace, function(value, key){
          target = target.split(':'+key).join(value);
        });
      }
    }
    return target;
  };
});
