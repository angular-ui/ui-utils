'use strict';
angular.module('ui.mask', []).value('uiMaskConfig', {
  'maskDefinitions': {
    '9': /\d/,
    'A': /[a-zA-Z]/,
    '*': /[a-zA-Z0-9]/
  }
}).directive('uiMask', [
  'uiMaskConfig',
  function (maskConfig) {
    return {
      priority: 100,
      require: 'ngModel',
      restrict: 'A',
      compile: function uiMaskCompilingFunction() {
        var options = maskConfig;
        return function uiMaskLinkingFunction(scope, iElement, iAttrs, controller) {
          var maskProcessed = false, eventsBound = false, maskCaretMap, maskPatterns, maskPlaceholder, maskComponents, minRequiredLength, value, valueMasked, isValid, originalPlaceholder = iAttrs.placeholder, originalMaxlength = iAttrs.maxlength, oldValue, oldValueUnmasked, oldCaretPosition, oldSelectionLength;
          function initialize(maskAttr) {
            if (!angular.isDefined(maskAttr)) {
              return uninitialize();
            }
            processRawMask(maskAttr);
            if (!maskProcessed) {
              return uninitialize();
            }
            initializeElement();
            bindEventListeners();
            return true;
          }
          function initPlaceholder(placeholderAttr) {
            if (!angular.isDefined(placeholderAttr)) {
              return;
            }
            maskPlaceholder = placeholderAttr;
            if (maskProcessed) {
              eventHandler();
            }
          }
          function formatter(fromModelValue) {
            if (!maskProcessed) {
              return fromModelValue;
            }
            value = unmaskValue(fromModelValue || '');
            isValid = validateValue(value);
            controller.$setValidity('mask', isValid);
            return isValid && value.length ? maskValue(value) : undefined;
          }
          function parser(fromViewValue) {
            if (!maskProcessed) {
              return fromViewValue;
            }
            value = unmaskValue(fromViewValue || '');
            isValid = validateValue(value);
            controller.$viewValue = value.length ? maskValue(value) : '';
            controller.$setValidity('mask', isValid);
            if (value === '' && controller.$error.required !== undefined) {
              controller.$setValidity('required', false);
            }
            return isValid ? value : undefined;
          }
          var linkOptions = {};
          if (iAttrs.uiOptions) {
            linkOptions = scope.$eval('[' + iAttrs.uiOptions + ']');
            if (angular.isObject(linkOptions[0])) {
              linkOptions = function (original, current) {
                for (var i in original) {
                  if (Object.prototype.hasOwnProperty.call(original, i)) {
                    if (!current[i]) {
                      current[i] = angular.copy(original[i]);
                    } else {
                      angular.extend(current[i], original[i]);
                    }
                  }
                }
                return current;
              }(options, linkOptions[0]);
            }
          } else {
            linkOptions = options;
          }
          iAttrs.$observe('uiMask', initialize);
          iAttrs.$observe('placeholder', initPlaceholder);
          controller.$formatters.push(formatter);
          controller.$parsers.push(parser);
          function uninitialize() {
            maskProcessed = false;
            unbindEventListeners();
            if (angular.isDefined(originalPlaceholder)) {
              iElement.attr('placeholder', originalPlaceholder);
            } else {
              iElement.removeAttr('placeholder');
            }
            if (angular.isDefined(originalMaxlength)) {
              iElement.attr('maxlength', originalMaxlength);
            } else {
              iElement.removeAttr('maxlength');
            }
            iElement.val(controller.$modelValue);
            controller.$viewValue = controller.$modelValue;
            return false;
          }
          function initializeElement() {
            value = oldValueUnmasked = unmaskValue(controller.$modelValue || '');
            valueMasked = oldValue = maskValue(value);
            isValid = validateValue(value);
            var viewValue = isValid && value.length ? valueMasked : '';
            if (iAttrs.maxlength) {
              iElement.attr('maxlength', maskCaretMap[maskCaretMap.length - 1] * 2);
            }
            iElement.attr('placeholder', maskPlaceholder);
            iElement.val(viewValue);
            controller.$viewValue = viewValue;
          }
          function bindEventListeners() {
            if (eventsBound) {
              return;
            }
            iElement.bind('blur', blurHandler);
            iElement.bind('mousedown mouseup', mouseDownUpHandler);
            iElement.bind('input keyup click focus', eventHandler);
            eventsBound = true;
          }
          function unbindEventListeners() {
            if (!eventsBound) {
              return;
            }
            iElement.unbind('blur', blurHandler);
            iElement.unbind('mousedown', mouseDownUpHandler);
            iElement.unbind('mouseup', mouseDownUpHandler);
            iElement.unbind('input', eventHandler);
            iElement.unbind('keyup', eventHandler);
            iElement.unbind('click', eventHandler);
            iElement.unbind('focus', eventHandler);
            eventsBound = false;
          }
          function validateValue(value) {
            return value.length ? value.length >= minRequiredLength : true;
          }
          function unmaskValue(value) {
            var valueUnmasked = '', maskPatternsCopy = maskPatterns.slice();
            value = value.toString();
            angular.forEach(maskComponents, function (component) {
              value = value.replace(component, '');
            });
            angular.forEach(value.split(''), function (chr) {
              if (maskPatternsCopy.length && maskPatternsCopy[0].test(chr)) {
                valueUnmasked += chr;
                maskPatternsCopy.shift();
              }
            });
            return valueUnmasked;
          }
          function maskValue(unmaskedValue) {
            var valueMasked = '', maskCaretMapCopy = maskCaretMap.slice();
            angular.forEach(maskPlaceholder.split(''), function (chr, i) {
              if (unmaskedValue.length && i === maskCaretMapCopy[0]) {
                valueMasked += unmaskedValue.charAt(0) || '_';
                unmaskedValue = unmaskedValue.substr(1);
                maskCaretMapCopy.shift();
              } else {
                valueMasked += chr;
              }
            });
            return valueMasked;
          }
          function getPlaceholderChar(i) {
            var placeholder = iAttrs.placeholder;
            if (typeof placeholder !== 'undefined' && placeholder[i]) {
              return placeholder[i];
            } else {
              return '_';
            }
          }
          function getMaskComponents() {
            return maskPlaceholder.replace(/[_]+/g, '_').replace(/([^_]+)([a-zA-Z0-9])([^_])/g, '$1$2_$3').split('_');
          }
          function processRawMask(mask) {
            var characterCount = 0;
            maskCaretMap = [];
            maskPatterns = [];
            maskPlaceholder = '';
            if (typeof mask === 'string') {
              minRequiredLength = 0;
              var isOptional = false, splitMask = mask.split('');
              angular.forEach(splitMask, function (chr, i) {
                if (linkOptions.maskDefinitions[chr]) {
                  maskCaretMap.push(characterCount);
                  maskPlaceholder += getPlaceholderChar(i);
                  maskPatterns.push(linkOptions.maskDefinitions[chr]);
                  characterCount++;
                  if (!isOptional) {
                    minRequiredLength++;
                  }
                } else if (chr === '?') {
                  isOptional = true;
                } else {
                  maskPlaceholder += chr;
                  characterCount++;
                }
              });
            }
            maskCaretMap.push(maskCaretMap.slice().pop() + 1);
            maskComponents = getMaskComponents();
            maskProcessed = maskCaretMap.length > 1 ? true : false;
          }
          function blurHandler() {
            oldCaretPosition = 0;
            oldSelectionLength = 0;
            if (!isValid || value.length === 0) {
              valueMasked = '';
              iElement.val('');
              scope.$apply(function () {
                controller.$setViewValue('');
              });
            }
          }
          function mouseDownUpHandler(e) {
            if (e.type === 'mousedown') {
              iElement.bind('mouseout', mouseoutHandler);
            } else {
              iElement.unbind('mouseout', mouseoutHandler);
            }
          }
          iElement.bind('mousedown mouseup', mouseDownUpHandler);
          function mouseoutHandler() {
            oldSelectionLength = getSelectionLength(this);
            iElement.unbind('mouseout', mouseoutHandler);
          }
          function eventHandler(e) {
            e = e || {};
            var eventWhich = e.which, eventType = e.type;
            if (eventWhich === 16 || eventWhich === 91) {
              return;
            }
            var val = iElement.val(), valOld = oldValue, valMasked, valUnmasked = unmaskValue(val), valUnmaskedOld = oldValueUnmasked, valAltered = false, caretPos = getCaretPosition(this) || 0, caretPosOld = oldCaretPosition || 0, caretPosDelta = caretPos - caretPosOld, caretPosMin = maskCaretMap[0], caretPosMax = maskCaretMap[valUnmasked.length] || maskCaretMap.slice().shift(), selectionLenOld = oldSelectionLength || 0, isSelected = getSelectionLength(this) > 0, wasSelected = selectionLenOld > 0, isAddition = val.length > valOld.length || selectionLenOld && val.length > valOld.length - selectionLenOld, isDeletion = val.length < valOld.length || selectionLenOld && val.length === valOld.length - selectionLenOld, isSelection = eventWhich >= 37 && eventWhich <= 40 && e.shiftKey, isKeyLeftArrow = eventWhich === 37, isKeyBackspace = eventWhich === 8 || eventType !== 'keyup' && isDeletion && caretPosDelta === -1, isKeyDelete = eventWhich === 46 || eventType !== 'keyup' && isDeletion && caretPosDelta === 0 && !wasSelected, caretBumpBack = (isKeyLeftArrow || isKeyBackspace || eventType === 'click') && caretPos > caretPosMin;
            oldSelectionLength = getSelectionLength(this);
            if (isSelection || isSelected && (eventType === 'click' || eventType === 'keyup')) {
              return;
            }
            if (eventType === 'input' && isDeletion && !wasSelected && valUnmasked === valUnmaskedOld) {
              while (isKeyBackspace && caretPos > caretPosMin && !isValidCaretPosition(caretPos)) {
                caretPos--;
              }
              while (isKeyDelete && caretPos < caretPosMax && maskCaretMap.indexOf(caretPos) === -1) {
                caretPos++;
              }
              var charIndex = maskCaretMap.indexOf(caretPos);
              valUnmasked = valUnmasked.substring(0, charIndex) + valUnmasked.substring(charIndex + 1);
              valAltered = true;
            }
            valMasked = maskValue(valUnmasked);
            oldValue = valMasked;
            oldValueUnmasked = valUnmasked;
            iElement.val(valMasked);
            if (valAltered) {
              scope.$apply(function () {
                controller.$setViewValue(valUnmasked);
              });
            }
            if (isAddition && caretPos <= caretPosMin) {
              caretPos = caretPosMin + 1;
            }
            if (caretBumpBack) {
              caretPos--;
            }
            caretPos = caretPos > caretPosMax ? caretPosMax : caretPos < caretPosMin ? caretPosMin : caretPos;
            while (!isValidCaretPosition(caretPos) && caretPos > caretPosMin && caretPos < caretPosMax) {
              caretPos += caretBumpBack ? -1 : 1;
            }
            if (caretBumpBack && caretPos < caretPosMax || isAddition && !isValidCaretPosition(caretPosOld)) {
              caretPos++;
            }
            oldCaretPosition = caretPos;
            setCaretPosition(this, caretPos);
          }
          function isValidCaretPosition(pos) {
            return maskCaretMap.indexOf(pos) > -1;
          }
          function getCaretPosition(input) {
            if (!input)
              return 0;
            if (input.selectionStart !== undefined) {
              return input.selectionStart;
            } else if (document.selection) {
              input.focus();
              var selection = document.selection.createRange();
              selection.moveStart('character', -input.value.length);
              return selection.text.length;
            }
            return 0;
          }
          function setCaretPosition(input, pos) {
            if (!input)
              return 0;
            if (input.offsetWidth === 0 || input.offsetHeight === 0) {
              return;
            }
            if (input.setSelectionRange) {
              input.focus();
              input.setSelectionRange(pos, pos);
            } else if (input.createTextRange) {
              var range = input.createTextRange();
              range.collapse(true);
              range.moveEnd('character', pos);
              range.moveStart('character', pos);
              range.select();
            }
          }
          function getSelectionLength(input) {
            if (!input)
              return 0;
            if (input.selectionStart !== undefined) {
              return input.selectionEnd - input.selectionStart;
            }
            if (document.selection) {
              return document.selection.createRange().text.length;
            }
            return 0;
          }
          if (!Array.prototype.indexOf) {
            Array.prototype.indexOf = function (searchElement) {
              if (this === null) {
                throw new TypeError();
              }
              var t = Object(this);
              var len = t.length >>> 0;
              if (len === 0) {
                return -1;
              }
              var n = 0;
              if (arguments.length > 1) {
                n = Number(arguments[1]);
                if (n !== n) {
                  n = 0;
                } else if (n !== 0 && n !== Infinity && n !== -Infinity) {
                  n = (n > 0 || -1) * Math.floor(Math.abs(n));
                }
              }
              if (n >= len) {
                return -1;
              }
              var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
              for (; k < len; k++) {
                if (k in t && t[k] === searchElement) {
                  return k;
                }
              }
              return -1;
            };
          }
        };
      }
    };
  }
]);