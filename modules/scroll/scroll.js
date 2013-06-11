/*global angular, $, document*/
/**
 *
 */
angular.module('ui.scroll', [
    ]).directive('ngScrollViewport', [
        '$log', function(console) {
            return {
                controller: [
                    '$scope', '$element', function(scope, element) {
                        return element;
                    }
                ]
            };
        }
    ]).directive('ngScrollCanvas', [
        '$log', function(console) {
            return {
                controller: [
                    '$scope', '$element', function(scope, element) {
                        return element;
                    }
                ]
            };
        }
    ]).directive('ngScroll', [
        '$log', '$injector', function(console, $injector) {
            return {
                require: ['?^ngScrollViewport', '?^ngScrollCanvas'],
                transclude: 'element',
                priority: 1000,
                terminal: true,
                compile: function(element, attr, linker) {
                    return function($scope, $element, $attr, controllers) {
                        var datasourceName, itemName, match;
                        match = $attr.ngScroll.match(/^\s*(\w+)\s+in\s+(\w+)\s*$/);
                        if (!match) {
                            throw Error("Expected ngScroll in form of '_item_ in _datasource_' but got '" + $attr.ngScroll + "'");
                        }
                        itemName = match[1];
                        datasourceName = match[2];
                        return $injector.invoke([
                            datasourceName, function(datasource) {
                                var adjustBuffer, bof, buffer, bufferPadding, bufferSize, canvas, clipBottom, clipTop, controller, enqueueFetch, eof, fetch, finalize, first, insert, isLoading, loading, next, pending, reload, removeFromBuffer, shouldLoadBottom, shouldLoadTop, temp, viewport;
                                bufferSize = Math.max(3, +$attr.bufferSize || 10);
                                bufferPadding = function() {
                                    return viewport.height() * Math.max(.2, +$attr.padding || .5);
                                };
                                /*

                                 List of used element methods available in JQuery but not in JQuery Lite
                                 in other words if you want to remove dependency on JQuery the following methods are to be implemented:

                                 element.height()
                                 element.outerHeight(true)
                                 element.height(value) = only for Top/Bottom padding elements
                                 element.scrollTop()
                                 element.scrollTop(value)
                                 element.offset()
                                 */

                                controller = null;
                                linker(temp = $scope.$new(), function(template) {
                                    var bottomPadding, canvas, contents, topPadding, viewport;
                                    temp.$destroy();
                                    viewport = controllers[0] || angular.element(window);
                                    canvas = controllers[1] || element.parent();
                                    switch (template[0].localName) {
                                        case 'li':
                                            if (canvas[0] === viewport[0]) {
                                                throw Error("element cannot be used as both viewport and canvas: " + canvas[0].outerHTML);
                                            }
                                            topPadding = angular.element('<li/>');
                                            bottomPadding = angular.element('<li/>');
                                            break;
                                        case 'tr':
                                        case 'dl':
                                            throw Error("ng-scroll directive does not support <" + template[0].localName + "> as a repeating tag: " + template[0].outerHTML);
                                            break;
                                        default:
                                            if (canvas[0] === viewport[0]) {
                                                contents = canvas.contents();
                                                canvas = angular.element('<div/>');
                                                viewport.append(canvas);
                                                canvas.append(contents);
                                            }
                                            topPadding = angular.element('<div/>');
                                            bottomPadding = angular.element('<div/>');
                                    }
                                    viewport.css({
                                        'overflow-y': 'auto',
                                        'display': 'block'
                                    });
                                    canvas.css({
                                        'overflow-y': 'visible',
                                        'display': 'block'
                                    });
                                    element.before(topPadding);
                                    element.after(bottomPadding);
                                    return controller = {
                                        viewport: viewport,
                                        canvas: canvas,
                                        topPadding: function(value) {
                                            if (arguments.length) {
                                                return topPadding.height(value);
                                            } else {
                                                return topPadding.height();
                                            }
                                        },
                                        bottomPadding: function(value) {
                                            if (arguments.length) {
                                                return bottomPadding.height(value);
                                            } else {
                                                return bottomPadding.height();
                                            }
                                        },
                                        append: function(element) {
                                            return bottomPadding.before(element);
                                        },
                                        prepend: function(element) {
                                            return topPadding.after(element);
                                        }
                                    };
                                });
                                viewport = controller.viewport;
                                canvas = controller.canvas;
                                first = 1;
                                next = 1;
                                buffer = [];
                                pending = [];
                                eof = false;
                                bof = false;
                                loading = datasource.loading || function(value) {};
                                isLoading = false;
                                removeFromBuffer = function(start, stop) {
                                    var i, _i;
                                    for (i = _i = start; start <= stop ? _i < stop : _i > stop; i = start <= stop ? ++_i : --_i) {
                                        buffer[i].scope.$destroy();
                                        buffer[i].element.remove();
                                    }
                                    return buffer.splice(start, stop - start);
                                };
                                reload = function() {
                                    first = 1;
                                    next = 1;
                                    removeFromBuffer(0, buffer.length);
                                    controller.topPadding(0);
                                    controller.bottomPadding(0);
                                    pending = [];
                                    eof = false;
                                    bof = false;
                                    return adjustBuffer(true);
                                };
                                shouldLoadBottom = function() {
                                    var item;
                                    item = buffer[buffer.length - 1];
                                    return !eof && item.element.offset().top - canvas.offset().top + item.element.outerHeight(true) < viewport.scrollTop() + viewport.height() + bufferPadding();
                                };
                                clipBottom = function() {
                                    var bottomHeight, item, overage, _i, _len, _ref;
                                    bottomHeight = controller.bottomPadding();
                                    overage = 0;
                                    _ref = buffer.slice(0).reverse();
                                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                                        item = _ref[_i];
                                        if (viewport.scrollTop() + viewport.height() + bufferPadding() < item.element.offset().top - canvas.offset().top) {
                                            bottomHeight += item.element.outerHeight(true);
                                            overage++;
                                            eof = false;
                                        } else {
                                            break;
                                        }
                                    }
                                    if (overage > 0) {
                                        removeFromBuffer(buffer.length - overage, buffer.length);
                                        next -= overage;
                                        controller.bottomPadding(bottomHeight);
                                        return console.log("clipped off bottom " + overage + " bottom padding " + bottomHeight);
                                    }
                                };
                                shouldLoadTop = function() {
                                    return !bof && buffer[0].element.offset().top - canvas.offset().top > viewport.scrollTop() - bufferPadding();
                                };
                                clipTop = function() {
                                    var item, itemHeight, overage, topHeight, _i, _len;
                                    topHeight = controller.topPadding();
                                    overage = 0;
                                    for (_i = 0, _len = buffer.length; _i < _len; _i++) {
                                        item = buffer[_i];
                                        itemHeight = item.element.outerHeight(true);
                                        if (viewport.scrollTop() - bufferPadding() >= item.element.offset().top - canvas.offset().top + itemHeight) {
                                            topHeight += itemHeight;
                                            overage++;
                                            bof = false;
                                        } else {
                                            break;
                                        }
                                    }
                                    if (overage > 0) {
                                        removeFromBuffer(0, overage);
                                        controller.topPadding(topHeight);
                                        first += overage;
                                        return console.log("clipped off top " + overage + " top padding " + topHeight);
                                    }
                                };
                                enqueueFetch = function(direction) {
                                    if (!isLoading) {
                                        isLoading = true;
                                        loading(true);
                                    }
                                    if (pending.push(direction) === 1) {
                                        return fetch();
                                    }
                                };
                                adjustBuffer = function(reloadRequested) {
                                    if (buffer[0]) {
                                        console.log("top {actual=" + (buffer[0].element.offset().top - canvas.offset().top) + " visible from=" + (viewport.scrollTop()) + "}    bottom {visible through " + (viewport.scrollTop() + viewport.height()) + " actual=" + (buffer[buffer.length - 1].element.offset().top - canvas.offset().top) + "}");
                                    }
                                    if (reloadRequested || shouldLoadBottom()) {
                                        enqueueFetch(true);
                                    }
                                    if (!reloadRequested && shouldLoadTop()) {
                                        return enqueueFetch(false);
                                    }
                                };
                                insert = function(index, item, top) {
                                    var itemScope, wrapper;
                                    itemScope = $scope.$new();
                                    itemScope[itemName] = item;
                                    itemScope.$index = index;
                                    wrapper = {
                                        scope: itemScope
                                    };
                                    linker(itemScope, function(clone) {
                                        wrapper.element = clone;
                                        if (top) {
                                            controller.prepend(clone);
                                            return buffer.unshift(wrapper);
                                        } else {
                                            controller.append(clone);
                                            return buffer.push(wrapper);
                                        }
                                    });
                                    itemScope.$watch('heightAdjustment', function() {
                                        var newHeight, scrollTop;
                                        if (top) {
                                            newHeight = controller.topPadding() - wrapper.element.outerHeight(true);
                                            if (newHeight >= 0) {
                                                return controller.topPadding(newHeight);
                                            } else {
                                                scrollTop = viewport.scrollTop() + wrapper.element.outerHeight(true);
                                                if (viewport.height() + scrollTop > canvas.height()) {
                                                    controller.bottomPadding(controller.bottomPadding() + viewport.height() + scrollTop - canvas.height());
                                                }
                                                return viewport.scrollTop(scrollTop);
                                            }
                                        } else {
                                            return controller.bottomPadding(Math.max(0, controller.bottomPadding() - wrapper.element.outerHeight(true)));
                                        }
                                    });
                                    return itemScope;
                                };
                                finalize = function() {
                                    pending.shift();
                                    if (pending.length === 0) {
                                        isLoading = false;
                                        return loading(false);
                                    } else {
                                        return fetch();
                                    }
                                };
                                fetch = function() {
                                    var direction, lastScope;
                                    direction = pending[0];
                                    lastScope = null;
                                    if (direction) {
                                        if (buffer.length && !shouldLoadBottom()) {
                                            return finalize();
                                        } else {
                                            return datasource.get(next, bufferSize, function(result) {
                                                var item, _i, _len;
                                                clipTop();
                                                if (result.length === 0) {
                                                    eof = true;
                                                    console.log("appended: requested " + bufferSize + " records starting from " + next + " recieved: eof");
                                                    finalize();
                                                    return;
                                                }
                                                for (_i = 0, _len = result.length; _i < _len; _i++) {
                                                    item = result[_i];
                                                    lastScope = insert(++next, item, false);
                                                }
                                                console.log("appended: " + result.length + " buffer size " + buffer.length + " first " + first + " next " + next);
                                                finalize();
                                                return lastScope.$watch('adjustBuffer', function() {
                                                    return adjustBuffer();
                                                });
                                            });
                                        }
                                    } else {
                                        if (buffer.length && !shouldLoadTop()) {
                                            return finalize();
                                        } else {
                                            return datasource.get(first - bufferSize, bufferSize, function(result) {
                                                var item, _i, _len, _ref;
                                                clipBottom();
                                                if (result.length === 0) {
                                                    bof = true;
                                                    console.log("prepended: requested " + bufferSize + " records starting from " + (first - bufferSize) + " recieved: eof");
                                                    finalize();
                                                    return;
                                                }
                                                _ref = result.reverse();
                                                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                                                    item = _ref[_i];
                                                    lastScope = insert(first--, item, true);
                                                }
                                                first -= result.length;
                                                console.log("prepended " + result.length + " buffer size " + buffer.length + " first " + first + " next " + next);
                                                finalize();
                                                return lastScope.$watch('adjustBuffer', function() {
                                                    return adjustBuffer();
                                                });
                                            });
                                        }
                                    }
                                };
                                viewport.bind('resize', function() {
                                    adjustBuffer();
                                    return $scope.$apply();
                                });
                                viewport.bind('scroll', function() {
                                    adjustBuffer();
                                    return $scope.$apply();
                                });
                                return $scope.$watch(datasource.revision, function() {
                                    return reload();
                                });
                            }
                        ]);
                    };
                }
            };
        }
    ]);
