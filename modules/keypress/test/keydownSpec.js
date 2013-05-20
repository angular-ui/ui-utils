describe('uiKeydown', function () {

  var $scope, $compile;

  var createKeyEvent = function (mainKey, alt, ctrl, shift, meta) {
    var keyEvent = jQuery.Event("keydown");

    keyEvent.which = mainKey;
    keyEvent.keyCode = mainKey;
    keyEvent.altKey = alt;
    keyEvent.ctrlKey = ctrl;
    keyEvent.shiftKey = shift;
    keyEvent.metaKey = meta;

    return keyEvent;
  };

  var createElement = function (elementDef) {
    var elementStr = angular.isString(elementDef) ? elementDef : angular.toJson(elementDef);
    return $compile("<span ui-keydown='" + elementStr + "'></span>")($scope);
  };

  beforeEach(module('ui.keypress'));
  beforeEach(inject(function (_$rootScope_, _$compile_) {
    $compile = _$compile_;
    $scope = _$rootScope_.$new();

    $scope.cb = function (event) {
      this.event1 = event;
    };
  }));

  it('should support single key press', function () {
    createElement({'13': 'event=true'}).trigger(createKeyEvent(13));
    expect($scope.event).toBe(true);
  });

  it('should support combined key press', function () {
    createElement({'ctrl-shift-13': 'event=true'}).trigger(createKeyEvent(13, false, true, true, false));
    expect($scope.event).toBe(true);
  });
  
  it('should support alternative combinations', function () {
    $scope.event = 0;
    createElement({'ctrl-shift-14 ctrl-shift-13': 'event=event+1'}).trigger(createKeyEvent(13, false, true, true, false)).trigger(createKeyEvent(14, false, true, true, false));
    expect($scope.event).toBe(2);
  });

  it('should support multiple key press definitions', function () {
    var elm = createElement({'13': 'event1=true', 'ctrl-shift-13': 'event2=true'});

    elm.trigger(createKeyEvent(13));
    expect($scope.event1).toBe(true);

    elm.trigger(createKeyEvent(13, false, true, true, false));
    expect($scope.event2).toBe(true);
  });

  it('should handle meta key ("⌘" on OS X)', function () {
    var elm = createElement({'meta-83': 'event1=true'});

    elm.trigger(createKeyEvent(83, false, false, false, true));
    expect($scope.event1).toBe(true);
  });

  it('should support $event in expressions', function () {

    var element = createElement({'esc': 'cb($event)', '13': 'event2=$event'});

    element.trigger(createKeyEvent(27));
    expect($scope.event1.keyCode).toBe(27);

    element.trigger(createKeyEvent(13));
    expect($scope.event2.keyCode).toBe(13);
  });

  it('should support an ascii code for a text character', function() {
    var elm = createElement({'97': 'event=true'}).trigger(createKeyEvent(97));
    expect($scope.event).toBe(true);
  });

  it('should support pressing a text character', function() {
    var elm = createElement({'a': 'event=true'}).trigger(createKeyEvent(97)); // 97 is keypress code for a
    expect($scope.event).toBe(true);
  });

  it('should support an ascii code for a capital text character', function() {
    var elm = createElement({'65': 'event=true'}).trigger(createKeyEvent(65,false,false,false));
    expect($scope.event).toBe(true);
  });

  it('should support pressing shift and a text character', function() {

    var elm = createElement({'shift-a': 'event=true'}).trigger(createKeyEvent(65,false,false,true)); // 65 is keypress code for A
    expect($scope.event).toBe(true);
  });

  it('should support an ascii code for a non-text keyboard character', function() {
    var elm = createElement({'188': 'event=true'}).trigger(createKeyEvent(188));
    expect($scope.event).toBe(true);
  });

  it('should support pressing a non-text keyboard character', function() {
    var elm = createElement({',': 'event=true'}).trigger(createKeyEvent(188)); // 188 is  IE/Mozilla key code for ,
    expect($scope.event).toBe(true);
  });
});