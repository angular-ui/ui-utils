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
      scope.$apply("mask = '()_bcd---'");
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
    
    it("should set the correct value for mask 'a'", function() {
      var input = compileElement(inputHtml);
      scope.$apply("x = ''");
      scope.$apply("mask = 'a-'");
      input.val('z').triggerHandler('input');
      input.triggerHandler('blur');
      expect(input.val()).toBe('z-');
      input.val('Z').triggerHandler('input');
      input.triggerHandler('blur');
      expect(input.val()).toBe('');
    });
    
    it("should set the correct value for mask 'A'", function() {
      var input = compileElement(inputHtml);
      scope.$apply("x = ''");
      scope.$apply("mask = 'A-'");
      input.val('A').triggerHandler('input');
      input.triggerHandler('blur');
      expect(input.val()).toBe('A-');
      input.val('a').triggerHandler('input');
      input.triggerHandler('blur');
      expect(input.val()).toBe('a-');
    });
    
    it("should set the correct value for mask '9'", function() {
      var input = compileElement(inputHtml);
      scope.$apply("x = ''");
      scope.$apply("mask = '9-'");
      input.val('0').triggerHandler('input');
      input.triggerHandler('blur');
      expect(input.val()).toBe('0-');
      input.val('9').triggerHandler('input');
      input.triggerHandler('blur');
      expect(input.val()).toBe('9-');
      input.val('a').triggerHandler('input');
      input.triggerHandler('blur');
      expect(input.val()).toBe('');
    });
    
    it("should set the correct value for mask '8'", function() {
      var input = compileElement(inputHtml);
      scope.$apply("x = ''");
      scope.$apply("mask = '8-'");
      input.val('0').triggerHandler('input');
      input.triggerHandler('blur');
      expect(input.val()).toBe('0-');
      input.val('8').triggerHandler('input');
      input.triggerHandler('blur');
      expect(input.val()).toBe('8-');
      input.val('9').triggerHandler('input');
      input.triggerHandler('blur');
      expect(input.val()).toBe('');
    });
    
    it("should set the correct value for mask '7'", function() {
      var input = compileElement(inputHtml);
      scope.$apply("x = ''");
      scope.$apply("mask = '7-'");
      input.val('0').triggerHandler('input');
      input.triggerHandler('blur');
      expect(input.val()).toBe('0-');
      input.val('7').triggerHandler('input');
      input.triggerHandler('blur');
      expect(input.val()).toBe('7-');
      input.val('8').triggerHandler('input');
      input.triggerHandler('blur');
      expect(input.val()).toBe('');
    });
    
    it("should set the correct value for mask '6'", function() {
      var input = compileElement(inputHtml);
      scope.$apply("x = ''");
      scope.$apply("mask = '6-'");
      input.val('0').triggerHandler('input');
      input.triggerHandler('blur');
      expect(input.val()).toBe('0-');
      input.val('6').triggerHandler('input');
      input.triggerHandler('blur');
      expect(input.val()).toBe('6-');
      input.val('7').triggerHandler('input');
      input.triggerHandler('blur');
      expect(input.val()).toBe('');
    });
    
    it("should set the correct value for mask '5'", function() {
      var input = compileElement(inputHtml);
      scope.$apply("x = ''");
      scope.$apply("mask = '5-'");
      input.val('0').triggerHandler('input');
      input.triggerHandler('blur');
      expect(input.val()).toBe('0-');
      input.val('5').triggerHandler('input');
      input.triggerHandler('blur');
      expect(input.val()).toBe('5-');
      input.val('6').triggerHandler('input');
      input.triggerHandler('blur');
      expect(input.val()).toBe('');
    });
    
    it("should set the correct value for mask '4'", function() {
      var input = compileElement(inputHtml);
      scope.$apply("x = ''");
      scope.$apply("mask = '4-'");
      input.val('0').triggerHandler('input');
      input.triggerHandler('blur');
      expect(input.val()).toBe('0-');
      input.val('4').triggerHandler('input');
      input.triggerHandler('blur');
      expect(input.val()).toBe('4-');
      input.val('5').triggerHandler('input');
      input.triggerHandler('blur');
      expect(input.val()).toBe('');
    });
    
    it("should set the correct value for mask '3'", function() {
      var input = compileElement(inputHtml);
      scope.$apply("x = ''");
      scope.$apply("mask = '3-'");
      input.val('0').triggerHandler('input');
      input.triggerHandler('blur');
      expect(input.val()).toBe('0-');
      input.val('3').triggerHandler('input');
      input.triggerHandler('blur');
      expect(input.val()).toBe('3-');
      input.val('4').triggerHandler('input');
      input.triggerHandler('blur');
      expect(input.val()).toBe('');
    });
    
    it("should set the correct value for mask '2'", function() {
      var input = compileElement(inputHtml);
      scope.$apply("x = ''");
      scope.$apply("mask = '2-'");
      input.val('0').triggerHandler('input');
      input.triggerHandler('blur');
      expect(input.val()).toBe('0-');
      input.val('2').triggerHandler('input');
      input.triggerHandler('blur');
      expect(input.val()).toBe('2-');
      input.val('3').triggerHandler('input');
      input.triggerHandler('blur');
      expect(input.val()).toBe('');
    });
    
    it("should set the correct value for mask '1'", function() {
      var input = compileElement(inputHtml);
      scope.$apply("x = ''");
      scope.$apply("mask = '1-'");
      input.val('0').triggerHandler('input');
      input.triggerHandler('blur');
      expect(input.val()).toBe('0-');
      input.val('1').triggerHandler('input');
      input.triggerHandler('blur');
      expect(input.val()).toBe('1-');
      input.val('2').triggerHandler('input');
      input.triggerHandler('blur');
      expect(input.val()).toBe('');
    });
    
    it("should set the correct value for mask '0'", function() {
      var input = compileElement(inputHtml);
      scope.$apply("x = ''");
      scope.$apply("mask = '0-'");
      input.val('0').triggerHandler('input');
      input.triggerHandler('blur');
      expect(input.val()).toBe('0-');
      input.val('1').triggerHandler('input');
      input.triggerHandler('blur');
      expect(input.val()).toBe('');
    });
  });
  
  describe('configuration', function () {
    it("should accept the new mask definition set globally", function() {
      config.maskDefinitions['@'] = /[fz]/;
      
      var input = compileElement(inputHtml);
      
      scope.$apply("x = ''");
      scope.$apply("mask = '@123'"); 
      input.val('f012').triggerHandler('input');
      input.triggerHandler('blur');
      expect(input.val()).toBe('f012');
    });
    
    it("should accept the new mask definition set per element", function() {
      delete config.maskDefinitions['@'];

      scope.input = {
        options: {maskDefinitions: {'@': /[fz]/}}
      };
      
      var input = compileElement('<input type="text" ng-model="x" ui-mask="{{mask}}" ui-options="input.options">');
      scope.$apply("x = ''");
      scope.$apply("mask = '@123'");
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