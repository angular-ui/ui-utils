'use strict';
angular.module('ui.keypress', []).factory('keypressHelper', [
  '$parse',
  function keypress($parse) {
    var keysByCode = {
        8: 'backspace',
        9: 'tab',
        13: 'enter',
        27: 'esc',
        32: 'space',
        33: 'pageup',
        34: 'pagedown',
        35: 'end',
        36: 'home',
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        45: 'insert',
        46: 'delete'
      };
    var capitaliseFirstLetter = function (string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    };
    return function (mode, scope, elm, attrs) {
      var params, combinations = [];
      params = scope.$eval(attrs['ui' + capitaliseFirstLetter(mode)]);
      angular.forEach(params, function (v, k) {
        var combination, expression;
        expression = $parse(v);
        angular.forEach(k.split(' '), function (variation) {
          combination = {
            expression: expression,
            keys: {}
          };
          angular.forEach(variation.split('-'), function (value) {
            combination.keys[value] = true;
          });
          combinations.push(combination);
        });
      });
      elm.bind(mode, function (event) {
        var metaPressed = !!(event.metaKey && !event.ctrlKey);
        var altPressed = !!event.altKey;
        var ctrlPressed = !!event.ctrlKey;
        var shiftPressed = !!event.shiftKey;
        var keyCode = event.keyCode;
        if (mode === 'keypress' && !shiftPressed && keyCode >= 97 && keyCode <= 122) {
          keyCode = keyCode - 32;
        }
        angular.forEach(combinations, function (combination) {
          var mainKeyPressed = combination.keys[keysByCode[keyCode]] || combination.keys[keyCode.toString()];
          var metaRequired = !!combination.keys.meta;
          var altRequired = !!combination.keys.alt;
          var ctrlRequired = !!combination.keys.ctrl;
          var shiftRequired = !!combination.keys.shift;
          if (mainKeyPressed && metaRequired === metaPressed && altRequired === altPressed && ctrlRequired === ctrlPressed && shiftRequired === shiftPressed) {
            scope.$apply(function () {
              combination.expression(scope, { '$event': event });
            });
          }
        });
      });
    };
  }
]);
angular.module('ui.keypress').directive('uiKeydown', [
  'keypressHelper',
  function (keypressHelper) {
    return {
      link: function (scope, elm, attrs) {
        keypressHelper('keydown', scope, elm, attrs);
      }
    };
  }
]);
angular.module('ui.keypress').directive('uiKeypress', [
  'keypressHelper',
  function (keypressHelper) {
    return {
      link: function (scope, elm, attrs) {
        keypressHelper('keypress', scope, elm, attrs);
      }
    };
  }
]);
angular.module('ui.keypress').directive('uiKeyup', [
  'keypressHelper',
  function (keypressHelper) {
    return {
      link: function (scope, elm, attrs) {
        keypressHelper('keyup', scope, elm, attrs);
      }
    };
  }
]);