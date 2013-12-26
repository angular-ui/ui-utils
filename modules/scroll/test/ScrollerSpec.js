/*global describe, beforeEach, module, inject, it, spyOn, expect, $ */
describe('uiScroll', function () {
	'use strict';

	angular.module('ui.scroll.test', [])
		.factory('myEmptyDatasource', [
			function() {
				var get = function(index, count, success) {
					success([]);
				};

				return {
					get: get
				};
			}
		])

		.factory('myOnePageDatasource', [
			function() {
				var get = function(index, count, success) {
					if (index === 1) {
						success(['one', 'two', 'three']);
					} else {
						success([]);
					}
				};

				return {
					get: get
				};
			}
		])

		.factory('myMultipageDatasource', [
			function() {
				var get = function(index, count, success) {
					var result = [];
					for (var i = index; i<index+count; i++) {
						if (i>0 && i<=20) {
							result.push('item' + i);
						}
					}
					success(result);
				};

				return {
					get: get
				};
			}
		]);

	beforeEach(module('ui.scroll'));
	beforeEach(module('ui.scroll.test'));

	var runTest = function(html, runTest, cleanupTest) {
		inject(function($rootScope, $compile, $window, $timeout) {
				var scroller = angular.element(html);
				var scope = $rootScope.$new();
				var sandbox = angular.element('<div/>');
				angular.element(document).find('body').append(sandbox);
				sandbox.append(scroller);
				$compile(scroller)(scope);
				scope.$apply();
				$timeout.flush();

				runTest($window, sandbox);

				sandbox.remove();
				scope.$destroy();

				if (cleanupTest) {
					cleanupTest($window, scope);
				}
			}
		);
	};

	describe('basic setup', function() {
			var html = '<div ng-scroll="item in myEmptyDatasource">{{$index}}: {{item}}</div>';

			it('should bind to window scroll and resize events and unbind upon scope destroy', function(){
				spyOn($.fn, 'bind').andCallThrough();
				spyOn($.fn, 'unbind').andCallThrough();
				runTest(html,
					function($window) {
						expect($.fn.bind.calls.length).toBe(2);
						expect($.fn.bind.calls[0].args[0]).toBe('resize');
						expect($.fn.bind.calls[0].object[0]).toBe($window);
						expect($.fn.bind.calls[1].args[0]).toBe('scroll');
						expect($.fn.bind.calls[1].object[0]).toBe($window);
						expect($._data($window, 'events')).toBeDefined();
					},
					function($window) {
						expect($.fn.unbind.calls.length).toBe(2);
						expect($.fn.unbind.calls[0].args[0]).toBe('resize');
						expect($.fn.unbind.calls[0].object[0]).toBe($window);
						expect($.fn.unbind.calls[1].args[0]).toBe('scroll');
						expect($.fn.unbind.calls[1].object[0]).toBe($window);
					}
				);
			});

			it('should create 2 divs of 0 height', function() {
				runTest(html,
					function($window, sandbox) {
						expect(sandbox.children().length).toBe(2);

						var topPadding = sandbox.children()[0];
						expect(topPadding.tagName.toLowerCase()).toBe('div');
						expect(angular.element(topPadding).css('height')).toBe('0px');

						var bottomPadding = sandbox.children()[1];
						expect(bottomPadding.tagName.toLowerCase()).toBe('div');
						expect(angular.element(bottomPadding).css('height')).toBe('0px');

					}
				);
			});

			it('should call get on the datasource 1 time ', function() {
				var spy;
				inject(function(myEmptyDatasource){
					spy = spyOn(myEmptyDatasource, 'get').andCallThrough();
				});
				runTest(html,
					function() {
						expect(spy.calls.length).toBe(2);
						expect(spy.calls[0].args[0]).toBe(1);
						expect(spy.calls[1].args[0]).toBe(-9);

					}
				);
			});
		}
	);

	describe('datasource with only 3 elements', function () {

		var html = '<div ng-scroll="item in myOnePageDatasource">{{$index}}: {{item}}</div>';

		it('should create 3 divs with data (+ 2 padding divs)', function() {
			runTest(html,
				function($window, sandbox) {
					expect(sandbox.children().length).toBe(5);

					var row1 = sandbox.children()[1];
					expect(row1.tagName.toLowerCase()).toBe('div');
					expect(row1.innerHTML).toBe('1: one');

					var row2 = sandbox.children()[2];
					expect(row2.tagName.toLowerCase()).toBe('div');
					expect(row2.innerHTML).toBe('2: two');

					var row3 = sandbox.children()[3];
					expect(row3.tagName.toLowerCase()).toBe('div');
					expect(row3.innerHTML).toBe('3: three');
				}
			);
		});

		it('should call get on the datasource 3 times ', function() {
			var spy;
			inject(function(myOnePageDatasource){
				spy = spyOn(myOnePageDatasource, 'get').andCallThrough();
				runTest(html,
					function() {
						expect(spy.calls.length).toBe(3);

						expect(spy.calls[0].args[0]).toBe(1);  // gets 3 rows
						expect(spy.calls[1].args[0]).toBe(4);  // gets eof
						expect(spy.calls[2].args[0]).toBe(-9); // gets bof
					});
			});

		});
	});

	describe('datasource with 20 elements default buffer size (10) - constrained viewport', function () {

		var html = '<div ng-scroll-viewport style="height:200px"><div style="height:40px" ng-scroll="item in myMultipageDatasource" buffer-size="3">{{$index}}: {{item}}</div></div>';

		it('should create 6 divs with data (+ 2 padding divs)', function() {
			runTest(html,
				function($window, sandbox) {
					var scroller = sandbox.children();
					expect(scroller.children().length).toBe(8);
					expect(scroller.scrollTop()).toBe(0);
					expect(scroller.children().css('height')).toBe('0px');
					expect(angular.element(scroller.children()[7]).css('height')).toBe('0px');

					for (var i = 1; i< 7; i++) {
						var row = scroller.children()[i];
						expect(row.tagName.toLowerCase()).toBe('div');
						expect(row.innerHTML).toBe(i + ': item' + i);
					}

				}
			);
		});

		it('should call get on the datasource 3 times ', function() {
			var spy;
			inject(function(myMultipageDatasource){
				spy = spyOn(myMultipageDatasource, 'get').andCallThrough();
			});
			runTest(html,
				function() {
					expect(spy.calls.length).toBe(3);

					expect(spy.calls[0].args[0]).toBe(1);
					expect(spy.calls[1].args[0]).toBe(4);
					expect(spy.calls[2].args[0]).toBe(-2);

				}
			);
		});

		it('should create 3 more divs (9 divs total) with data (+ 2 padding divs)', function() {
			runTest(html,
				function($window, sandbox) {
					var scroller = sandbox.children();
					scroller.scrollTop(100);
					scroller.trigger('scroll');
					inject(function($timeout){
						$timeout.flush();
						expect(scroller.children().length).toBe(11);
						expect(scroller.scrollTop()).toBe(40);
						expect(scroller.children().css('height')).toBe('0px');
						expect(angular.element(scroller.children()[10]).css('height')).toBe('0px');

						for (var i = 1; i< 10; i++) {
							var row = scroller.children()[i];
							expect(row.tagName.toLowerCase()).toBe('div');
							expect(row.innerHTML).toBe(i + ': item' + i);
						}
					});

				}
			);
		});

		it('should call get on the datasource 1 extra time (4 total) ', function() {
			var spy;
			inject(function(myMultipageDatasource){
				spy = spyOn(myMultipageDatasource, 'get').andCallThrough();
			});
			runTest(html,
				function($window, sandbox) {
					var scroller = sandbox.children();
					scroller.scrollTop(100);
					scroller.trigger('scroll');
					expect(spy.calls.length).toBe(4);

					expect(spy.calls[0].args[0]).toBe(1);
					expect(spy.calls[1].args[0]).toBe(4);
					expect(spy.calls[2].args[0]).toBe(-2);
					expect(spy.calls[3].args[0]).toBe(7);

				}
			);
		});

		it('should clip 3 divs from the top and add 3 more divs to the bottom (9 divs total) (+ 2 padding divs)', function() {
			runTest(html,
				function($window, sandbox) {
					var flush;
					inject(function($timeout){flush = $timeout.flush;});
					var scroller = sandbox.children();

					scroller.scrollTop(100);
					scroller.trigger('scroll');
					flush();
					scroller.scrollTop(400);
					scroller.trigger('scroll');
					flush();

					expect(scroller.children().length).toBe(11);
					expect(scroller.scrollTop()).toBe(160);
					expect(scroller.children().css('height')).toBe('120px');
					expect(angular.element(scroller.children()[10]).css('height')).toBe('0px');

					for (var i = 1; i< 10; i++) {
						var row = scroller.children()[i];
						expect(row.tagName.toLowerCase()).toBe('div');
						expect(row.innerHTML).toBe((i+3) + ': item' + (i+3));
					}

				}
			);
		});

		it('should call get on the datasource 1 more time (4 total) ', function() {
			var flush;
			inject(function($timeout){flush = $timeout.flush;});
			var spy;
			inject(function(myMultipageDatasource){
				spy = spyOn(myMultipageDatasource, 'get').andCallThrough();
			});
			runTest(html,
				function($window, sandbox) {
					var scroller = sandbox.children();
					scroller.scrollTop(100);
					scroller.trigger('scroll');
					flush();
					scroller.scrollTop(400);
					scroller.trigger('scroll');
					flush();

					expect(spy.calls.length).toBe(5);
					expect(spy.calls[0].args[0]).toBe(1);
					expect(spy.calls[1].args[0]).toBe(4);
					expect(spy.calls[2].args[0]).toBe(-2);
					expect(spy.calls[3].args[0]).toBe(7);
					expect(spy.calls[4].args[0]).toBe(10);

				}
			);
		});

		it('should re-add 3 divs at the top and clip 3 divs from the bottom (9 divs total) (+ 2 padding divs)', function() {
			var flush;
			inject(function($timeout){flush = $timeout.flush;});
			runTest(html,
				function($window, sandbox) {
					var scroller = sandbox.children();
					scroller.scrollTop(100);
					scroller.trigger('scroll');
					flush();
					scroller.scrollTop(400);
					scroller.trigger('scroll');
					flush();
					scroller.scrollTop(0);
					scroller.trigger('scroll');
					flush();

					expect(scroller.children().length).toBe(8);
					expect(scroller.scrollTop()).toBe(0);
					expect(scroller.children().css('height')).toBe('0px');
					expect(angular.element(scroller.children()[7]).css('height')).toBe('240px');

					for (var i = 1; i< 7; i++) {
						var row = scroller.children()[i];
						expect(row.tagName.toLowerCase()).toBe('div');
						expect(row.innerHTML).toBe((i) + ': item' + (i));
					}

				}
			);
		});

		it('should call get on the datasource 1 more time (4 total) ', function() {
			var spy;
			inject(function(myMultipageDatasource){
				spy = spyOn(myMultipageDatasource, 'get').andCallThrough();
			});
			var flush;
			inject(function($timeout){flush = $timeout.flush;});
			runTest(html,
				function($window, sandbox) {
					var scroller = sandbox.children();
					scroller.scrollTop(100);
					scroller.trigger('scroll');
					flush();
					scroller.scrollTop(400);
					scroller.trigger('scroll');
					flush();
					scroller.scrollTop(0);
					scroller.trigger('scroll');
					flush();
					expect(spy.calls.length).toBe(7);

					expect(spy.calls[0].args[0]).toBe(1);
					expect(spy.calls[1].args[0]).toBe(4);
					expect(spy.calls[2].args[0]).toBe(-2);
					expect(spy.calls[3].args[0]).toBe(7);
					expect(spy.calls[4].args[0]).toBe(10);
					expect(spy.calls[5].args[0]).toBe(1);
					expect(spy.calls[6].args[0]).toBe(-2);

				}
			);
		});

	});

});
