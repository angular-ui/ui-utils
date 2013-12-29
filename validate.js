'use strict';
angular.module('ui.validate', []).directive('uiValidate', function () {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function (scope, elm, attrs, ctrl) {
      var validateFn, validators = {}, validateExpr = scope.$eval(attrs.uiValidate);
      if (!validateExpr) {
        return;
      }
      if (angular.isString(validateExpr)) {
        validateExpr = { validator: validateExpr };
      }
      angular.forEach(validateExpr, function (exprssn, key) {
        validateFn = function (valueToValidate) {
          var expression = scope.$eval(exprssn, { '$value': valueToValidate });
          if (angular.isObject(expression) && angular.isFunction(expression.then)) {
            expression.then(function () {
              ctrl.$setValidity(key, true);
            }, function () {
              ctrl.$setValidity(key, false);
            });
            return valueToValidate;
          } else if (expression) {
            ctrl.$setValidity(key, true);
            return valueToValidate;
          } else {
            ctrl.$setValidity(key, false);
            return undefined;
          }
        };
        validators[key] = validateFn;
        ctrl.$formatters.push(validateFn);
        ctrl.$parsers.push(validateFn);
      });
      function apply_watch(watch) {
        if (angular.isString(watch)) {
          scope.$watch(watch, function () {
            angular.forEach(validators, function (validatorFn) {
              validatorFn(ctrl.$modelValue);
            });
          });
          return;
        }
        if (angular.isArray(watch)) {
          angular.forEach(watch, function (expression) {
            scope.$watch(expression, function () {
              angular.forEach(validators, function (validatorFn) {
                validatorFn(ctrl.$modelValue);
              });
            });
          });
          return;
        }
        if (angular.isObject(watch)) {
          angular.forEach(watch, function (expression, validatorKey) {
            if (angular.isString(expression)) {
              scope.$watch(expression, function () {
                validators[validatorKey](ctrl.$modelValue);
              });
            }
            if (angular.isArray(expression)) {
              angular.forEach(expression, function (intExpression) {
                scope.$watch(intExpression, function () {
                  validators[validatorKey](ctrl.$modelValue);
                });
              });
            }
          });
        }
      }
      if (attrs.uiValidateWatch) {
        apply_watch(scope.$eval(attrs.uiValidateWatch));
      }
    }
  };
});