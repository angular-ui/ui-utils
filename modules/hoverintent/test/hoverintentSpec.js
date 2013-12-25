/*global describe, beforeEach, module, inject, it, spyOn, expect, jasmine, $ */
describe('hoverIntent', function(){
  var $compile, $rootScope, $timeout, element;

  beforeEach(module('ngMock', 'ui.hoverintent'));
  beforeEach(inject(function(_$compile_, _$rootScope_, _$timeout_){
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $timeout = _$timeout_;
    $rootScope.eventHandler = jasmine.createSpy('eventHandler');
  }));

  describe('when called without delay', function(){
    beforeEach(function(){
      element = $compile('<div ui-hoverintent="eventHandler()"></div>')($rootScope);
      $rootScope.$digest();
    });

    it('should call the eventHandler when the element is hovered for 500ms', function(){
      element.trigger('mouseenter');
      $timeout.flush(500);
      expect($rootScope.eventHandler).toHaveBeenCalled();
    });

    it('should call the eventHandler when the element is hovered for less than 500ms', function(){
      element.trigger('mouseenter');
      $timeout.flush(400);
      element.trigger('mouseleave');
      //$timeout.verifyNoPendingTasks();
      expect($rootScope.eventHandler).not.toHaveBeenCalled();
    });
  });

  describe('when called with delay', function(){
    beforeEach(function(){
      element = $compile('<div ui-hoverintent="eventHandler()" ui-hoverintent-delay="800"></div>')($rootScope);
      $rootScope.$digest();
    });

    it('should call the eventHandler when the element is hovered for 800ms', function(){
      element.trigger('mouseenter');
      $timeout.flush(800);
      expect($rootScope.eventHandler).toHaveBeenCalled();
    });

    it('should call the eventHandler when the element is hovered for less than 800', function(){
      element.trigger('mouseenter');
      $timeout.flush(700);
      element.trigger('mouseleave');
      //$timeout.verifyNoPendingTasks();
      expect($rootScope.eventHandler).not.toHaveBeenCalled();
    });
  });

  describe('when called with resetonclick', function(){
    beforeEach(function(){
      element = $compile('<div ui-hoverintent="eventHandler()" ui-hoverintent-resetonclick></div>')($rootScope);
      $rootScope.$digest();
    });

    it('should trigger normally when the element isn\'t clicked.', function(){
      element.trigger('mouseenter');
      $timeout.flush(400);
      $timeout.flush(100);
      expect($rootScope.eventHandler).toHaveBeenCalled();
    });

    it('should reset the delay timer, when the element is clicked', function(){
      element.trigger('mouseenter');
      $timeout.flush(400);
      element.trigger('click');
      $timeout.flush(100);
      expect($rootScope.eventHandler).not.toHaveBeenCalled();
      $timeout.flush(500);
      expect($rootScope.eventHandler).toHaveBeenCalled();
    });
  });
});