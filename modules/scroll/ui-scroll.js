'use strict';
/*

 List of used element methods available in JQuery but not in JQuery Lite

 element.before(elem)
 element.height()
 element.outerHeight(true)
 element.height(value) = only for Top/Bottom padding elements
 element.scrollTop()
 element.scrollTop(value)
 */

angular.module('ui.scroll', []).directive('ngScrollViewport', [
		'$log', function() {
			return {
				controller: [
					'$scope', '$element', function(scope, element) {
						return element;
					}
				]
			};
		}
	]).directive('ngScroll', [
		'$log', '$injector', '$rootScope', '$timeout', function(console, $injector, $rootScope, $timeout) {
			return {
				require: ['?^ngScrollViewport'],
				transclude: 'element',
				priority: 1000,
				terminal: true,
				compile: function(elementTemplate, attr, linker) {
					return function($scope, element, $attr, controllers) {
						var adapter, adjustBuffer, adjustRowHeight, bof, bottomVisiblePos, buffer, bufferPadding, bufferSize, clipBottom, clipTop, datasource, datasourceName, enqueueFetch, eof, eventListener, fetch, finalize, first, insert, isDatasource, isLoading, itemName, loading, match, next, pending, reload, removeFromBuffer, resizeHandler, scrollHandler, scrollHeight, shouldLoadBottom, shouldLoadTop, tempScope, topVisiblePos, viewport;
						match = $attr.ngScroll.match(/^\s*(\w+)\s+in\s+(\w+)\s*$/);
						if (!match) {
							throw new Error('Expected ngScroll in form of "item_ in _datasource_" but got "' + $attr.ngScroll + '"');
						}
						itemName = match[1];
						datasourceName = match[2];
						isDatasource = function(datasource) {
							return angular.isObject(datasource) && datasource.get && angular.isFunction(datasource.get);
						};
						datasource = $scope[datasourceName];
						if (!isDatasource(datasource)) {
							datasource = $injector.get(datasourceName);
							if (!isDatasource(datasource)) {
								throw new Error(datasourceName + ' is not a valid datasource');
							}
						}
						bufferSize = Math.max(3, +$attr.bufferSize || 10);
						bufferPadding = function() {
							return viewport.height() * Math.max(0.1, +$attr.padding || 0.1);
						};
						scrollHeight = function(elem) {
							console.log(elem[0].scrollHeight, elem[0].document);
							if( !elem[0].scrollHeight && !elem[0].document ) {
								throw new Error('Could not determine scrollHeight of your viewport; make sure it has a constrained height (not height:auto)');
							}
							return elem[0].scrollHeight || elem[0].document.documentElement.scrollHeight;
						};
						adapter = null;
						linker(tempScope = $scope.$new(), function(template) {
							var bottomPadding, createPadding, padding, repeaterType, topPadding, viewport;
							repeaterType = template[0].localName;
							if (repeaterType === 'dl') {
								throw new Error('ng-scroll directive does not support <' + template[0].localName + '> as a repeating tag: ' + template[0].outerHTML);
							}
							if (repeaterType !== 'li' && repeaterType !== 'tr') {
								repeaterType = 'div';
							}
							viewport = controllers[0] || angular.element(window);
							viewport.css({
								'overflow-y': 'auto',
								'display': 'block'
							});
							padding = function(repeaterType) {
								var div, result, table;
								switch (repeaterType) {
									case 'tr':
										table = angular.element('<table><tr><td><div></div></td></tr></table>');
										div = table.find('div');
										result = table.find('tr');
										result.paddingHeight = function() {
											return div.height.apply(div, arguments);
										};
										return result;
									default:
										result = angular.element('<' + repeaterType + '></' + repeaterType + '>');
										result.paddingHeight = result.height;
										return result;
								}
							};
							createPadding = function(padding, element, direction) {
								element[{
									top: 'before',
									bottom: 'after'
								}[direction]](padding);
								return {
									paddingHeight: function() {
										return padding.paddingHeight.apply(padding, arguments);
									},
									insert: function(element) {
										return padding[{
											top: 'after',
											bottom: 'before'
										}[direction]](element);
									}
								};
							};
							topPadding = createPadding(padding(repeaterType), element, 'top');
							bottomPadding = createPadding(padding(repeaterType), element, 'bottom');
							tempScope.$destroy();
							return adapter = {
								viewport: viewport,
								topPadding: topPadding.paddingHeight,
								bottomPadding: bottomPadding.paddingHeight,
								append: bottomPadding.insert,
								prepend: topPadding.insert,
								bottomDataPos: function() {
									return scrollHeight(viewport) - bottomPadding.paddingHeight();
								},
								topDataPos: function() {
									return topPadding.paddingHeight();
								}
							};
						});
						viewport = adapter.viewport;
						first = 1;
						next = 1;
						buffer = [];
						pending = [];
						eof = false;
						bof = false;
						loading = datasource.loading || function() {};
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
							adapter.topPadding(0);
							adapter.bottomPadding(0);
							pending = [];
							eof = false;
							bof = false;
							return adjustBuffer(false);
						};
						bottomVisiblePos = function() {
							return viewport.scrollTop() + viewport.height();
						};
						topVisiblePos = function() {
							return viewport.scrollTop();
						};
						shouldLoadBottom = function() {
							return !eof && adapter.bottomDataPos() < bottomVisiblePos() + bufferPadding();
						};
						clipBottom = function() {
							var bottomHeight, i, itemHeight, overage, _i, _ref;
							bottomHeight = 0;
							overage = 0;
							for (i = _i = _ref = buffer.length - 1; _ref <= 0 ? _i <= 0 : _i >= 0; i = _ref <= 0 ? ++_i : --_i) {
								itemHeight = buffer[i].element.outerHeight(true);
								if (adapter.bottomDataPos() - bottomHeight - itemHeight > bottomVisiblePos() + bufferPadding()) {
									bottomHeight += itemHeight;
									overage++;
									eof = false;
								} else {
									break;
								}
							}
							if (overage > 0) {
								adapter.bottomPadding(adapter.bottomPadding() + bottomHeight);
								removeFromBuffer(buffer.length - overage, buffer.length);
								next -= overage;
								return console.log('clipped off bottom ' + overage + ' bottom padding ' + (adapter.bottomPadding()));
							}
						};
						shouldLoadTop = function() {
							return !bof && (adapter.topDataPos() > topVisiblePos() - bufferPadding());
						};
						clipTop = function() {
							var item, itemHeight, overage, topHeight, _i, _len;
							topHeight = 0;
							overage = 0;
							for (_i = 0, _len = buffer.length; _i < _len; _i++) {
								item = buffer[_i];
								itemHeight = item.element.outerHeight(true);
								if (adapter.topDataPos() + topHeight + itemHeight < topVisiblePos() - bufferPadding()) {
									topHeight += itemHeight;
									overage++;
									bof = false;
								} else {
									break;
								}
							}
							if (overage > 0) {
								adapter.topPadding(adapter.topPadding() + topHeight);
								removeFromBuffer(0, overage);
								first += overage;
								return console.log('clipped off top ' + overage + ' top padding ' + (adapter.topPadding()));
							}
						};
						enqueueFetch = function(direction, scrolling) {
							if (!isLoading) {
								isLoading = true;
								loading(true);
							}
							if (pending.push(direction) === 1) {
								return fetch(scrolling);
							}
						};
						insert = function(index, item) {
							var itemScope, toBeAppended, wrapper;
							itemScope = $scope.$new();
							itemScope[itemName] = item;
							toBeAppended = index > first;
							itemScope.$index = index;
							if (toBeAppended) {
								itemScope.$index--;
							}
							wrapper = {
								scope: itemScope
							};
							linker(itemScope, function(clone) {
								wrapper.element = clone;
								if (toBeAppended) {
									if (index === next) {
										adapter.append(clone);
										return buffer.push(wrapper);
									} else {
										buffer[index - first].element.after(clone);
										return buffer.splice(index - first + 1, 0, wrapper);
									}
								} else {
									adapter.prepend(clone);
									return buffer.unshift(wrapper);
								}
							});
							return {
								appended: toBeAppended,
								wrapper: wrapper
							};
						};
						adjustRowHeight = function(appended, wrapper) {
							var newHeight;
							if (appended) {
								return adapter.bottomPadding(Math.max(0, adapter.bottomPadding() - wrapper.element.outerHeight(true)));
							} else {
								newHeight = adapter.topPadding() - wrapper.element.outerHeight(true);
								if (newHeight >= 0) {
									return adapter.topPadding(newHeight);
								} else {
									return viewport.scrollTop(viewport.scrollTop() + wrapper.element.outerHeight(true));
								}
							}
						};
						adjustBuffer = function(scrolling, newItems, finalize) {
							var doAdjustment;
							doAdjustment = function() {
								console.log('top {actual=' + (adapter.topDataPos()) + ' visible from=' + (topVisiblePos()) + ' bottom {visible through=' + (bottomVisiblePos()) + ' actual=' + (adapter.bottomDataPos()) + '}');
								if (shouldLoadBottom()) {
									enqueueFetch(true, scrolling);
								} else {
									if (shouldLoadTop()) {
										enqueueFetch(false, scrolling);
									}
								}
								if (finalize) {
									return finalize();
								}
							};
							if (newItems) {
								return $timeout(function() {
									var row, _i, _len;
									for (_i = 0, _len = newItems.length; _i < _len; _i++) {
										row = newItems[_i];
										adjustRowHeight(row.appended, row.wrapper);
									}
									return doAdjustment();
								});
							} else {
								return doAdjustment();
							}
						};
						finalize = function(scrolling, newItems) {
							return adjustBuffer(scrolling, newItems, function() {
								pending.shift();
								if (pending.length === 0) {
									isLoading = false;
									return loading(false);
								} else {
									return fetch(scrolling);
								}
							});
						};
						fetch = function(scrolling) {
							var direction;
							direction = pending[0];
							if (direction) {
								if (buffer.length && !shouldLoadBottom()) {
									return finalize(scrolling);
								} else {
									return datasource.get(next, bufferSize, function(result) {
										var item, newItems, _i, _len;
										newItems = [];
										if (result.length === 0) {
											eof = true;
											adapter.bottomPadding(0);
											console.log('appended: requested ' + bufferSize + ' records starting from ' + next + ' recieved: eof');
										} else {
											clipTop();
											for (_i = 0, _len = result.length; _i < _len; _i++) {
												item = result[_i];
												newItems.push(insert(++next, item));
											}
											console.log('appended: requested ' + bufferSize + ' received ' + result.length + ' buffer size ' + buffer.length + ' first ' + first + ' next ' + next);
										}
										return finalize(scrolling, newItems);
									});
								}
							} else {
								if (buffer.length && !shouldLoadTop()) {
									return finalize(scrolling);
								} else {
									return datasource.get(first - bufferSize, bufferSize, function(result) {
										var i, newItems, _i, _ref;
										newItems = [];
										if (result.length === 0) {
											bof = true;
											adapter.topPadding(0);
											console.log('prepended: requested ' + bufferSize + ' records starting from ' + (first - bufferSize) + ' recieved: bof');
										} else {
											clipBottom();
											for (i = _i = _ref = result.length - 1; _ref <= 0 ? _i <= 0 : _i >= 0; i = _ref <= 0 ? ++_i : --_i) {
												newItems.unshift(insert(--first, result[i]));
											}
											console.log('prepended: requested ' + bufferSize + ' received ' + result.length + ' buffer size ' + buffer.length + ' first ' + first + ' next ' + next);
										}
										return finalize(scrolling, newItems);
									});
								}
							}
						};
						resizeHandler = function() {
							if (!$rootScope.$$phase && !isLoading) {
								adjustBuffer(false);
								return $scope.$apply();
							}
						};
						viewport.bind('resize', resizeHandler);
						scrollHandler = function() {
							if (!$rootScope.$$phase && !isLoading) {
								adjustBuffer(true);
								return $scope.$apply();
							}
						};
						viewport.bind('scroll', scrollHandler);
						$scope.$watch(datasource.revision, function() {
							return reload();
						});
						if (datasource.scope) {
							eventListener = datasource.scope.$new();
						} else {
							eventListener = $scope.$new();
						}
						$scope.$on('$destroy', function() {
							eventListener.$destroy();
							viewport.unbind('resize', resizeHandler);
							return viewport.unbind('scroll', scrollHandler);
						});
						eventListener.$on('update.items', function(event, locator, newItem) {
							var wrapper, _fn, _i, _len, _ref;
							if (angular.isFunction(locator)) {
								_fn = function(wrapper) {
									return locator(wrapper.scope);
								};
								for (_i = 0, _len = buffer.length; _i < _len; _i++) {
									wrapper = buffer[_i];
									_fn(wrapper);
								}
							} else {
								if ((0 <= (_ref = locator - first - 1) && _ref < buffer.length)) {
									buffer[locator - first - 1].scope[itemName] = newItem;
								}
							}
							return null;
						});
						eventListener.$on('delete.items', function(event, locator) {
							var i, item, temp, wrapper, _fn, _i, _j, _k, _len, _len1, _len2, _ref;
							if (angular.isFunction(locator)) {
								temp = [];
								for (_i = 0, _len = buffer.length; _i < _len; _i++) {
									item = buffer[_i];
									temp.unshift(item);
								}
								_fn = function(wrapper) {
									if (locator(wrapper.scope)) {
										removeFromBuffer(temp.length - 1 - i, temp.length - i);
										return next--;
									}
								};
								for (i = _j = 0, _len1 = temp.length; _j < _len1; i = ++_j) {
									wrapper = temp[i];
									_fn(wrapper);
								}
							} else {
								if ((0 <= (_ref = locator - first - 1) && _ref < buffer.length)) {
									removeFromBuffer(locator - first - 1, locator - first);
									next--;
								}
							}
							for (i = _k = 0, _len2 = buffer.length; _k < _len2; i = ++_k) {
								item = buffer[i];
								item.scope.$index = first + i;
							}
							return adjustBuffer(false);
						});
						return eventListener.$on('insert.item', function(event, locator, item) {
							var i, inserted, temp, wrapper, _fn, _i, _j, _k, _len, _len1, _len2, _ref;
							inserted = [];
							if (angular.isFunction(locator)) {
								temp = [];
								for (_i = 0, _len = buffer.length; _i < _len; _i++) {
									item = buffer[_i];
									temp.unshift(item);
								}
								_fn = function(wrapper) {
									var j, newItems, _k, _len2, _results;
									if (newItems = locator(wrapper.scope)) {
										insert = function(index, newItem) {
											insert(index, newItem);
											return next++;
										};
										if (angular.isArray(newItems)) {
											_results = [];
											for (j = _k = 0, _len2 = newItems.length; _k < _len2; j = ++_k) {
												item = newItems[j];
												_results.push(inserted.push(insert(i + j, item)));
											}
											return _results;
										} else {
											return inserted.push(insert(i, newItems));
										}
									}
								};
								for (i = _j = 0, _len1 = temp.length; _j < _len1; i = ++_j) {
									wrapper = temp[i];
									_fn(wrapper);
								}
							} else {
								if ((0 <= (_ref = locator - first - 1) && _ref < buffer.length)) {
									inserted.push(insert(locator, item));
									next++;
								}
							}
							for (i = _k = 0, _len2 = buffer.length; _k < _len2; i = ++_k) {
								item = buffer[i];
								item.scope.$index = first + i;
							}
							return adjustBuffer(false, inserted);
						});
					};
				}
			};
		}
	]);
