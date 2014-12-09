/* global $: false*/
describe('\njqLite: testing against jQuery\n', function () {
	'use strict';

	var sandbox = angular.element('<div/>');

	var extras;

	beforeEach(module('ui.scroll.jqlite'));
	beforeEach(function(){
		angular.element(document).find('body').append(sandbox = angular.element('<div></div>'));
		inject(function(jqLiteExtras) {
			extras = function(){};
			jqLiteExtras.registerFor(extras);
		});
	});

	afterEach(function() {sandbox.remove();});

	describe('height() getter for window\n', function() {
		it('should work for window element', function() {
			var element = angular.element(window);
			expect(extras.prototype.height.call(element)).toBe(element.height());
		});
	});

	describe('getters height() and outerHeight()\n', function () {

		function createElement(element) {
			var result = angular.element(element);
			sandbox.append(result);
			return result;
		}

		angular.forEach(
			[
				'<div>some text</div>',
				'<div style="height:30em">some text (height in em)</div>',
				'<div style="height:30px">some text height in px</div>',
				'<div style="border-width: 3px; border-style: solid; border-color: red">some text w border</div>',
				'<div style="border-width: 3em; border-style: solid; border-color: red">some text w border</div>',
				'<div style="padding: 3px">some text w padding</div>',
				'<div style="padding: 3em">some text w padding</div>',
				'<div style="margin: 3px">some text w margin</div>',
				'<div style="margin: 3em">some text w margin</div>'
			], function(element) {

				it('should be the same as jQuery height() for ' + element, function() {
						(function(element) {
							expect(extras.prototype.height.call(element)).toBe(element.height());
						})(createElement(element));
					}
				);

				it ('should be the same as jQuery outerHeight() for ' + element, function() {
						(function(element) {
							expect(extras.prototype.outerHeight.call(element)).toBe(element.outerHeight());
						})(createElement(element));
					}
				);

				it ('should be the same as jQuery outerHeight(true) for ' + element, function() {
						(function(element) {
							expect(extras.prototype.outerHeight.call(element, true)).toBe(element.outerHeight(true));
						})(createElement(element));
					}
				);

			}

		);
	});

	describe('height(value) setter\n', function () {

		function createElement(element) {
			var result = angular.element(element);
			sandbox.append(result);
			return result;
		}

		angular.forEach(
			[
				'<div>some text</div>',
				'<div style="height:30em">some text (height in em)</div>',
				'<div style="height:30px">some text height in px</div>',
				'<div style="border-width: 3px; border-style: solid; border-color: red">some text w border</div>',
				'<div style="border-width: 3em; border-style: solid; border-color: red">some text w border</div>',
				'<div style="padding: 3px">some text w padding</div>',
				'<div style="padding: 3em">some text w padding</div>',
				'<div style="margin: 3px">some text w margin</div>',
				'<div style="margin: 3em">some text w margin</div>',
				'<div style="margin: 3pt">some text w margin</div>',
				'<div style="line-height: 1.1em">some text w line height</div>'
			], function(element) {

				it('height(value) for ' + element, function() {
						(function (element) {
							expect(extras.prototype.height.call(element)).toBe(element.height());
							var h = element.height();
							extras.prototype.height.call(element, h*2);
							expect(extras.prototype.height.call(element)).toBe(h*2);
						})(createElement(element));
					}
				);

			}

		);
	});

	describe('offset() getter\n', function () {

		function createElement(element) {
			var result = angular.element(element);
			sandbox.append(result);
			return result;
		}

		angular.forEach(
			[
				'<div><div>some text</div></div>',
				'<div style="height:30em"><div>some text (height in em)</div></div>',
//				'<div style="height:30px">some text height in px</div>',
//				'<div style="border-width: 3px; border-style: solid; border-color: red">some text w border</div>',
//				'<div style="border-width: 3em; border-style: solid; border-color: red">some text w border</div>',
//				'<div style="padding: 3px">some text w padding</div>',
//				'<div style="padding: 3em">some text w padding</div>',
//				'<div style="margin: 3px">some text w margin</div>',
				'<div style="margin: 3em"><p>some text w margin</p></div>'
			], function(element) {

				it('should be the same as jQuery offset() for ' + element, function() {
						(function (element) {
							var target = $(element.contents()[0]);
							expect(extras.prototype.offset.call(target)).toEqual(element.offset());
						})(createElement(element));
					}
				);

			}

		);
	});

	describe('scrollTop()\n', function() {

		function createElement(element) {
			var result = angular.element(element);
			sandbox.append(result);
			return result;
		}

		it('should be the same as jQuery scrollTop() for window', function() {

				createElement('<div style="height:10000px; width:10000px"></div>');
				var element = $(window);
				expect(extras.prototype.scrollTop.call(element)).toBe(element.scrollTop());
				element.scrollTop(100);
				expect(extras.prototype.scrollTop.call(element)).toBe(element.scrollTop());
				extras.prototype.scrollTop.call(element, 200);
				expect(extras.prototype.scrollTop.call(element)).toBe(element.scrollTop());
			}
		);

		it('should be the same as jQuery scrollTop() for window', function() {

				var element = createElement('<div style="height:100px; width:100px; overflow: auto"><div style="height:10000px; width:10000px"></div></div>');
				expect(extras.prototype.scrollTop.call(element)).toBe(element.scrollTop());
				element.scrollTop(100);
				expect(extras.prototype.scrollTop.call(element)).toBe(element.scrollTop());
				extras.prototype.scrollTop.call(element, 200);
				expect(extras.prototype.scrollTop.call(element)).toBe(element.scrollTop());
			}
		);

	});

});
