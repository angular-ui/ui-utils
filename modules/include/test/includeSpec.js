// modeled after: angular.js/test/ng/directive/ngIncludeSpec.js
describe('uiInclude', function() {
  'use strict';

  var scope, $compile, $templateCache, element;

  afterEach(function() {
    element.remove();
  });

  beforeEach(module('ui.include'));
  beforeEach(inject(function (_$rootScope_, _$compile_, _$templateCache_ ) {
    scope = _$rootScope_.$new();
    $compile = _$compile_;
    $templateCache = _$templateCache_;
  }));

  function putIntoCache(url, content) {
    $templateCache.put(url, [200, content, {}]);
  }

  it('should include on external file', function () {
    putIntoCache('myUrl', '{{name}}');
    element = $compile('<div ui-include src="\'myUrl\'"></div>')(scope);
    scope.$apply('name = "misko"');
    expect(element.text()).toEqual('misko');
  });

  it('should work with a fragment selector', function () {
    putIntoCache('myUrl', '<a>foo {{name}}</a><b>bar {{name}}</b><c>baz {{name}}</c>');
    element = $compile('<div ui-include src="\'myUrl\'" fragment="\'b\'"></div>')(scope);
    scope.$apply('name = "misko"');
    expect(element.text()).toEqual('bar misko');
  });

});
