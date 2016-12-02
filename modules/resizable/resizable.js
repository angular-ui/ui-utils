'use strict';

/**
 * Make any element resizable using the uiResizable directive.
 * The only handlers that are currently implemented are e,s,se.
 *
 *  - CONTAINMENT -
 * You can contain the element using the containment option (default: false)
 * It can contain:
 *      the id of the containment element
 *      the string 'body' (contained by window.body)
 *      the string 'parent' (contained by element's parent)
 *      the name of a scope variable that evaluates to any of the above
 *
 * @param resizableOptions {object} Configuration object for the directive
 */
angular.module('ui.resizable', []).directive('uiResizable', ['$document', '$log', function($document, $log) {
    return {
        restrict: 'A',
        link: function(scope, element, attributes) {
            var defaultOptions = {
                additionalClassNames: '',
                containment: false, //possible string values 'body'/'parent'
                containmentHeight: Infinity,
                containmentWidth: Infinity,
                defaultClassName: 'ui-resizable',
                handles: ['e', 's', 'se'],
                handleClassName: 'ui-resizable-handle',
                handleDirectionClassPrefix: 'handle-',
                maxHeight: Infinity,
                maxWidth: Infinity,
                minHeight: 0,
                minWidth: 0,
                noBorderClassName: 'no-border',
                resizingClassName: 'ui-resizing',
                showBorders: false
            };

            /* setup options */
            var options = scope.$eval(attributes.uiResizable) || {};
            options = angular.extend(defaultOptions, options);

            /* helper functions */
            var getOffsetRect = function(elem) {
                var box = elem.getBoundingClientRect();

                var body = document.body;
                var docElem = document.documentElement;

                var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
                var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;

                var clientTop = docElem.clientTop || body.clientTop || 0;
                var clientLeft = docElem.clientLeft || body.clientLeft || 0;

                var top = box.top + scrollTop - clientTop;
                var left = box.left + scrollLeft - clientLeft;

                return {top: Math.round(top), left: Math.round(left)};
            };

            var getStyle = function(el, styleProp) {
                var value, defaultView = el.ownerDocument.defaultView;
                // W3C standard way:
                if (defaultView && defaultView.getComputedStyle) {
                    // sanitize property name to css notation (hypen separated words eg. font-Size)
                    styleProp = styleProp.replace(/([A-Z])/g, '-$1').toLowerCase();
                    return defaultView.getComputedStyle(el, null).getPropertyValue(styleProp);
                } else if (el.currentStyle) { // IE
                    // sanitize property name to camelCase
                    styleProp = styleProp.replace(/\-(\w)/g, function(str, letter) {
                    return letter.toUpperCase();
                    });
                value = el.currentStyle[styleProp];
                // convert other units to pixels on IE
                if (/^\d+(em|pt|%|ex)?$/i.test(value)) {
                  return (function(value) {
                    var oldLeft = el.style.left, oldRsLeft = el.runtimeStyle.left;
                    el.runtimeStyle.left = el.currentStyle.left;
                    el.style.left = value || 0;
                    value = el.style.pixelLeft + 'px';
                    el.style.left = oldLeft;
                    el.runtimeStyle.left = oldRsLeft;
                    return value;
                  })(value);
                }
                    return value;
                }
            };

            /* Event handler functions */
            var contElem = null,
                contRect, rect;

            var handler = function(event) {
                event.preventDefault();

                // get handle position
                var regexp = new RegExp(options.handleDirectionClassPrefix + '[swen]+');
                scope.handlePos = event.target.className.match(regexp)[0]
                                                        .replace(options.handleDirectionClassPrefix, '');
                element.addClass(options.resizingClassName)
                    .addClass(options.resizingClassName+'-'+scope.handlePos);

                // find containment element
                if (options.containment) {
                    contElem = scope.$eval(options.containment) || options.containment;
                    if (!angular.isElement(contElem)) {
                        if (contElem === 'body') {
                            contElem = document.body;
                        } else if (contElem === 'parent') {
                            contElem = element.parent();
                        } else {
                            contElem = document.getElementById(contElem);
                        }
                    }
                    // get raw dom element
                    contElem = angular.element(contElem)[0];
                }

                // Calculate resizing and containment element rectangle positions
                rect = getOffsetRect(element[0]);
                if (contElem) contRect = getOffsetRect(contElem);

                // Calculate padding and border width/height
                rect.left += parseInt(getStyle(element[0],'padding-left'), 10) +
                             parseInt(getStyle(element[0],'padding-right'), 10) +
                             parseInt(getStyle(element[0],'border-left-width'), 10) +
                             parseInt(getStyle(element[0],'border-right-width'), 10);
                rect.top +=  parseInt(getStyle(element[0],'padding-top'), 10) +
                             parseInt(getStyle(element[0],'padding-bottom'), 10) +
                             parseInt(getStyle(element[0],'border-top-width'), 10) +
                             parseInt(getStyle(element[0],'border-bottom-width'), 10);

                // bind event handlers
                $document.bind('mousemove', mousemove);
                $document.bind('mouseup', mouseup);
            };

            var mousemove = function(event) {
                var x, y, newWidth, newHeight, pos = scope.handlePos;

                // calculate containment width/height if contElem exists
                if (contElem) {
                    options.containmentWidth = contElem.offsetWidth + contRect.left - rect.left;
                    options.containmentHeight = contElem.offsetHeight + contRect.top - rect.top;
                }

                // handle x-axis
                if (pos === 'w' || pos === 'e' || pos.length === 2) {
                    // TODO implement w,nw,ne,sw
                    if (pos === 'e' || pos === 'se') {
                        x = event.pageX;
                        newWidth = x - rect.left + 5;
                        if (newWidth >= options.minWidth && newWidth <= options.maxWidth
                                    && newWidth <= options.containmentWidth)
                            element.css('width', newWidth + 'px');
                    }
                }

                // handle y-axis
                if (pos === 'n' || pos === 's' || pos.length === 2) {
                    // TODO implement n,nw,ne,sw handles
                    if (pos === 's' || pos === 'se') {
                        y = event.pageY;
                        newHeight = y - rect.top + 5;

                        if (newHeight >= options.minHeight && newHeight <= options.maxHeight
                                    && newHeight <= options.containmentHeight)
                            element.css('height', newHeight + 'px');
                    }
                }
            };

            var mouseup = function() {
                $document.unbind('mousemove', mousemove);
                $document.unbind('mouseup', mouseup);
                element.removeClass(options.resizingClassName)
                    .removeClass(options.resizingClassName+'-'+scope.handlePos);
            };

            /* Add classes */
            element
                .addClass(options.defaultClassName)
                .addClass(options.additionalClassNames);

            /* Generate all resizable handles */

            // sort handles array so that corner handles will get appended last
            // (position matters to prevent corners get overlapped)
            var handles = options.handles.sort(function(a, b) {
                return a.length - b.length;
            });

            var handleElem;
            for (var i in handles) {
                // TODO implement n,w,nw,ne,sw handles
                if (handles[i] !== 'e' && handles[i] !== 's' && handles[i] !== 'se') {
                    $log.info('ui.resizable: ' + handles[i] + ' direction not implemented');
                    continue;
                }
                // create the handle
                handleElem = angular.element('<div>').addClass(options.handleClassName);
                if (!options.showBorders && handles[i].length !== 2)
                    handleElem.addClass(options.noBorderClassName);
                // bind events to the handle
                handleElem.bind('mousedown', handler);
                // append handle to element
                element.append(handleElem.addClass(options.handleDirectionClassPrefix + handles[i]));
            }
        }
    };
}]);