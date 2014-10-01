describe("uiMask", function () {
  "use strict";

  var formHtml  = "<form name='test'><input name='input' ng-model='x' ui-mask='{{mask}}'></form>";
  var inputHtml = "<input name='input' ng-model='x' ui-mask='{{mask}}'>";
  var compileElement, scope, config;

  beforeEach(module("ui.mask"));
  beforeEach(inject(function ($rootScope, $compile, uiMaskConfig) {
    scope = $rootScope.$new();
    config = uiMaskConfig;
    compileElement = function(html) {
      return $compile(html)(scope);
    };
  }));

  describe("initialization", function () {

    it("should not not happen if the mask is undefined or invalid", function() {
      var input = compileElement(inputHtml);
      scope.$apply(function(){
        scope.x = "abc123";
      });
      expect(input.val()).toBe("abc123");
      scope.$apply(function(){
        scope.mask = "()_abc123";
      });
      expect(input.val()).toBe("abc123");
    });

    it("should mask the value only if it's valid", function() {
      var input = compileElement(inputHtml);
      scope.$apply(function(){
        scope.x = "abc123";
        scope.mask = "(A) * 9";
      });
      expect(input.val()).toBe("(a) b 1");
      scope.$apply(function(){
        scope.mask = "(A) * 9 A";
      });
      expect(input.val()).toBe("");
    });

    it("should not dirty or invalidate the input", function() {
      var input = compileElement(inputHtml);
      scope.$apply(function(){
        scope.x = "abc123";
        scope.mask = "(9) * A";
      });
      expect(input.hasClass("ng-pristine")).toBeTruthy();
      expect(input.hasClass("ng-valid")).toBeTruthy();
      scope.$apply(function(){
        scope.mask = "(9) * A 9";
      });
      expect(input.hasClass("ng-pristine")).toBeTruthy();
      expect(input.hasClass("ng-valid")).toBeTruthy();
    });

    it("should not change the model value", function() {
      scope.$apply(function(){
        scope.x = "abc123";
        scope.mask = "(A) * 9";
      });
      expect(scope.x).toBe("abc123");
      scope.$apply(function(){
        scope.mask = "(A) * 9 A";
      });
      expect(scope.x).toBe("abc123");
    });

    it("should set ngModelController.$viewValue to match input value", function() {
      compileElement(formHtml);
      scope.$apply(function(){
        scope.x = "abc123";
        scope.mask = "(A) * 9";
      });
      expect(scope.test.input.$viewValue).toBe("(a) b 1");
      scope.$apply(function(){
        scope.mask = "(A) * 9 A";
      });
      expect(scope.test.input.$viewValue).toBe("");
    });

  });

  describe("user input", function () {
    it("should mask-as-you-type", function() {
      var form  = compileElement(formHtml);
      var input = form.find("input");
      scope.$apply(function(){
        scope.x = "";
        scope.mask = "(A) * 9";
      });
      input.val("a").triggerHandler("input");
      expect(input.val()).toBe("(a) _ _");
      input.val("ab").triggerHandler("input");
      expect(input.val()).toBe("(a) b _");
      input.val("ab1").triggerHandler("input");
      expect(input.val()).toBe("(a) b 1");
    });

    it("should set ngModelController.$viewValue to match input value", function() {
      var form  = compileElement(formHtml);
      var input = form.find("input");
      scope.$apply(function(){
        scope.x = "";
        scope.mask = "(A) * 9";
      });
      input.val("a").triggerHandler("input");
      input.triggerHandler("change"); // Because IE8 and below are terrible
      expect(scope.test.input.$viewValue).toBe("(a) _ _");
    });

    it("should parse unmasked value to model", function() {
      var form  = compileElement(formHtml);
      var input = form.find("input");
      scope.$apply(function(){
        scope.x = "";
        scope.mask = "(A) * 9";
      });
      input.val("abc123").triggerHandler("input");
      input.triggerHandler("change"); // Because IE8 and below are terrible
      expect(scope.x).toBe("ab1");
    });

    it("should set model to undefined if masked value is invalid", function() {
      var form  = compileElement(formHtml);
      var input = form.find("input");
      scope.$apply(function(){
        scope.x = "";
        scope.mask = "(A) * 9";
      });
      input.val("a").triggerHandler("input");
      input.triggerHandler("change"); // Because IE8 and below are terrible
      expect(scope.x).toBeUndefined();
    });

    it("should not set model to an empty mask", function() {
      var form  = compileElement(formHtml);
      var input = form.find("input");
      scope.$apply(function(){
        scope.x = "";
        scope.mask = "(A) * 9";
      });
      input.triggerHandler("input");
      expect(scope.x).toBe("");
    });

    it("should not setValidity on required to false on a control that isn't required", function() {
      var
        input = compileElement("<input name='input' ng-model='x' ui-mask='{{mask}}'>"),
        ngModel = input.data("$ngModelController");

      scope.$apply(function(){
        scope.x = "";
        scope.mask = "(A) * 9";
        scope.required = true;
      });
      expect(ngModel.$error.required).toBeUndefined();
      input.triggerHandler("input");
      expect(scope.x).toBe("");
      expect(ngModel.$error.required).toBeUndefined();

      input = compileElement("<input name='input' ng-model='x' ui-mask='{{mask}}' required>");
      expect(ngModel.$error.required).toBeUndefined();
      input.triggerHandler("input");
      if (ngModel.$$success) {
        expect(ngModel.$error.required).toBeUndefined();
      } else {
        expect(ngModel.$error.required).toBe(true);
      }
      input.val("abc123").triggerHandler("input");
      expect(scope.x).toBe("ab1");
      if (ngModel.$$success) {
        expect(ngModel.$error.required).toBeUndefined();
      } else {
        expect(ngModel.$error.required).toBe(false);
      }

      input = compileElement("<input name='input' ng-model='x' ui-mask='{{mask}}' ng-required='required'>");
      expect(ngModel.$error.required).toBeUndefined();
      input.triggerHandler("input");
      if (ngModel.$$success) {
        expect(ngModel.$error.required).toBeUndefined();
      } else {
        expect(ngModel.$error.required).toBe(true);
      }
      scope.$apply(function(){
        scope.required = false;
      });
      if (ngModel.$$success) {
        expect(ngModel.$error.required).toBeUndefined();
      } else {
        expect(ngModel.$error.required).toBe(false);
      }
      input.triggerHandler("input");
      if (ngModel.$$success) {
        expect(ngModel.$error.required).toBeUndefined();
      } else {
        expect(ngModel.$error.required).toBe(false);
      }
      input.triggerHandler("focus");
      input.triggerHandler("blur");
      if (ngModel.$$success) {
        expect(ngModel.$error.required).toBeUndefined();
      } else {
        expect(ngModel.$error.required).toBe(false);
      }
      input.val("").triggerHandler("input");
      if (ngModel.$$success) {
        expect(ngModel.$error.required).toBeUndefined();
      } else {
        expect(ngModel.$error.required).toBe(false);
      }
    });
  });

  describe("changes from the model", function () {
    it("should set the correct ngModelController.$viewValue", function() {
      compileElement(formHtml);
      scope.$apply(function(){
        scope.mask = "(A) * 9";
        scope.x = "";
      });
      expect(scope.test.input.$viewValue).toBe("");
      scope.$apply(function(){
        scope.x = "abc";
      });
      expect(scope.test.input.$viewValue).toBeUndefined();
      scope.$apply(function(){
        scope.x = "abc123";
      });
      expect(scope.test.input.$viewValue).toBe("(a) b 1");
    });
  });

  describe("ngModelOptions", function(){

    it("allows invalid when option is set", function(){
      var input = compileElement("<input ng-model-options='{allowInvalid: true}' ui-mask='{{mask}}' ng-model='x'>");
      scope.$apply(function(){
        scope.x = "1 1 1";
        scope.mask = "(A) * 9";
      });
      input.triggerHandler("blur");
      expect(input.controller("ngModel").$modelValue).toBe("1 1 1");
      expect(input.controller("ngModel").$viewValue).toBe("");
    });

  });

  describe("default mask definitions", function () {
    it("should accept optional mask after '?'", function (){
      var input = compileElement(inputHtml);

      scope.$apply(function(){
        scope.x = "";
        scope.mask = "**?9";
      });

      input.val("aa").triggerHandler("input");
      input.triggerHandler("blur");
      expect(input.val()).toBe("aa_");

      input.val("99a").triggerHandler("input");
      input.triggerHandler("blur");
      expect(input.val()).toBe("99_");

      input.val("992").triggerHandler("input");
      input.triggerHandler("blur");
      expect(input.val()).toBe("992");
    });
  });

  describe("placeholders", function () {
    it("should have default placeholder functionality", function() {
      var input = compileElement(inputHtml);

      scope.$apply(function(){
        scope.x = "";
        scope.mask = "99/99/9999";
      });

      expect(input.attr("placeholder")).toBe("__/__/____");
    });

    it("should allow mask substitutions via the placeholder attribute", function() {

      var placeholderHtml = "<input name='input' ng-model='x' ui-mask='{{mask}}' placeholder='MM/DD/YYYY'>",
          input           = compileElement(placeholderHtml);

      scope.$apply(function(){
        scope.x = "";
        scope.mask = "99/99/9999";
      });

      expect(input.attr("placeholder")).toBe("MM/DD/YYYY");

      input.val("12").triggerHandler("input");

      expect(input.val()).toBe("12/DD/YYYY");
    });

    it("should update mask substitutions via the placeholder attribute", function() {

      var placeholderHtml = "<input name='input' ng-model='x' ui-mask='{{mask}}' placeholder='{{placeholder}}'>",
          input           = compileElement(placeholderHtml);

      scope.$apply(function(){
        scope.x = "";
        scope.mask = "99/99/9999";
        scope.placeholder = "DD/MM/YYYY";
      });
      expect(input.attr("placeholder")).toBe("DD/MM/YYYY");

      input.val("12").triggerHandler("input");
      expect(input.val()).toBe("12/MM/YYYY");

      scope.$apply(function(){
        scope.placeholder = "MM/DD/YYYY";
      });
      expect(input.val()).toBe("12/DD/YYYY");

      input.triggerHandler("blur");
      expect(input.attr("placeholder")).toBe("MM/DD/YYYY");
    });


  });

  describe("configuration", function () {
    it("should accept the new mask definition set globally", function() {
      config.maskDefinitions["@"] = /[fz]/;

      var input = compileElement(inputHtml);

      scope.$apply(function(){
        scope.x = "";
        scope.mask = "@193";
      });
      input.val("f123").triggerHandler("input");
      input.triggerHandler("blur");
      expect(input.val()).toBe("f123");
    });

    it("should accept the new mask definition set per element", function() {
      delete config.maskDefinitions["@"];

      scope.input = {
        options: {maskDefinitions: {"@": /[fz]/}}
      };

      var input = compileElement("<input type=\"text\" ng-model=\"x\" ui-mask=\"{{mask}}\" ui-options=\"input.options\">");
      scope.$apply(function(){
        scope.x = "";
        scope.mask = "@999";
      });
      input.val("f111").triggerHandler("input");
      input.triggerHandler("blur");
      expect(input.val()).toBe("f111");
    });
  });

  describe("blurring", function () {
    it("should clear an invalid value from the input", function() {
      var input = compileElement(inputHtml);
      scope.$apply(function(){
        scope.x = "";
        scope.mask = "(9) * A";
      });
      input.val("a").triggerHandler("input");
      input.triggerHandler("blur");
      expect(input.val()).toBe("");
    });

    it("should clear an invalid value from the ngModelController.$viewValue", function() {
      var form  = compileElement(formHtml);
      var input = form.find("input");
      scope.$apply(function(){
        scope.x = "";
        scope.mask = "(A) * 9";
      });
      input.val("a").triggerHandler("input");
      input.triggerHandler("blur");
      expect(scope.test.input.$viewValue).toBe("");
    });
  });

});
