/*
 globals: angular, window

 List of used element methods available in JQuery but not in JQuery Lite

 element.before(elem)
 element.height()
 element.outerHeight(true)
 element.height(value) = only for Top/Bottom padding elements
 element.scrollTop()
 element.scrollTop(value)
 */
angular.module('ui.scroll', []).directive('uiScrollViewport', [
	'$log', function() {
		'use strict';

		return {
			controller: [
				'$scope', '$element', function(scope, element) {
					this.viewport = element;
					return this;
				}
			]
		};
	}
]).directive('uiScroll', [
	'$log', '$injector', '$rootScope', '$timeout', function(console, $injector, $rootScope, $timeout) {
		'use strict';

		return {
			require: ['?^uiScrollViewport'],
			transclude: 'element',
			priority: 1000,
			terminal: true,
			compile: function(elementTemplate, attr, linker) {
				return function($scope, element, $attr, controllers) {
					var adapter, adapterOnScope, adjustBuffer, adjustRowHeight, applyUpdate, bof, bottomVisiblePos, buffer, bufferPadding, bufferSize, builder, clipBottom, clipTop, datasource, datasourceName, doAdjustment, doDelete, doInsert, doUpdate, enqueueFetch, eof, eventListener, fetch, finalize, first, getValueChain, hideElementBeforeAppend, insert, isDatasourceValid, itemName, loading, log, match, next, pending, reload, removeFromBuffer, resizeAndScrollHandler, ridActual, scrollHeight, setValueChain, shouldLoadBottom, shouldLoadTop, showElementAfterRender, topVisible, topVisiblePos, viewport, viewportScope, wheelHandler;
					log = console.debug || console.log;
					match = $attr.uiScroll.match(/^\s*(\w+)\s+in\s+([\w\.]+)\s*$/);
					if (!match) {
						throw new Error('Expected uiScroll in form of \'_item_ in _datasource_\' but got \'' + $attr.uiScroll + '\'');
					}
					itemName = match[1];
					datasourceName = match[2];
					getValueChain = function(targetScope, target) {
						var chain;
						if (!targetScope) {
							return;
						}
						chain = target.match(/^([\w]+)\.(.+)$/);
						if (!chain || chain.length !== 3) {
							return targetScope[target];
						}
						return getValueChain(targetScope[chain[1]], chain[2]);
					};
					setValueChain = function(targetScope, target, value, doNotSet) {
						var chain;
						if (!targetScope || !target) {
							return;
						}
						if (!(chain = target.match(/^([\w]+)\.(.+)$/))) {
							if (target.indexOf('.') !== -1) {
								return;
							}
						}
						if (!chain || chain.length !== 3) {
							if (!angular.isObject(targetScope[target]) && !doNotSet) {
								return targetScope[target] = value;
							}
							return targetScope[target] = value;
						}
						if (!angular.isObject(targetScope[chain[1]]) && !doNotSet) {
							targetScope[chain[1]] = {};
						}
						return setValueChain(targetScope[chain[1]], chain[2], value, doNotSet);
					};
					datasource = getValueChain($scope, datasourceName);
					isDatasourceValid = function() {
						return angular.isObject(datasource) && typeof datasource.get === 'function';
					};
					if (!isDatasourceValid()) {
						datasource = $injector.get(datasourceName);
						if (!isDatasourceValid()) {
							throw new Error(datasourceName + ' is not a valid datasource');
						}
					}
					bufferSize = Math.max(3, +$attr.bufferSize || 10);
					bufferPadding = function() {
						return viewport.outerHeight() * Math.max(0.1, +$attr.padding || 0.1);
					};
					scrollHeight = function(elem) {
						var ref;
						return (ref = elem[0].scrollHeight) != null ? ref : elem[0].document.documentElement.scrollHeight;
					};
					builder = null;
					linker($scope.$new(), function(template) {
						var bottomPadding, createPadding, padding, repeaterType, topPadding, viewport;
						repeaterType = template[0].localName;
						if (repeaterType === 'dl') {
							throw new Error('ui-scroll directive does not support <' + template[0].localName + '> as a repeating tag: ' + template[0].outerHTML);
						}
						if (repeaterType !== 'li' && repeaterType !== 'tr') {
							repeaterType = 'div';
						}
						viewport = controllers[0] && controllers[0].viewport ? controllers[0].viewport : angular.element(window);
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
						$scope.$on('$destroy', function() {
							return template.remove();
						});
						return builder = {
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
					viewport = builder.viewport;
					viewportScope = viewport.scope() || $rootScope;
					topVisible = function(item) {
						adapter.topVisible = item.scope[itemName];
						adapter.topVisibleElement = item.element;
						adapter.topVisibleScope = item.scope;
						if ($attr.topVisible) {
							setValueChain(viewportScope, $attr.topVisible, adapter.topVisible);
						}
						if ($attr.topVisibleElement) {
							setValueChain(viewportScope, $attr.topVisibleElement, adapter.topVisibleElement);
						}
						if ($attr.topVisibleScope) {
							setValueChain(viewportScope, $attr.topVisibleScope, adapter.topVisibleScope);
						}
						if (typeof datasource.topVisible === 'function') {
							return datasource.topVisible(item);
						}
					};
					loading = function(value) {
						adapter.isLoading = value;
						if ($attr.isLoading) {
							setValueChain($scope, $attr.isLoading, value);
						}
						if (typeof datasource.loading === 'function') {
							return datasource.loading(value);
						}
					};
					ridActual = 0;
					first = 1;
					next = 1;
					buffer = [];
					pending = [];
					eof = false;
					bof = false;
					removeFromBuffer = function(start, stop) {
						var i, j, ref, ref1;
						for (i = j = ref = start, ref1 = stop; ref <= ref1 ? j < ref1 : j > ref1; i = ref <= ref1 ? ++j : --j) {
							buffer[i].scope.$destroy();
							buffer[i].element.remove();
						}
						return buffer.splice(start, stop - start);
					};
					reload = function() {
						ridActual++;
						first = 1;
						next = 1;
						removeFromBuffer(0, buffer.length);
						builder.topPadding(0);
						builder.bottomPadding(0);
						pending = [];
						eof = false;
						bof = false;
						return adjustBuffer(ridActual);
					};
					bottomVisiblePos = function() {
						return viewport.scrollTop() + viewport.outerHeight();
					};
					topVisiblePos = function() {
						return viewport.scrollTop();
					};
					shouldLoadBottom = function() {
						return !eof && builder.bottomDataPos() < bottomVisiblePos() + bufferPadding();
					};
					clipBottom = function() {
						var bottomHeight, i, item, itemHeight, itemTop, j, newRow, overage, ref, rowTop;
						bottomHeight = 0;
						overage = 0;
						for (i = j = ref = buffer.length - 1; ref <= 0 ? j <= 0 : j >= 0; i = ref <= 0 ? ++j : --j) {
							item = buffer[i];
							itemTop = item.element.offset().top;
							newRow = rowTop !== itemTop;
							rowTop = itemTop;
							if (newRow) {
								itemHeight = item.element.outerHeight(true);
							}
							if (builder.bottomDataPos() - bottomHeight - itemHeight > bottomVisiblePos() + bufferPadding()) {
								if (newRow) {
									bottomHeight += itemHeight;
								}
								overage++;
								eof = false;
							} else {
								if (newRow) {
									break;
								}
								overage++;
							}
						}
						if (overage > 0) {
							builder.bottomPadding(builder.bottomPadding() + bottomHeight);
							removeFromBuffer(buffer.length - overage, buffer.length);
							return next -= overage;
						}
					};
					shouldLoadTop = function() {
						return !bof && (builder.topDataPos() > topVisiblePos() - bufferPadding());
					};
					clipTop = function() {
						var item, itemHeight, itemTop, j, len, newRow, overage, rowTop, topHeight;
						topHeight = 0;
						overage = 0;
						for (j = 0, len = buffer.length; j < len; j++) {
							item = buffer[j];
							itemTop = item.element.offset().top;
							newRow = rowTop !== itemTop;
							rowTop = itemTop;
							if (newRow) {
								itemHeight = item.element.outerHeight(true);
							}
							if (builder.topDataPos() + topHeight + itemHeight < topVisiblePos() - bufferPadding()) {
								if (newRow) {
									topHeight += itemHeight;
								}
								overage++;
								bof = false;
							} else {
								if (newRow) {
									break;
								}
								overage++;
							}
						}
						if (overage > 0) {
							builder.topPadding(builder.topPadding() + topHeight);
							removeFromBuffer(0, overage);
							return first += overage;
						}
					};
					enqueueFetch = function(rid, direction) {
						if (!adapter.isLoading) {
							loading(true);
						}
						if (pending.push(direction) === 1) {
							return fetch(rid);
						}
					};
					hideElementBeforeAppend = function(element) {
						element.displayTemp = element.css('display');
						return element.css('display', 'none');
					};
					showElementAfterRender = function(element) {
						if (element.hasOwnProperty('displayTemp')) {
							return element.css('display', element.displayTemp);
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
									hideElementBeforeAppend(clone);
									builder.append(clone);
									return buffer.push(wrapper);
								} else {
									buffer[index - first].element.after(clone);
									return buffer.splice(index - first + 1, 0, wrapper);
								}
							} else {
								hideElementBeforeAppend(clone);
								builder.prepend(clone);
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
							return builder.bottomPadding(Math.max(0, builder.bottomPadding() - wrapper.element.outerHeight(true)));
						} else {
							newHeight = builder.topPadding() - wrapper.element.outerHeight(true);
							if (newHeight >= 0) {
								return builder.topPadding(newHeight);
							} else {
								return viewport.scrollTop(viewport.scrollTop() + wrapper.element.outerHeight(true));
							}
						}
					};
					doAdjustment = function(rid, finalize) {
						var item, itemHeight, itemTop, j, len, newRow, results, rowTop, topHeight;
						if (shouldLoadBottom()) {
							enqueueFetch(rid, true);
						} else {
							if (shouldLoadTop()) {
								enqueueFetch(rid, false);
							}
						}
						if (finalize) {
							finalize(rid);
						}
						if (pending.length === 0) {
							topHeight = 0;
							results = [];
							for (j = 0, len = buffer.length; j < len; j++) {
								item = buffer[j];
								itemTop = item.element.offset().top;
								newRow = rowTop !== itemTop;
								rowTop = itemTop;
								if (newRow) {
									itemHeight = item.element.outerHeight(true);
								}
								if (newRow && (builder.topDataPos() + topHeight + itemHeight < topVisiblePos())) {
									results.push(topHeight += itemHeight);
								} else {
									if (newRow) {
										topVisible(item);
									}
									break;
								}
							}
							return results;
						}
					};
					adjustBuffer = function(rid, newItems, finalize) {
						if (newItems && newItems.length) {
							return $timeout(function() {
								var elt, itemTop, j, k, len, len1, row, rowTop, rows;
								rows = [];
								for (j = 0, len = newItems.length; j < len; j++) {
									row = newItems[j];
									elt = row.wrapper.element;
									showElementAfterRender(elt);
									itemTop = elt.offset().top;
									if (rowTop !== itemTop) {
										rows.push(row);
										rowTop = itemTop;
									}
								}
								for (k = 0, len1 = rows.length; k < len1; k++) {
									row = rows[k];
									adjustRowHeight(row.appended, row.wrapper);
								}
								return doAdjustment(rid, finalize);
							});
						} else {
							return doAdjustment(rid, finalize);
						}
					};
					finalize = function(rid, newItems) {
						return adjustBuffer(rid, newItems, function() {
							pending.shift();
							if (pending.length === 0) {
								return loading(false);
							} else {
								return fetch(rid);
							}
						});
					};
					fetch = function(rid) {
						var direction;
						direction = pending[0];
						if (direction) {
							if (buffer.length && !shouldLoadBottom()) {
								return finalize(rid);
							} else {
								return datasource.get(next, bufferSize, function(result) {
									var item, j, len, newItems;
									if ((rid && rid !== ridActual) || $scope.$$destroyed) {
										return;
									}
									newItems = [];
									if (result.length < bufferSize) {
										eof = true;
										builder.bottomPadding(0);
									}
									if (result.length > 0) {
										clipTop();
										for (j = 0, len = result.length; j < len; j++) {
											item = result[j];
											newItems.push(insert(++next, item));
										}
									}
									return finalize(rid, newItems);
								});
							}
						} else {
							if (buffer.length && !shouldLoadTop()) {
								return finalize(rid);
							} else {
								return datasource.get(first - bufferSize, bufferSize, function(result) {
									var i, j, newItems, ref;
									if ((rid && rid !== ridActual) || $scope.$$destroyed) {
										return;
									}
									newItems = [];
									if (result.length < bufferSize) {
										bof = true;
										builder.topPadding(0);
									}
									if (result.length > 0) {
										if (buffer.length) {
											clipBottom();
										}
										for (i = j = ref = result.length - 1; ref <= 0 ? j <= 0 : j >= 0; i = ref <= 0 ? ++j : --j) {
											newItems.unshift(insert(--first, result[i]));
										}
									}
									return finalize(rid, newItems);
								});
							}
						}
					};
					resizeAndScrollHandler = function() {
						if (!$rootScope.$$phase && !adapter.isLoading) {
							adjustBuffer();
							return $scope.$apply();
						}
					};
					wheelHandler = function(event) {
						var scrollTop, yMax;
						scrollTop = viewport[0].scrollTop;
						yMax = viewport[0].scrollHeight - viewport[0].clientHeight;
						if ((scrollTop === 0 && !bof) || (scrollTop === yMax && !eof)) {
							return event.preventDefault();
						}
					};
					viewport.bind('resize', resizeAndScrollHandler);
					viewport.bind('scroll', resizeAndScrollHandler);
					viewport.bind('mousewheel', wheelHandler);
					$scope.$watch(datasource.revision, reload);
					if (datasource.scope) {
						eventListener = datasource.scope.$new();
					} else {
						eventListener = $scope.$new();
					}
					$scope.$on('$destroy', function() {
						var item, j, len;
						for (j = 0, len = buffer.length; j < len; j++) {
							item = buffer[j];
							item.scope.$destroy();
							item.element.remove();
						}
						viewport.unbind('resize', resizeAndScrollHandler);
						viewport.unbind('scroll', resizeAndScrollHandler);
						return viewport.unbind('mousewheel', wheelHandler);
					});
					adapter = {};
					adapter.isLoading = false;
					applyUpdate = function(wrapper, newItems) {
						var i, inserted, item, j, k, l, len, len1, len2, ndx, newItem, oldItemNdx;
						inserted = [];
						if (angular.isArray(newItems)) {
							if (newItems.length) {
								if (newItems.length === 1 && newItems[0] === wrapper.scope[itemName]) {
									return inserted;
								} else {
									ndx = wrapper.scope.$index;
									if (ndx > first) {
										oldItemNdx = ndx - first;
									} else {
										oldItemNdx = 1;
									}
									for (i = j = 0, len = newItems.length; j < len; i = ++j) {
										newItem = newItems[i];
										inserted.push(insert(ndx + i, newItem));
									}
									removeFromBuffer(oldItemNdx, oldItemNdx + 1);
									for (i = k = 0, len1 = buffer.length; k < len1; i = ++k) {
										item = buffer[i];
										item.scope.$index = first + i;
									}
								}
							} else {
								removeFromBuffer(wrapper.scope.$index - first, wrapper.scope.$index - first + 1);
								next--;
								for (i = l = 0, len2 = buffer.length; l < len2; i = ++l) {
									item = buffer[i];
									item.scope.$index = first + i;
								}
							}
						}
						return inserted;
					};
					adapter.applyUpdates = function(arg1, arg2) {
						var inserted, j, len, ref, ref1, wrapper;
						inserted = [];
						ridActual++;
						if (angular.isFunction(arg1)) {
							ref = buffer.slice(0);
							for (j = 0, len = ref.length; j < len; j++) {
								wrapper = ref[j];
								inserted = inserted.concat(inserted, applyUpdate(wrapper, arg1(wrapper.scope[itemName], wrapper.scope, wrapper.element)));
							}
						} else {
							if (arg1 % 1 === 0) {
								if ((0 <= (ref1 = arg1 - first) && ref1 < buffer.length)) {
									inserted = applyUpdate(buffer[arg1 - first], arg2);
								}
							} else {
								throw new Error('applyUpdates - ' + arg1 + ' is not a valid index or outside of range');
							}
						}
						return adjustBuffer(ridActual, inserted);
					};
					if ($attr.adapter) {
						adapterOnScope = getValueChain($scope, $attr.adapter);
						if (!adapterOnScope) {
							setValueChain($scope, $attr.adapter, {});
							adapterOnScope = getValueChain($scope, $attr.adapter);
						}
						angular.extend(adapterOnScope, adapter);
						adapter = adapterOnScope;
					}
					doUpdate = function(locator, newItem) {
						var fn, j, len, ref, wrapper;
						if (angular.isFunction(locator)) {
							fn = function(wrapper) {
								return locator(wrapper.scope);
							};
							for (j = 0, len = buffer.length; j < len; j++) {
								wrapper = buffer[j];
								fn(wrapper);
							}
						} else {
							if ((0 <= (ref = locator - first - 1) && ref < buffer.length)) {
								buffer[locator - first - 1].scope[itemName] = newItem;
							}
						}
						return null;
					};
					doDelete = function(locator) {
						var fn, i, item, j, k, l, len, len1, len2, ref, temp, wrapper;
						if (angular.isFunction(locator)) {
							temp = [];
							for (j = 0, len = buffer.length; j < len; j++) {
								item = buffer[j];
								temp.unshift(item);
							}
							fn = function(wrapper) {
								if (locator(wrapper.scope)) {
									removeFromBuffer(temp.length - 1 - i, temp.length - i);
									return next--;
								}
							};
							for (i = k = 0, len1 = temp.length; k < len1; i = ++k) {
								wrapper = temp[i];
								fn(wrapper);
							}
						} else {
							if ((0 <= (ref = locator - first - 1) && ref < buffer.length)) {
								removeFromBuffer(locator - first - 1, locator - first);
								next--;
							}
						}
						for (i = l = 0, len2 = buffer.length; l < len2; i = ++l) {
							item = buffer[i];
							item.scope.$index = first + i;
						}
						return adjustBuffer();
					};
					doInsert = function(locator, item) {
						var i, inserted, j, len, ref;
						inserted = [];
						if (angular.isFunction(locator)) {
							throw new Error('not implemented - Insert with locator function');
						} else {
							if ((0 <= (ref = locator - first - 1) && ref < buffer.length)) {
								inserted.push(insert(locator, item));
								next++;
							}
						}
						for (i = j = 0, len = buffer.length; j < len; i = ++j) {
							item = buffer[i];
							item.scope.$index = first + i;
						}
						return adjustBuffer(null, inserted);
					};
					eventListener.$on('insert.item', function(event, locator, item) {
						return doInsert(locator, item);
					});
					eventListener.$on('update.items', function(event, locator, newItem) {
						return doUpdate(locator, newItem);
					});
					return eventListener.$on('delete.items', function(event, locator) {
						return doDelete(locator);
					});
				};
			}
		};
	}
]);


/*
 //# sourceURL=src/scripts/ui-scroll.js
 */
