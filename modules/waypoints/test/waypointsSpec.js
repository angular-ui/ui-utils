/*global describe, beforeEach, module, inject, it, spyOn, expect, $ */
describe('uiWaypoints', function () {
  'use strict';

  var scope, $compile, $window, $body, $container;
  beforeEach(module('ui.waypoints'));
  beforeEach(inject(function (_$rootScope_, _$compile_, _$window_) {
    scope = _$rootScope_.$new();
    $compile = _$compile_;
    $window = _$window_;
    $body = angular.element("body");
    $body.empty();
    $container = angular.element('<div id="container"></div>');
    $body.append($container);
  }));

  describe('compiling this directive', function () {
    it('should bind to window "scroll" event', function () {
      spyOn($.fn, 'bind');
      scope.f = function() {};
      $compile('<div ui-waypoints="f"></div>')(scope);
      expect($.fn.bind).toHaveBeenCalled();
      expect($.fn.bind.mostRecentCall.args[0]).toBe('scroll');
    });
  });
  describe('scrolling the window', function () {
    it('should trigger function if a function call is specified', function () {
      scope.f = function(){
        return "A";
      };

      spyOn(scope, 'f');

      // Test Fixture
      var element = angular.element('<div style="height:1500px"></div><div id="test1" ui-waypoints="f"></div><div style="height:1500px">');
      $container.append(element);
      $compile($body.contents())(scope);
      var $fixture = angular.element("#test1");

      // Scroll the window to the test element
      angular.element($window).scrollTop($fixture.offset().top + 1);

      // TODO: Is there a way to synchronously wait for the scroll event to be fired by the browser here?
      // Need to trigger it myself in the meantime
      angular.element($window).trigger('scroll');
      expect(scope.f).toHaveBeenCalled();
    });

    it('should call the enter function when the window transitions from above to below the element', function () {
      scope.enter = function(){};
      spyOn(scope, 'enter');

      // Test Fixture
      var element = angular.element('<div><div style="height:1500px"></div><div id="test2" ui-waypoints="{\'enter\': enter}"></div><div style="height:1500px"></div>');
      $container.append(element);
      $compile($body.contents())(scope);
      var $fixture = angular.element("#test2");

      // Scroll past
      angular.element($window).scrollTop($fixture.offset().top + 50);
      angular.element($window).trigger('scroll');

      
      expect(scope.enter).toHaveBeenCalledWith("down", $fixture[0]);
    });

    it('should call the exit function when the window transitions from below to above the element', function () {
      scope.g = function(){};
      spyOn(scope, 'g');

      // Test Fixture
      var element = angular.element('<div style="height:1500px"></div><div id="test3" ui-waypoints="{\'exit\': g}"></div><div style="height:1500px">');
      $container.append(element);
      $compile($body.contents())(scope);
      var $fixture = angular.element("#test3");

      // Scroll past
      angular.element($window).scrollTop($fixture.offset().top + 50);
      angular.element($window).trigger('scroll');

      // Scroll back before
      angular.element($window).scrollTop($fixture.offset().top - 50);
      angular.element($window).trigger('scroll');


      expect(scope.g).toHaveBeenCalledWith("up", $fixture[0]);
    });

    it('should call the enter function when the window transitions from left to right of element', function () {
      scope.f = function(){};
      spyOn(scope, 'f');

      // Test Fixture
      var element = angular.element('<div style="white-space: nowrap; width:4000px;"><span style="height:10px; width:1300px; display: inline-block;">Test1</span><span id="test4" ui-waypoints="{\'enter\': f}" style="display:inline-block; width:1200px; height: 10px">Test2</span></div>');
      $container.append(element);
      $compile($body.contents())(scope);
      var $fixture = angular.element("#test4");

      // Scroll past
      angular.element($window).scrollLeft($fixture.offset().left + 50);
      angular.element($window).trigger('scroll');
      
      expect(scope.f).toHaveBeenCalledWith('right', $fixture[0]);
    });

    it('should respect the offset parameter in the vertical direction', function () {
      scope.g = function(){};
      spyOn(scope, 'g');
      scope.waypoints = {
        enter: scope.g,
        offset: {
          vertical: "+100"
        }
      };

      // Test Fixture
      var element = angular.element('<div style="height:1200px"></div><div id="test5" ui-waypoints="waypoints"></div><div style="height:1200px"></div>');
      $container.append(element);
      $compile($body.contents())(scope);
      var $fixture = angular.element("#test5");

      // Scroll past, but not enough to trigger given the offset
      angular.element($window).scrollTop($fixture.offset().top + 50);
      angular.element($window).trigger('scroll');
      expect(scope.g).not.toHaveBeenCalled();

      // Now scroll past enough to trigger
      angular.element($window).scrollTop($fixture.offset().top + 200);
      angular.element($window).triggerHandler('scroll');
      expect(scope.g).toHaveBeenCalledWith('down', $fixture[0]);
    });

    it('should respect the offset parameter in the horizontal direction', function () {
      scope.g = function(){};
      spyOn(scope, 'g');
      scope.waypoints = {
        enter: scope.g,
        offset: {
          horizontal: "-100"
        }
      };

      // Test Fixture
      var element = angular.element('<div style="white-space: nowrap; width:4000px;"><span style="height:10px; width:1300px; display: inline-block;">Test1</span><span id="test6" ui-waypoints="waypoints" style="display:inline-block; width:1200px; height: 10px">Test2</span></div>');
      $container.append(element);
      $compile($body.contents())(scope);
      var $fixture = angular.element("#test6");

      // Scroll past, but not enough to trigger given the offset
      angular.element($window).scrollLeft($fixture.offset().left - 150);
      angular.element($window).trigger('scroll');
      expect(scope.g).not.toHaveBeenCalled();

      // Now scroll past enough to trigger
      angular.element($window).scrollLeft($fixture.offset().left - 99);
      angular.element($window).trigger('scroll');
      expect(scope.g).toHaveBeenCalledWith('right', $fixture[0]);
    });

    it('should assign the "addClass" class to the element when it is specified', function () {

      // Test Fixture
      var element = angular.element('<div style="height:1500px"></div><div id="test3" ui-waypoints="\'test-class\'"></div><div style="height:1500px">');
      $container.append(element);
      $compile($body.contents())(scope);
      var $fixture = angular.element("#test3");

      // Scroll past
      angular.element($window).scrollTop($fixture.offset().top + 50);
      angular.element($window).trigger('scroll');
      expect(element.hasClass('test-class')).toBe(true);


      // Scroll back before
      angular.element($window).scrollTop($fixture.offset().top - 50);
      angular.element($window).trigger('scroll');
      expect(element.hasClass('test-class')).toBe(false);
    });

    it('should assign the "addClass" class to the element when it is specified using full options syntax', function () {
      scope.waypoints = {
        addClass: 'test-class2'
      };

      // Test Fixture
      var element = angular.element('<div style="height:1500px"></div><div id="test3" ui-waypoints="waypoints"></div><div style="height:1500px">');
      $container.append(element);
      $compile($body.contents())(scope);
      var $fixture = angular.element("#test3");

      // Scroll past
      angular.element($window).scrollTop($fixture.offset().top + 50);
      angular.element($window).trigger('scroll');
      expect(element.hasClass('test-class2')).toBe(true);


      // Scroll back before
      angular.element($window).scrollTop($fixture.offset().top - 50);
      angular.element($window).trigger('scroll');
      expect(element.hasClass('test-class2')).toBe(false);
    });

    it('should assign the "ui-scrollfix" class to the element when no arguments are passed to ', function () {
      scope.waypoints = {
        addClass: 'test-class2'
      };

      // Test Fixture
      var element = angular.element('<div style="height:1500px"></div><div id="test3" ui-waypoints=""></div><div style="height:1500px">');
      $container.append(element);
      $compile($body.contents())(scope);
      var $fixture = angular.element("#test3");

      // Scroll past
      angular.element($window).scrollTop($fixture.offset().top + 50);
      angular.element($window).trigger('scroll');
      expect(element.hasClass('ui-scrollfix')).toBe(true);


      // Scroll back before
      angular.element($window).scrollTop($fixture.offset().top - 50);
      angular.element($window).trigger('scroll');
      expect(element.hasClass('ui-scrollfix')).toBe(false);
    });

    it('should treat arguments that start with + as offset specification for ui-scrollfix functionality', function () {
      scope.waypoints = {
        addClass: 'test-class2'
      };

      // Test Fixture
      var element = angular.element('<div style="height:1500px"></div><div id="test3" ui-waypoints="+100"></div><div style="height:1500px">');
      $container.append(element);
      $compile($body.contents())(scope);
      var $fixture = angular.element("#test3");

      // Scroll past
      angular.element($window).scrollTop($fixture.offset().top + 101);
      angular.element($window).trigger('scroll');
      expect(element.hasClass('ui-scrollfix')).toBe(true);


      // Scroll back before
      angular.element($window).scrollTop($fixture.offset().top + 99);
      angular.element($window).trigger('scroll');
      expect(element.hasClass('ui-scrollfix')).toBe(false);
    });

    it('should treat arguments that start with - as offset specification for ui-scrollfix functionality', function () {
      scope.waypoints = {
        addClass: 'test-class2'
      };

      // Test Fixture
      var element = angular.element('<div style="height:1500px"></div><div id="test3" ui-waypoints="-100"></div><div style="height:1500px">');
      $container.append(element);
      $compile($body.contents())(scope);
      var $fixture = angular.element("#test3");

      // Scroll past
      angular.element($window).scrollTop($fixture.offset().top +101);
      angular.element($window).trigger('scroll');
      expect(element.hasClass('ui-scrollfix')).toBe(true);


      // Scroll back before
      angular.element($window).scrollTop($fixture.offset().top - 101);
      angular.element($window).trigger('scroll');
      expect(element.hasClass('ui-scrollfix')).toBe(false);
    });

    it('should treat numeric arguments as offset specification for ui-scrollfix functionality', function () {
      scope.waypoints = {
        addClass: 'test-class2'
      };

      // Test Fixture
      var element = angular.element('<div style="height:1500px"></div><div id="test3" ui-waypoints="100"></div><div style="height:1500px">');
      $container.append(element);
      $compile($body.contents())(scope);
      var $fixture = angular.element("#test3");

      // Scroll past
      angular.element($window).scrollTop($fixture.offset().top +101);
      angular.element($window).trigger('scroll');
      expect(element.hasClass('ui-scrollfix')).toBe(true);


      // Scroll back before
      angular.element($window).scrollTop($fixture.offset().top +99);
      angular.element($window).trigger('scroll');
      expect(element.hasClass('ui-scrollfix')).toBe(false);
    });

  });
});
