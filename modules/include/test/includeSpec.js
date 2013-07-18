// modeled after: angular.js/test/ng/directive/ngIncludeSpec.js
describe('uiInclude', function() {
  var element;

  afterEach(function() {
    element.remove();
  });

  beforeEach(module('ui.include'));

  function putIntoCache(url, content) {
    return function($templateCache) {
      $templateCache.put(url, [200, content, {}]);
    };
  }

  it('should include on external file', inject(putIntoCache('myUrl', '{{name}}'),
      function($rootScope, $compile) {
    element = angular.element('<div ui-include src="url"></div>');
    angular.element(document.body).append(element);
    element = $compile(element)($rootScope);
    $rootScope.name = 'misko';
    $rootScope.url = 'myUrl';
    $rootScope.$digest();
    expect(element.text()).toEqual('misko');
    angular.element(document.body).html('');
  }));

  it('should work with a fragment selector', inject(putIntoCache('myUrl', '<a>foo {{name}}</a><b>bar {{name}}</b><c>baz {{name}}</c>'),
      function($rootScope, $compile) {
    element = angular.element('<div ui-include="url" fragment="\'b\'"></div>');
    angular.element(document.body).append(element);
    element = $compile(element)($rootScope);
    $rootScope.name = 'misko';
    $rootScope.url = 'myUrl';
    $rootScope.$digest();
    expect(element.text()).toEqual('bar misko');
    angular.element(document.body).html('');
  }));

});
