/*global describe, beforeEach, module, inject, it, spyOn, expect, $ */
describe('uiScroll', function () {
    'use strict';

    angular.module('ui.scroll.test', [])
        .factory('myEmptyDatasource', [
            '$log', '$timeout', '$rootScope', function() {
                return {
                    get: function(index, count, success) {
                        success([]);
                    }
                };
            }
        ])

        .factory('myOnePageDatasource', [
            '$log', '$timeout', '$rootScope', function() {
                return {
                    get: function(index, count, success) {
                        if (index === 1) {
                            success(['one', 'two', 'three']);
                        } else {
                            success([]);
                        }
                    }
                };
            }
        ])

        .factory('myMultipageDatasource', [
            '$log', '$timeout', '$rootScope', function() {
                return {
                    get: function(index, count, success) {
                        var result = [];
                        for (var i = index; i<index+count; i++) {
                            if (i>0 && i<=20)
                                result.push('item' + i);
                        }
                        success(result);
                    }
                };
            }
        ])

		.factory('AnotherDatasource', [
			'$log', '$timeout', '$rootScope', function() {
				return {
					get: function(index, count, success) {
                        var result = [];
                        for (var i = index; i<index+count; i++) {
                            if (i>-3 && i<1)
                                result.push('item' + i);
                        }
                        success(result);
                    }
				};
			}
		])

		.factory('myEdgeDatasource', [
			'$log', '$timeout', '$rootScope', function() {
				return {
					get: function(index, count, success) {
						var result = [];
						for (var i = index; i<index+count; i++) {
							if (i>-6 && i<=6)
								result.push('item' + i);
						}
						success(result);
					}
				};
			}
		])

		.factory('myDatasourceToPreventScrollBubbling', [
			'$log', '$timeout', '$rootScope', function() {
				return {
					get: function(index, count, success) {
						var result = [];
						for (var i = index; i<index+count; i++) {
							if (i<-6 || i>20) {
								break;
							}
							result.push('item' + i);
						}
						success(result);
					}
				};
			}
		]);

    beforeEach(module('ui.scroll'));
    beforeEach(module('ui.scroll.test'));

	var runTest = function(html, runTest, cleanupTest, options) {
		inject(function($rootScope, $compile, $window, $timeout) {
				var scroller = angular.element(html);
				var scope = $rootScope.$new();
				var sandbox = angular.element('<div/>');
				angular.element(document).find('body').append(sandbox);
				sandbox.append(scroller);

				$compile(scroller)(scope);
				scope.$apply();

				if(!options || !options.noFlush) {
					$timeout.flush();
				}

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
			var html = '<div ui-scroll="item in myEmptyDatasource">{{$index}}: {{item}}</div>';

				it('should bind to window scroll and resize events and unbind upon scope destroy', function(){
				spyOn($.fn, 'bind').andCallThrough();
				spyOn($.fn, 'unbind').andCallThrough();
				runTest(html,
					function($window) {
						expect($.fn.bind.calls.length).toBe(3);
						expect($.fn.bind.calls[0].args[0]).toBe('resize');
						expect($.fn.bind.calls[0].object[0]).toBe($window);
						expect($.fn.bind.calls[1].args[0]).toBe('scroll');
						expect($.fn.bind.calls[1].object[0]).toBe($window);
						expect($.fn.bind.calls[2].args[0]).toBe('mousewheel');
						expect($.fn.bind.calls[2].object[0]).toBe($window);
						expect($._data($window, 'events')).toBeDefined();
					},
					function($window) {
						expect($.fn.unbind.calls.length).toBe(3);
						expect($.fn.unbind.calls[0].args[0]).toBe('resize');
						expect($.fn.unbind.calls[0].object[0]).toBe($window);
						expect($.fn.unbind.calls[1].args[0]).toBe('scroll');
						expect($.fn.unbind.calls[1].object[0]).toBe($window);
						expect($.fn.unbind.calls[2].args[0]).toBe('mousewheel');
						expect($.fn.unbind.calls[2].object[0]).toBe($window);
					},
					{
						noFlush: true //empty data-set; nothing to render
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

					}, null, {
						noFlush: true
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

					}, null, {
						noFlush: true
					}
				);
			});
		}
	);

	describe('datasource with only 3 elements', function () {

		var html = '<div ui-scroll="item in myOnePageDatasource">{{$index}}: {{item}}</div>';

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

		it('should call get on the datasource 2 times ', function() {
			var spy;
			inject(function(myOnePageDatasource){
				spy = spyOn(myOnePageDatasource, 'get').andCallThrough();
			runTest(html,
				function() {
					expect(spy.calls.length).toBe(2);

					expect(spy.calls[0].args[0]).toBe(1);  // gets 3 rows (with eof)
					expect(spy.calls[1].args[0]).toBe(-9); // gets 0 rows (and bof)
				});
			});

		});
	});

	describe('datasource with only 3 elements (negative index)', function () {

		var html = '<div ui-scroll="item in AnotherDatasource">{{$index}}: {{item}}</div>';

		it('should create 3 divs with data (+ 2 padding divs)', function() {
			runTest(html,
				function($window, sandbox) {
					expect(sandbox.children().length).toBe(5);

					var row1 = sandbox.children()[1];
					expect(row1.tagName.toLowerCase()).toBe('div');
					expect(row1.innerHTML).toBe('-2: item-2');

					var row2 = sandbox.children()[2];
					expect(row2.tagName.toLowerCase()).toBe('div');
					expect(row2.innerHTML).toBe('-1: item-1');

					var row3 = sandbox.children()[3];
					expect(row3.tagName.toLowerCase()).toBe('div');
					expect(row3.innerHTML).toBe('0: item0');
				}
			);
		});

		it('should call get on the datasource 2 times ', function() {
			var spy;
			inject(function(AnotherDatasource){
				spy = spyOn(AnotherDatasource, 'get').andCallThrough();
				runTest(html,
					function() {
						expect(spy.calls.length).toBe(2);

						expect(spy.calls[0].args[0]).toBe(1);  // gets 0 rows (and eof)
						expect(spy.calls[1].args[0]).toBe(-9); // gets 3 rows (and bof)
					});
			});

		});
	});

	describe('datasource with 20 elements and buffer size 3 - constrained viewport', function () {

		var html = '<div ui-scroll-viewport style="height:200px"><div style="height:40px" ui-scroll="item in myMultipageDatasource" buffer-size="3">{{$index}}: {{item}}</div></div>';

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

    describe('datasource with 12 elements and buffer size 3 (fold/edge cases)', function () {

        var itemsCount = 12, buffer = 3, itemHeight = 20;
        var makeHtml = function (viewportHeight) {
            return '<div ui-scroll-viewport style="height:' + viewportHeight + 'px"><div style="height:' + itemHeight + 'px" ui-scroll="item in myEdgeDatasource" buffer-size="' + buffer + '">{{$index}}: {{item}}</div></div>';
        };

        it('[full frame] should call get on the datasource 4 (12/3) times + 2 additional times (with empty result)', function() {
            var spy;
            var viewportHeight = itemsCount * itemHeight;

            inject(function(myEdgeDatasource){
                spy = spyOn(myEdgeDatasource, 'get').andCallThrough();
            });

            runTest(makeHtml(viewportHeight),
                function() {
                    expect(spy.calls.length).toBe(parseInt(itemsCount/buffer, 10) + 2);

                    expect(spy.calls[0].args[0]).toBe(1);
                    expect(spy.calls[1].args[0]).toBe(4);
                    expect(spy.calls[2].args[0]).toBe(7);
                    expect(spy.calls[3].args[0]).toBe(-2);
                    expect(spy.calls[4].args[0]).toBe(-5);
                    expect(spy.calls[5].args[0]).toBe(-8);
                }
            );
        });

        it('[fold frame] should call get on the datasource 3 times', function() {
            var spy;
            var viewportHeight = buffer * itemHeight;

            inject(function(myEdgeDatasource){
                spy = spyOn(myEdgeDatasource, 'get').andCallThrough();
            });

            runTest(makeHtml(viewportHeight),
                function() {
                    expect(spy.calls.length).toBe(3);

                    expect(spy.calls[0].args[0]).toBe(1);
                    expect(spy.calls[1].args[0]).toBe(4);
                    expect(spy.calls[2].args[0]).toBe(-2);
                }
            );
        });

        it('[fold frame, scroll down] should call get on the datasource 1 extra time', function() {
            var spy, flush;
            var viewportHeight = buffer * itemHeight;

            inject(function (myEdgeDatasource) {
                spy = spyOn(myEdgeDatasource, 'get').andCallThrough();
            });
            inject(function ($timeout) {
                flush = $timeout.flush;
            });

            runTest(makeHtml(viewportHeight),
                function($window, sandbox) {
                    var scroller = sandbox.children();
                    scroller.scrollTop(viewportHeight + itemHeight);
                    scroller.trigger('scroll');
                    flush();
                    scroller.scrollTop(viewportHeight + itemHeight * 2);
                    scroller.trigger('scroll');
                    expect(flush).toThrow();

                    expect(spy.calls.length).toBe(4);

                    expect(spy.calls[0].args[0]).toBe(1);
                    expect(spy.calls[1].args[0]).toBe(4); //last full
                    expect(spy.calls[2].args[0]).toBe(-2);
                    expect(spy.calls[3].args[0]).toBe(5); //empty

                }
            );
        });

        it('[fold frame, scroll up] should call get on the datasource 2 extra times', function() {
            var spy, flush;
            var viewportHeight = buffer * itemHeight;

            inject(function (myEdgeDatasource) {
                spy = spyOn(myEdgeDatasource, 'get').andCallThrough();
            });
            inject(function ($timeout) {
                flush = $timeout.flush;
            });

            runTest(makeHtml(viewportHeight),
                function($window, sandbox) {
                    var scroller = sandbox.children();
                    scroller.scrollTop(0); //first full, scroll to -2
                    scroller.trigger('scroll');
                    flush();
                    scroller.scrollTop(0); //last full, scroll to -5, bof is reached
                    scroller.trigger('scroll');
                    expect(flush).toThrow();
                    scroller.scrollTop(0); //empty, no scroll occured (-8)
                    scroller.trigger('scroll');
                    expect(flush).toThrow();

                    expect(spy.calls.length).toBe(5);

                    expect(spy.calls[0].args[0]).toBe(1);
                    expect(spy.calls[1].args[0]).toBe(4);
                    expect(spy.calls[2].args[0]).toBe(-2); //first full
                    expect(spy.calls[3].args[0]).toBe(-5); //last full
                    expect(spy.calls[4].args[0]).toBe(-8); //empty

                }
            );
        });

    });


    describe('prevent unwanted scroll bubbling', function () {

        var commonHtml = '<div ui-scroll-viewport style="width: 400px; height: 300px; display: block; background-color: white;"><ul><li ui-scroll="item in myDatasourceToPreventScrollBubbling" buffer-size="3">{{$index}}: {{item}}</li></ul></div>';
        var documentScrollBubblingCount = 0;
        var incrementDocumentScrollCount = function(event) {
            event = event.originalEvent || event;
            if(!event.defaultPrevented) {
                documentScrollBubblingCount++;
            }
        };
        var getNewWheelEvent = function () {
            var event = document.createEvent('MouseEvents');
            event.initEvent('mousewheel', true, true);
            event.wheelDelta = 120;
            return event;
        };

        it('should prevent wheel-event bubbling until bof is reached', function() {
            var spy, flush;

            inject(function (myDatasourceToPreventScrollBubbling) {
                spy = spyOn(myDatasourceToPreventScrollBubbling, 'get').andCallThrough();
            });
            inject(function ($timeout) {
                flush = $timeout.flush;
            });

            runTest(commonHtml,
                function($window, sandbox) {
                    var scroller = sandbox.children();
                    var wheelEventElement = scroller[0];

                    angular.element(document.body).bind('mousewheel', incrementDocumentScrollCount); //spy for wheel-events bubbling

                    //simulate multiple wheel-scroll events within viewport

                    wheelEventElement.dispatchEvent(getNewWheelEvent()); //preventDefault will not occurred but document will not scroll because of viewport will be scrolled
                    expect(documentScrollBubblingCount).toBe(1);

                    scroller.scrollTop(0);
                    scroller.trigger('scroll');

                    wheelEventElement.dispatchEvent(getNewWheelEvent()); //now we are at top but preventDefault will occur because of bof will be reached only after next scroll trigger
                    expect(documentScrollBubblingCount).toBe(1); //here! the only one prevented wheel-event

                    flush();

                    wheelEventElement.dispatchEvent(getNewWheelEvent()); //preventDefault will not occurred but document will not scroll because of viewport will be scrolled
                    expect(documentScrollBubblingCount).toBe(2);

                    scroller.scrollTop(0);
                    scroller.trigger('scroll'); //bof will be reach here

                    wheelEventElement.dispatchEvent(getNewWheelEvent()); //preventDefault will not occurred because we are at top and bof is reached
                    expect(documentScrollBubblingCount).toBe(3);

                    expect(flush).toThrow(); //there is no new data, bof is reached

                    wheelEventElement.dispatchEvent(getNewWheelEvent()); //preventDefault will not occurred because we are at top and bof is reached
                    expect(documentScrollBubblingCount).toBe(4);

                }, function() {
                    angular.element(document.body).unbind('mousewheel', incrementDocumentScrollCount);
                }
            );

        });
    });

});