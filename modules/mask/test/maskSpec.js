describe('uiMask', function () {

  var formHtml  = "<form name='test'><input name='input' ng-model='x' ui-mask='{{mask}}'></form>";
  var inputHtml = "<input name='input' ng-model='x' ui-mask='{{mask}}'>";
  var compileElement, scope, config;

  beforeEach(module('ui.mask'));
  beforeEach(inject(function ($rootScope, $compile, uiMaskConfig) {
    c = console.log;
    scope = $rootScope; 
    config = uiMaskConfig;
    compileElement = function(html) {
      return $compile(html)(scope);
    };
  }));

  describe('initialization', function () {

    it("should not not happen if the mask is undefined or invalid", function() {
      var input = compileElement(inputHtml);
      scope.$apply("x = 'abc123'");
      expect(input.val()).toBe('abc123');
      scope.$apply("mask = '()_abc123'");
      expect(input.val()).toBe('abc123');
    });

    it("should mask the value only if it's valid", function() {
      var input = compileElement(inputHtml);
      scope.$apply("x = 'abc123'");
      scope.$apply("mask = '(A) * 9'");
      expect(input.val()).toBe('(a) b 1');
      scope.$apply("mask = '(A) * 9 A'");
      expect(input.val()).toBe('');
    });

    it("should not dirty or invalidate the input", function() {
      var input = compileElement(inputHtml);
      scope.$apply("x = 'abc123'");
      scope.$apply("mask = '(9) * A'");
      expect(input.hasClass('ng-pristine ng-valid')).toBeTruthy();
      scope.$apply("mask = '(9) * A 9'");
      expect(input.hasClass('ng-pristine ng-valid')).toBeTruthy();
    });

    it("should not change the model value", function() {
      var input = compileElement(inputHtml);
      scope.$apply("x = 'abc123'");
      scope.$apply("mask = '(A) * 9'");
      expect(scope.x).toBe('abc123');
      scope.$apply("mask = '(A) * 9 A'");
      expect(scope.x).toBe('abc123');
    });

    it("should set ngModelController.$viewValue to match input value", function() {
      var form  = compileElement(formHtml);
      var input = form.find('input');
      scope.$apply("x = 'abc123'");
      scope.$apply("mask = '(A) * 9'");
      expect(scope.test.input.$viewValue).toBe('(a) b 1');
      scope.$apply("mask = '(A) * 9 A'");
      expect(scope.test.input.$viewValue).toBe('');
    });

  });

  describe('user input', function () {
    it("should mask-as-you-type", function() {
      var form  = compileElement(formHtml);
      var input = form.find('input');
      scope.$apply("x = ''");
      scope.$apply("mask = '(A) * 9'");
      input.val('a').triggerHandler('input');
      expect(input.val()).toBe('(a) _ _');
      input.val('ab').triggerHandler('input');
      expect(input.val()).toBe('(a) b _');
      input.val('ab1').triggerHandler('input');
      expect(input.val()).toBe('(a) b 1');
    });

    it("should set ngModelController.$viewValue to match input value", function() {
      var form  = compileElement(formHtml);
      var input = form.find('input');
      scope.$apply("x = ''");
      scope.$apply("mask = '(A) * 9'");
      input.val('a').triggerHandler('input');
      input.triggerHandler('change'); // Because IE8 and below are terrible
      expect(scope.test.input.$viewValue).toBe('(a) _ _');
    });

    it("should parse unmasked value to model", function() {
      var form  = compileElement(formHtml);
      var input = form.find('input');
      scope.$apply("x = ''");
      scope.$apply("mask = '(A) * 9'");
      input.val('abc123').triggerHandler('input');
      input.triggerHandler('change'); // Because IE8 and below are terrible
      expect(scope.x).toBe('ab1');
    });

    it("should set model to undefined if masked value is invalid", function() {
      var form  = compileElement(formHtml);
      var input = form.find('input');
      scope.$apply("x = ''");
      scope.$apply("mask = '(A) * 9'");
      input.val('a').triggerHandler('input');
      input.triggerHandler('change'); // Because IE8 and below are terrible
      expect(scope.x).toBeUndefined();
    });
    
    it("should not set model to an empty mask", function() {
      var form  = compileElement(formHtml);
      var input = form.find('input');
      scope.$apply("x = ''");
      scope.$apply("mask = '(A) * 9'");
      input.triggerHandler('input');
      expect(scope.x).toBe('');
    });
  });

  describe('changes from the model', function () {
    it("should set the correct ngModelController.$viewValue", function() {
      var form  = compileElement(formHtml);
      var input = form.find('input');
      scope.$apply("mask = '(A) * 9'");
      scope.$apply("x = ''");
      expect(scope.test.input.$viewValue).not.toBeDefined();
      scope.$apply("x = 'abc'");
      expect(scope.test.input.$viewValue).not.toBeDefined();
      scope.$apply("x = 'abc123'");
      expect(scope.test.input.$viewValue).toBe('(a) b 1');
    });
  });
  
  describe('default mask definitions', function () {
    it("should accept optional mask after '?'", function (){
      var input = compileElement(inputHtml);

      scope.$apply("x = ''");
      scope.$apply("mask = '**?9'");

      input.val('aa').triggerHandler('input');
      input.triggerHandler('blur');
      expect(input.val()).toBe('aa_');

      input.val('99a').triggerHandler('input');
      input.triggerHandler('blur');
      expect(input.val()).toBe('99_');

      input.val('992').triggerHandler('input');
      input.triggerHandler('blur');
      expect(input.val()).toBe('992');
    });
  });
  
  describe('configuration', function () {
    it("should accept the new mask definition set globally", function() {
      config.maskDefinitions['@'] = /[fz]/;
      
      var input = compileElement(inputHtml);
      
      scope.$apply("x = ''");
      scope.$apply("mask = '@193'"); 
      input.val('f123').triggerHandler('input');
      input.triggerHandler('blur');
      expect(input.val()).toBe('f123');
    });
    
    it("should accept the new mask definition set per element", function() {
      delete config.maskDefinitions['@'];

      scope.input = {
        options: {maskDefinitions: {'@': /[fz]/}}
      };
      
      var input = compileElement('<input type="text" ng-model="x" ui-mask="{{mask}}" ui-options="input.options">');
      scope.$apply("x = ''");
      scope.$apply("mask = '@999'");
      input.val('f111').triggerHandler('input');
      input.triggerHandler('blur');
      expect(input.val()).toBe('f111');
    });
  });

  describe('blurring', function () {
    it("should clear an invalid value from the input", function() {
      var input = compileElement(inputHtml);
      scope.$apply("x = ''");
      scope.$apply("mask = '(9) * A'");
      input.val('a').triggerHandler('input');
      input.triggerHandler('blur');
      expect(input.val()).toBe('');
    });

    it("should clear an invalid value from the ngModelController.$viewValue", function() {
      var form  = compileElement(formHtml);
      var input = form.find('input');
      scope.$apply("x = ''");
      scope.$apply("mask = '(A) * 9'");
      input.val('a').triggerHandler('input');
      input.triggerHandler('blur');
      expect(scope.test.input.$viewValue).toBe('');
    });
  });

});