/*global describe, beforeEach, module, inject, it, spyOn, expect, $ */
describe('uiScrollfix', function () {
  'use strict';

  var scope, $compile, $window;
  beforeEach(module('ui.scrollfix'));
  beforeEach(inject(function (_$rootScope_, _$compile_, _$window_) {
    scope = _$rootScope_.$new();
    $compile = _$compile_;
    $window = _$window_;
  }));

  describe('compiling this directive', function () {
    it('should bind and unbind to window "scroll" event in the absence of a uiScrollfixTarget', function () {
      spyOn($.fn, 'on').andCallThrough();
      $compile('<div ui-scrollfix="100"></div>')(scope);
      expect($.fn.on).toHaveBeenCalled();
      expect($.fn.on.mostRecentCall.args[0]).toBe('scroll');
      expect($._data($window, 'events')).toBeDefined();
      expect($._data($window, 'events').scroll.length).toBe(1);
      // Event must un-bind to prevent memory leaks
      spyOn($.fn, 'off').andCallThrough();
      scope.$destroy();
      expect($.fn.off).toHaveBeenCalled();
      expect($.fn.off.mostRecentCall.args[0]).toBe('scroll');
      expect($._data($window, 'events')).toBeUndefined();
    });
    it('should bind and unbind to a parent uiScrollfixTarget element "scroll" event', function() {
      var $elm = $compile('<div ui-scrollfix-target><div ui-scrollfix="100"></div></div>')(scope);
      expect($._data($window, 'events')).toBeUndefined();
      expect($._data($elm[0], 'events')).toBeDefined();
      expect($._data($elm[0], 'events').scroll.length).toBe(1);
      // Event must un-bind to prevent memory leaks
      scope.$destroy();
      expect($._data($elm[0], 'events')).toBeUndefined();
    });
  });
  describe('scrolling the window', function () {
    it('should add the ui-scrollfix class if the offset is greater than specified', function () {
      var element = $compile('<div ui-scrollfix="-100"></div>')(scope);
      angular.element($window).trigger('scroll');
      expect(element.hasClass('ui-scrollfix')).toBe(true);
    });
    it('should remove the ui-scrollfix class if the offset is less than specified (using absolute coord)', function () {
      var element = $compile('<div ui-scrollfix="100" class="ui-scrollfix"></div>')(scope);
      angular.element($window).trigger('scroll');
      expect(element.hasClass('ui-scrollfix')).toBe(false);

    });
    it('should remove the ui-scrollfix class if the offset is less than specified (using relative coord)', function () {
      var element = $compile('<div ui-scrollfix="+100" class="ui-scrollfix"></div>')(scope);
      angular.element($window).trigger('scroll');
      expect(element.hasClass('ui-scrollfix')).toBe(false);
    });
  });
  describe('scrolling the target', function() {
    var target, element;
    beforeEach(function() {
      target = $compile('<div style="height:100px;overflow:auto;" ui-scrollfix-target><div ui-scrollfix="100"></div><div style="height: 400px;"></div></div>')(scope);
      element = target.find('[ui-scrollfix]');
      target.appendTo('body');
    });
    afterEach(function() {
      target.remove();
    });
    it('should get scroll position from target', function() {
      target[0].scrollTop = 150;
      //force firing scroll event
      target.trigger('scroll');
      expect(element.hasClass('ui-scrollfix')).toBe(true);
    });
  });
});
