// modeled after: angular.js/test/ng/directive/ngIncludeSpec.js
describe('uiInclude', function () {
  var scope, $compile, $templateCache, element;

  afterEach(function () {
    if(element){
      element.remove();
    }
  });

  beforeEach(module('ui.include'));
  beforeEach(inject(function (_$rootScope_, _$compile_, _$templateCache_) {
    scope = _$rootScope_.$new();
    $compile = _$compile_;
    $templateCache = _$templateCache_;
  }));

  function putIntoCache(url, content) {
    $templateCache.put(url, content);
  }

  describe('should watch', function () {
    beforeEach(function () {
      spyOn(scope, '$watch');
    });

    it('nothing', function () {
      $compile('<ui-include></ui-include>')(scope);
      $compile('<ui-include src></ui-include>')(scope);
      $compile('<ui-include fragment="\'b\'"></ui-include>')(scope);
      expect(scope.$watch).not.toHaveBeenCalled();
    });

    it('the src attributes', function () {
      $compile('<ui-include src="fooUrl"></ui-include>')(scope);
      expect(scope.$watch.callCount).toEqual(1);
      expect(scope.$watch).toHaveBeenCalledWith('fooUrl', jasmine.any(Function));
    });

    it('the src and fragment attributes', function () {
      $compile('<ui-include src="foo.html" fragment="\'b\'"></ui-include>')(scope);
      expect(scope.$watch.callCount).toEqual(2);
      expect(scope.$watch).toHaveBeenCalledWith('foo.html', jasmine.any(Function));
      expect(scope.$watch).toHaveBeenCalledWith('\'b\'', jasmine.any(Function));
    });

  });

  it('should include on external file', function () {
    putIntoCache('myUrl', '{{name}}');
    element = $compile('<div ui-include src="\'myUrl\'"></div>')(scope);
    scope.$apply("name = 'misko'");
    expect(element.text()).toEqual('misko');
  });

  it('should dynamically include on external file', function () {
    putIntoCache('fooUrl', 'foo {{name}}');
    putIntoCache('barUrl', 'bar {{name}}');
    element = $compile('<div ui-include src="url"></div>')(scope);
    angular.extend(scope, {name: 'misko', url: 'fooUrl'});
    scope.$apply();
    expect(element.text()).toEqual('foo misko');
    scope.$apply("url = 'barUrl'");
    expect(element.text()).toEqual('bar misko');
  });

  it('should work with a fragment selector', function () {
    putIntoCache('myUrl', '<a>foo {{name}}</a><b>bar {{name}}</b><c>baz {{name}}</c>');
    element = $compile('<div ui-include src="\'myUrl\'" fragment="\'b\'"></div>')(scope);
    scope.$apply("name = 'misko'");
    expect(element.text()).toEqual('bar misko');
  });

  it('should work dynamically with a fragment selector', function () {
    putIntoCache('myUrl', '<a>foo {{name}}</a><b>bar {{name}}</b><c>baz {{name}}</c>');
    element = $compile('<div ui-include src="\'myUrl\'" fragment="foo"></div>')(scope);
    angular.extend(scope, {name: 'misko', foo: 'b'});
    scope.$apply();
    expect(element.text()).toEqual('bar misko');
    scope.$apply("foo = 'a'");
    expect(element.text()).toEqual('foo misko');
  });

});
